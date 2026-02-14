import json
import logging
import os
import re
from typing import Any, Dict, Optional
from urllib.parse import urlencode

import httpx
from fastapi import APIRouter, Header, HTTPException
from pydantic import BaseModel, Field

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/lead-router", tags=["lead-router"])

GEOCODE_URL = "https://maps.googleapis.com/maps/api/geocode/json"
STATIC_MAP_URL = "https://maps.googleapis.com/maps/api/staticmap"
OPENAI_CHAT_URL = "https://api.openai.com/v1/chat/completions"
DEFAULT_OPENAI_MODEL = "gpt-4.1-mini"

A_TEMPLATE = (
    "Hi {first_name} - to speed up your estimate, use this fence planner link: {link}. "
    "Draw your desired fence line and submit when done. If easier, we can also do this "
    "with you by phone in about 5 minutes."
)
B_TEMPLATE = (
    "Hi {first_name} - your lot is in a newer section, so the planner may not show your "
    "exact home yet. Please open this link: {link}, move to a nearby completed home, and draw "
    "your fence there as an example. We will adjust it to your lot before final pricing."
)
C_TEMPLATE = (
    "Hi {first_name} - satellite view for your area is still too limited for accurate self-draw. "
    "No problem - we can prepare your estimate directly from your lot details and preferred fence "
    "style. Send your preferred fence type and any known footage, and we will take it from here."
)
MOBILE_LINE = (
    ' If the map is hard to use on your phone, reply "DESKTOP" and we will text you a '
    "desktop-first link plus quick steps."
)

MOBILE_TROUBLE_PATTERN = re.compile(
    r"\b(desktop|mobile|phone|not working|hard|difficult|freeze|stuck|loading)\b",
    re.IGNORECASE,
)


class LeadWebhookPayload(BaseModel):
    leadId: Optional[str] = None
    contactId: Optional[str] = None
    firstName: Optional[str] = None
    lastName: Optional[str] = None
    fullName: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    address: str
    locationId: Optional[str] = None


class InboundSmsPayload(BaseModel):
    contactId: str
    message: str = Field(min_length=1)
    phone: Optional[str] = None
    locationId: Optional[str] = None


def _env_bool(name: str, default: bool = False) -> bool:
    val = os.getenv(name)
    if val is None:
        return default
    return val.strip().lower() in {"1", "true", "yes", "y", "on"}


def _require_webhook_secret(given_secret: Optional[str]) -> None:
    required = os.getenv("LEAD_ROUTER_WEBHOOK_SECRET")
    if not required:
        return
    if given_secret != required:
        raise HTTPException(status_code=401, detail="Invalid webhook secret")


def _maps_key() -> str:
    key = os.getenv("GOOGLE_MAPS_API_KEY")
    if not key:
        raise HTTPException(status_code=500, detail="Missing GOOGLE_MAPS_API_KEY")
    return key


def _openai_key() -> str:
    key = os.getenv("OPENAI_API_KEY")
    if not key:
        raise HTTPException(status_code=500, detail="Missing OPENAI_API_KEY")
    return key


def _ghl_headers() -> Dict[str, str]:
    token = os.getenv("GHL_API_KEY")
    if not token:
        raise HTTPException(status_code=500, detail="Missing GHL_API_KEY")
    return {
        "Authorization": f"Bearer {token}",
        "Accept": "application/json",
        "Content-Type": "application/json",
        "Version": "2021-07-28",
        "User-Agent": "asap-fence-backend/1.0",
    }


def _ghl_base_url() -> str:
    return os.getenv("GHL_API_BASE", "https://services.leadconnectorhq.com").rstrip("/")


def _default_location_id(payload_location_id: Optional[str]) -> str:
    return payload_location_id or os.getenv("GHL_LOCATION_ID", "")


def _static_map_url(lat: float, lng: float, api_key: str, zoom: int) -> str:
    params = {
        "center": f"{lat},{lng}",
        "zoom": zoom,
        "size": "640x640",
        "scale": 2,
        "maptype": "satellite",
        "key": api_key,
    }
    return f"{STATIC_MAP_URL}?{urlencode(params)}"


def _parse_json(text: str) -> Dict[str, Any]:
    stripped = text.strip()
    if stripped.startswith("```"):
        stripped = re.sub(r"^```(?:json)?\s*", "", stripped)
        stripped = re.sub(r"\s*```$", "", stripped)
    try:
        return json.loads(stripped)
    except json.JSONDecodeError:
        match = re.search(r"\{.*\}", stripped, flags=re.DOTALL)
        if not match:
            raise
        return json.loads(match.group(0))


async def _geocode_address(address: str, api_key: str, http_client: httpx.AsyncClient) -> Dict[str, float]:
    resp = await http_client.get(
        GEOCODE_URL,
        params={"address": address, "key": api_key},
        timeout=20.0,
    )
    resp.raise_for_status()
    body = resp.json()
    if body.get("status") != "OK" or not body.get("results"):
        raise HTTPException(status_code=400, detail=f"Geocoding failed with status={body.get('status')}")
    location = body["results"][0]["geometry"]["location"]
    return {"lat": location["lat"], "lng": location["lng"]}


async def _vision_classify_satellite(
    image_zoom_20: str,
    image_zoom_18: str,
    openai_key: str,
    http_client: httpx.AsyncClient,
) -> Dict[str, Any]:
    model = os.getenv("OPENAI_MODEL", DEFAULT_OPENAI_MODEL)
    prompt = (
        "Classify this property for fence self-draw eligibility using only A, B, or C.\n"
        "A = subject home footprint clearly visible.\n"
        "B = roads/subdivision and nearby homes visible, but subject home unclear or not built.\n"
        "C = blank/unclear/outdated imagery; unreliable for self-draw.\n"
        "Respond with JSON only, with keys class, confidence, reason. confidence is 0 to 1."
    )
    payload = {
        "model": model,
        "temperature": 0,
        "messages": [
            {
                "role": "user",
                "content": [
                    {"type": "text", "text": prompt},
                    {"type": "image_url", "image_url": {"url": image_zoom_20}},
                    {"type": "image_url", "image_url": {"url": image_zoom_18}},
                ],
            }
        ],
    }

    resp = await http_client.post(
        OPENAI_CHAT_URL,
        headers={"Authorization": f"Bearer {openai_key}", "Content-Type": "application/json"},
        json=payload,
        timeout=30.0,
    )
    resp.raise_for_status()
    data = resp.json()
    content = data["choices"][0]["message"]["content"]
    result = _parse_json(content)
    label = str(result.get("class", "")).upper().strip()
    if label not in {"A", "B", "C"}:
        raise HTTPException(status_code=502, detail=f"Classifier returned invalid class: {label!r}")
    try:
        confidence = float(result.get("confidence", 0.0))
    except (TypeError, ValueError):
        confidence = 0.0
    return {
        "class": label,
        "confidence": max(0.0, min(confidence, 1.0)),
        "reason": str(result.get("reason", ""))[:200],
    }


def _apply_thresholds(label: str, confidence: float) -> str:
    if confidence < 0.65:
        return "C"
    if label == "A" and confidence < 0.70:
        return "B"
    return label


def _build_decision(label: str, confidence: float, reason: str, first_name: str) -> Dict[str, str]:
    link = os.getenv("MY_SALESMAN_LINK", "").strip() or "<MY_SALESMAN_LINK>"
    safe_first_name = (first_name or "there").strip()
    if label == "A":
        return {
            "eligibilityClass": "A",
            "crmTag": "MS-A-VISIBLE",
            "recommendedAction": "Send My Salesman link with standard instructions.",
            "messageTemplate": A_TEMPLATE.format(first_name=safe_first_name, link=link) + MOBILE_LINE,
            "confidence": f"{confidence:.2f}",
            "reason": reason,
        }
    if label == "B":
        return {
            "eligibilityClass": "B",
            "crmTag": "MS-B-NEARBY-HOME",
            "recommendedAction": "Send My Salesman link with nearby-home example instructions.",
            "messageTemplate": B_TEMPLATE.format(first_name=safe_first_name, link=link) + MOBILE_LINE,
            "confidence": f"{confidence:.2f}",
            "reason": reason,
        }
    return {
        "eligibilityClass": "C",
        "crmTag": "MS-C-SKIP",
        "recommendedAction": "Skip My Salesman and route to manual estimate intake.",
        "messageTemplate": C_TEMPLATE.format(first_name=safe_first_name, link=link),
        "confidence": f"{confidence:.2f}",
        "reason": reason,
    }


def _split_name(full_name: Optional[str], first_name: Optional[str], last_name: Optional[str]) -> Dict[str, str]:
    if first_name or last_name:
        return {"firstName": first_name or "", "lastName": last_name or ""}
    parts = (full_name or "").strip().split(" ", 1)
    if not parts:
        return {"firstName": "", "lastName": ""}
    return {"firstName": parts[0], "lastName": parts[1] if len(parts) > 1 else ""}


async def _ghl_upsert_contact(payload: LeadWebhookPayload, tags: list[str], location_id: str) -> Optional[str]:
    if not os.getenv("GHL_API_KEY"):
        logger.warning("GHL API key missing; returning without CRM write")
        return payload.contactId

    names = _split_name(payload.fullName, payload.firstName, payload.lastName)
    upsert_payload: Dict[str, Any] = {
        "tags": tags,
        "source": "ASAP My Salesman Auto Router",
    }
    if names["firstName"]:
        upsert_payload["firstName"] = names["firstName"]
    if names["lastName"]:
        upsert_payload["lastName"] = names["lastName"]
    if payload.email:
        upsert_payload["email"] = payload.email
    if payload.phone:
        upsert_payload["phone"] = payload.phone
    if payload.address:
        upsert_payload["address1"] = payload.address
    if location_id:
        upsert_payload["locationId"] = location_id
    if payload.contactId:
        upsert_payload["id"] = payload.contactId

    async with httpx.AsyncClient(timeout=20.0) as http_client:
        resp = await http_client.post(
            f"{_ghl_base_url()}/contacts/upsert",
            headers=_ghl_headers(),
            json=upsert_payload,
        )
        if resp.status_code not in (200, 201):
            logger.error("GHL upsert failed: %s %s", resp.status_code, resp.text)
            raise HTTPException(status_code=502, detail="Failed to upsert contact in GHL")
        body = resp.json()
        contact = body.get("contact", {})
        return contact.get("id") or payload.contactId


async def _ghl_add_note(contact_id: str, note_body: str) -> None:
    async with httpx.AsyncClient(timeout=20.0) as http_client:
        resp = await http_client.post(
            f"{_ghl_base_url()}/contacts/{contact_id}/notes",
            headers=_ghl_headers(),
            # GHL notes endpoint infers contactId from the URL; including it in the body can 422.
            json={"body": note_body},
        )
        if resp.status_code not in (200, 201):
            logger.warning("GHL note failed: %s %s", resp.status_code, resp.text)


async def _ghl_send_sms(contact_id: str, location_id: str, message: str) -> bool:
    endpoint = os.getenv("LEAD_ROUTER_SMS_ENDPOINT", "/conversations/messages").strip()
    if not endpoint.startswith("/"):
        endpoint = f"/{endpoint}"
    payload = {
        "type": "SMS",
        "contactId": contact_id,
        "locationId": location_id,
        "message": message,
    }
    async with httpx.AsyncClient(timeout=20.0) as http_client:
        resp = await http_client.post(
            f"{_ghl_base_url()}{endpoint}",
            headers=_ghl_headers(),
            json=payload,
        )
        if resp.status_code not in (200, 201):
            logger.warning("Direct SMS failed: %s %s", resp.status_code, resp.text)
            return False
        return True


def _build_note(
    lead_id: Optional[str],
    address: str,
    decision: Dict[str, str],
    lat: float,
    lng: float,
) -> str:
    lines = [
        "[ASAP My Salesman Router]",
        f"Lead ID: {lead_id or 'N/A'}",
        f"Address: {address}",
        f"Lat/Lng: {lat},{lng}",
        f"Eligibility: {decision['eligibilityClass']}",
        f"Confidence: {decision['confidence']}",
        f"Reason: {decision['reason']}",
        f"Recommended Action: {decision['recommendedAction']}",
        f"CRM Tag: {decision['crmTag']}",
        "",
        "Message:",
        decision["messageTemplate"],
    ]
    return "\n".join(lines)


@router.post("/webhook")
async def lead_router_webhook(
    payload: LeadWebhookPayload,
    x_webhook_secret: Optional[str] = Header(default=None),
):
    _require_webhook_secret(x_webhook_secret)
    location_id = _default_location_id(payload.locationId)

    maps_key = _maps_key()
    openai_key = _openai_key()

    async with httpx.AsyncClient(timeout=30.0) as http_client:
        geocoded = await _geocode_address(payload.address, maps_key, http_client)
        lat = geocoded["lat"]
        lng = geocoded["lng"]
        image_20 = _static_map_url(lat, lng, maps_key, zoom=20)
        image_18 = _static_map_url(lat, lng, maps_key, zoom=18)
        raw = await _vision_classify_satellite(image_20, image_18, openai_key, http_client)

    final_class = _apply_thresholds(raw["class"], raw["confidence"])
    decision = _build_decision(final_class, raw["confidence"], raw["reason"], payload.firstName or "")
    tags = ["MS-AUTO-ROUTED", decision["crmTag"]]
    if final_class == "C":
        tags.append("MS-MANUAL-ESTIMATE-REQUIRED")
    else:
        tags.append("MS-SEND-LINK")

    result: Dict[str, Any] = {
        "leadId": payload.leadId,
        "address": payload.address,
        "lat": lat,
        "lng": lng,
        "eligibilityClass": decision["eligibilityClass"],
        "confidence": decision["confidence"],
        "reason": decision["reason"],
        "crmTag": decision["crmTag"],
        "recommendedAction": decision["recommendedAction"],
        "messageTemplate": decision["messageTemplate"],
        "tagsApplied": tags,
        "sendMode": os.getenv("LEAD_ROUTER_SEND_MODE", "tag_only"),
    }

    if not os.getenv("GHL_API_KEY"):
        result["dryRun"] = True
        return result

    contact_id = await _ghl_upsert_contact(payload, tags, location_id)
    result["contactId"] = contact_id

    if contact_id:
        note = _build_note(payload.leadId, payload.address, decision, lat, lng)
        await _ghl_add_note(contact_id, note)

        send_mode = os.getenv("LEAD_ROUTER_SEND_MODE", "tag_only").strip().lower()
        if send_mode == "direct_sms" and payload.phone and final_class in {"A", "B"}:
            sms_sent = await _ghl_send_sms(contact_id, location_id, decision["messageTemplate"])
            result["directSmsSent"] = sms_sent
        else:
            result["directSmsSent"] = False

    return result


@router.post("/inbound-sms")
async def inbound_sms_router(
    payload: InboundSmsPayload,
    x_webhook_secret: Optional[str] = Header(default=None),
):
    _require_webhook_secret(x_webhook_secret)

    mobile_friction = bool(MOBILE_TROUBLE_PATTERN.search(payload.message))
    response: Dict[str, Any] = {
        "contactId": payload.contactId,
        "mobileFrictionDetected": mobile_friction,
    }
    if not mobile_friction:
        return response

    if not os.getenv("GHL_API_KEY"):
        response["dryRun"] = True
        return response

    location_id = _default_location_id(payload.locationId)
    upsert_payload = LeadWebhookPayload(
        contactId=payload.contactId,
        phone=payload.phone,
        address="",
        locationId=location_id,
    )
    tags = ["MS-MOBILE-TROUBLE", "MS-MANUAL-ESTIMATE-REQUIRED"]
    contact_id = await _ghl_upsert_contact(upsert_payload, tags, location_id)
    response["tagsApplied"] = tags
    response["upsertedContactId"] = contact_id

    if contact_id and _env_bool("LEAD_ROUTER_SEND_MOBILE_ASSIST_REPLY", default=False):
        assist = (
            "Thanks for the heads-up. We will switch to an assisted estimate so this is easy. "
            "Reply with your fence type and rough footage, and we will handle the rest."
        )
        response["assistSmsSent"] = await _ghl_send_sms(contact_id, location_id, assist)

    return response
