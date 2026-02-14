from fastapi import FastAPI, APIRouter, HTTPException, Request
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional
import uuid
from datetime import datetime, timezone
import stripe
import httpx
import sqlite3
import threading
from lead_router import router as lead_router_router

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Stripe
stripe.api_key = os.environ.get('STRIPE_SECRET_KEY')
STRIPE_WEBHOOK_SECRET = os.environ.get('STRIPE_WEBHOOK_SECRET')
VIP_CONSULTATION_FEE = 15000  # $150.00 in cents

# GHL
GHL_API_KEY = os.environ.get('GHL_API_KEY')
GHL_LOCATION_ID = os.environ.get('GHL_LOCATION_ID')
GHL_BASE_URL = "https://services.leadconnectorhq.com"

# GHL Lead Source Identifier — used for routing inside GHL workflows
GHL_LEAD_SOURCE = "ASAP Large Yard LP"
GHL_CONSULTATION_TAG = "LP-VIP-Consultation"
GHL_CALLBACK_TAG = "LP-Callback-Request"
GHL_PAID_TAG = "LP-Paid-$150"

# Create the main app
app = FastAPI()
api_router = APIRouter(prefix="/api")

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)


# SQLite (default local DB; no external database required)
SQLITE_DB_PATH = os.environ.get("SQLITE_DB_PATH", str(ROOT_DIR / "app.db"))
db_conn = sqlite3.connect(SQLITE_DB_PATH, check_same_thread=False)
db_conn.row_factory = sqlite3.Row
db_lock = threading.Lock()


def _db_exec(query: str, params: tuple = ()) -> sqlite3.Cursor:
    with db_lock:
        cur = db_conn.execute(query, params)
        db_conn.commit()
        return cur


def _db_one(query: str, params: tuple = ()) -> Optional[dict]:
    with db_lock:
        cur = db_conn.execute(query, params)
        row = cur.fetchone()
    return dict(row) if row else None


def _db_many(query: str, params: tuple = ()) -> List[dict]:
    with db_lock:
        cur = db_conn.execute(query, params)
        rows = cur.fetchall()
    return [dict(r) for r in rows]


def _normalize_consultation(doc: Optional[dict]) -> Optional[dict]:
    if not doc:
        return doc
    doc["smsConsent"] = bool(doc.get("smsConsent"))
    return doc


def _init_sqlite() -> None:
    with db_lock:
        db_conn.executescript(
            """
            CREATE TABLE IF NOT EXISTS status_checks (
                id TEXT PRIMARY KEY,
                client_name TEXT NOT NULL,
                timestamp TEXT NOT NULL
            );

            CREATE TABLE IF NOT EXISTS consultations (
                id TEXT PRIMARY KEY,
                fullName TEXT NOT NULL,
                email TEXT NOT NULL,
                phone TEXT,
                address TEXT NOT NULL,
                yardSize TEXT NOT NULL,
                projectType TEXT NOT NULL,
                fenceStyle TEXT,
                timeline TEXT,
                message TEXT,
                smsConsent INTEGER NOT NULL DEFAULT 0,
                smsConsentTimestamp TEXT,
                status TEXT NOT NULL,
                paymentStatus TEXT NOT NULL,
                leadSource TEXT,
                createdAt TEXT NOT NULL,
                ghlContactId TEXT,
                stripeSessionId TEXT,
                paidAt TEXT
            );

            CREATE TABLE IF NOT EXISTS payment_transactions (
                id TEXT PRIMARY KEY,
                session_id TEXT NOT NULL UNIQUE,
                consultation_id TEXT NOT NULL,
                amount INTEGER NOT NULL,
                currency TEXT NOT NULL,
                payment_status TEXT NOT NULL,
                status TEXT NOT NULL,
                createdAt TEXT NOT NULL,
                updatedAt TEXT
            );

            CREATE TABLE IF NOT EXISTS callbacks (
                id TEXT PRIMARY KEY,
                name TEXT,
                phone TEXT NOT NULL,
                status TEXT NOT NULL,
                leadSource TEXT,
                createdAt TEXT NOT NULL
            );

            CREATE INDEX IF NOT EXISTS idx_consultations_createdAt ON consultations(createdAt DESC);
            CREATE INDEX IF NOT EXISTS idx_consultations_stripeSessionId ON consultations(stripeSessionId);
            CREATE INDEX IF NOT EXISTS idx_consultations_paymentStatus ON consultations(paymentStatus);
            CREATE INDEX IF NOT EXISTS idx_payments_session_id ON payment_transactions(session_id);
            CREATE INDEX IF NOT EXISTS idx_payments_consultation_id ON payment_transactions(consultation_id);
            CREATE INDEX IF NOT EXISTS idx_callbacks_createdAt ON callbacks(createdAt DESC);
            """
        )
        db_conn.commit()


_init_sqlite()


# --- Models ---

class StatusCheck(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class StatusCheckCreate(BaseModel):
    client_name: str

class ConsultationCreate(BaseModel):
    fullName: str
    email: str
    phone: Optional[str] = None
    address: str
    yardSize: str
    projectType: str
    fenceStyle: Optional[str] = None
    timeline: Optional[str] = None
    message: Optional[str] = None
    smsConsent: bool = False
    smsConsentTimestamp: Optional[str] = None
    originUrl: str

class CallbackCreate(BaseModel):
    name: Optional[str] = None
    phone: str


# --- GHL Integration ---

async def push_to_ghl(data: dict, lead_type: str = "consultation"):
    """Push a lead to Go High Level CRM with clear routing identifiers"""
    if not GHL_API_KEY or not GHL_LOCATION_ID:
        logger.warning("GHL credentials not configured, skipping push")
        return None

    try:
        name_parts = data.get("fullName", "").split(" ", 1)
        first_name = name_parts[0] if name_parts else ""
        last_name = name_parts[1] if len(name_parts) > 1 else ""

        # Routing tags — GHL_CONSULTATION_TAG is the primary routing identifier
        tags = [
            GHL_CONSULTATION_TAG,
            GHL_LEAD_SOURCE,
            "Large Yard Division",
        ]
        if data.get("yardSize"):
            tags.append(f"Yard: {data['yardSize']}")
        if data.get("fenceStyle"):
            tags.append(f"Style: {data['fenceStyle']}")
        if data.get("projectType"):
            tags.append(f"Project: {data['projectType']}")
        if data.get("paymentStatus") == "PAID - $150":
            tags.append(GHL_PAID_TAG)
        if data.get("smsConsent"):
            tags.append("SMS-Opted-In")

        # Notes for the contact
        notes = []
        if data.get("address"):
            notes.append(f"Property: {data['address']}")
        if data.get("yardSize"):
            notes.append(f"Yard Size: {data['yardSize']}")
        if data.get("projectType"):
            notes.append(f"Project Type: {data['projectType']}")
        if data.get("fenceStyle"):
            notes.append(f"Fence Style: {data['fenceStyle']}")
        if data.get("timeline"):
            notes.append(f"Timeline: {data['timeline']}")
        if data.get("message"):
            notes.append(f"Notes: {data['message']}")
        if data.get("paymentStatus"):
            notes.append(f"Payment Status: {data['paymentStatus']}")
        if data.get("smsConsent"):
            notes.append(f"SMS Consent: Yes (at {data.get('smsConsentTimestamp', 'N/A')})")
        else:
            notes.append("SMS Consent: No")

        contact_payload = {
            "firstName": first_name,
            "lastName": last_name,
            "email": data.get("email", ""),
            "phone": data.get("phone", ""),
            "address1": data.get("address", ""),
            "source": GHL_LEAD_SOURCE,
            "tags": tags,
            "locationId": GHL_LOCATION_ID,
        }

        headers = {
            "Authorization": f"Bearer {GHL_API_KEY}",
            "Accept": "application/json",
            "Content-Type": "application/json",
            "Version": "2021-07-28",
            # Some GHL/Cloudflare edges block requests without a UA.
            "User-Agent": "asap-fence-backend/1.0",
        }

        async with httpx.AsyncClient(timeout=15.0) as http_client:
            response = await http_client.post(
                f"{GHL_BASE_URL}/contacts/upsert",
                json=contact_payload,
                headers=headers,
            )

            if response.status_code in (200, 201):
                contact_data = response.json()
                contact_id = contact_data.get("contact", {}).get("id")
                logger.info(f"GHL contact created/updated: {contact_id}")

                if contact_id and notes:
                    note_payload = {
                        "body": f"[{GHL_LEAD_SOURCE}]\n" + "\n".join(notes),
                    }
                    note_resp = await http_client.post(
                        f"{GHL_BASE_URL}/contacts/{contact_id}/notes",
                        json=note_payload,
                        headers=headers,
                    )
                    if note_resp.status_code in (200, 201):
                        logger.info(f"GHL note added for contact {contact_id}")
                    else:
                        # Don't fail the lead capture if notes fail; log for debugging.
                        logger.warning(
                            "GHL note failed %s: %s",
                            note_resp.status_code,
                            (note_resp.text or "")[:500],
                        )

                return contact_id
            else:
                logger.error(f"GHL API error {response.status_code}: {response.text}")
                return None

    except Exception as e:
        logger.error(f"GHL push failed: {e}")
        return None


async def push_callback_to_ghl(name: str, phone: str):
    """Push a callback request to GHL with routing identifier"""
    if not GHL_API_KEY or not GHL_LOCATION_ID:
        return None

    try:
        name_parts = (name or "").split(" ", 1)
        first_name = name_parts[0] if name_parts else "Callback"
        last_name = name_parts[1] if len(name_parts) > 1 else "Request"

        contact_payload = {
            "firstName": first_name,
            "lastName": last_name,
            "phone": phone,
            "source": GHL_LEAD_SOURCE,
            "tags": [
                GHL_CALLBACK_TAG,
                GHL_LEAD_SOURCE,
                "Large Yard Division",
            ],
            "locationId": GHL_LOCATION_ID,
        }

        headers = {
            "Authorization": f"Bearer {GHL_API_KEY}",
            "Accept": "application/json",
            "Content-Type": "application/json",
            "Version": "2021-07-28",
            "User-Agent": "asap-fence-backend/1.0",
        }

        async with httpx.AsyncClient(timeout=15.0) as http_client:
            response = await http_client.post(
                f"{GHL_BASE_URL}/contacts/upsert",
                json=contact_payload,
                headers=headers,
            )
            if response.status_code in (200, 201):
                contact_id = response.json().get("contact", {}).get("id")
                logger.info(f"GHL callback contact: {contact_id}")
                return contact_id
            else:
                logger.error(f"GHL callback error {response.status_code}: {response.text}")

    except Exception as e:
        logger.error(f"GHL callback push failed: {e}")
    return None


# --- Routes ---

@api_router.get("/")
async def root():
    return {"message": "Hello World"}

@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status_dict = input.dict()
    status_obj = StatusCheck(**status_dict)
    _db_exec(
        "INSERT INTO status_checks (id, client_name, timestamp) VALUES (?, ?, ?)",
        (status_obj.id, status_obj.client_name, status_obj.timestamp.isoformat()),
    )
    return status_obj

@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    status_checks = _db_many(
        "SELECT id, client_name, timestamp FROM status_checks ORDER BY timestamp DESC LIMIT 1000"
    )
    return [StatusCheck(**sc) for sc in status_checks]


# --- Consultation / Stripe Checkout ---

@api_router.post("/consultations")
async def create_consultation(data: ConsultationCreate):
    """Save lead, push to GHL, create Stripe checkout"""
    consultation_id = str(uuid.uuid4())

    consultation_doc = {
        "id": consultation_id,
        "fullName": data.fullName,
        "email": data.email,
        "phone": data.phone,
        "address": data.address,
        "yardSize": data.yardSize,
        "projectType": data.projectType,
        "fenceStyle": data.fenceStyle,
        "timeline": data.timeline,
        "message": data.message,
        "smsConsent": data.smsConsent,
        "smsConsentTimestamp": data.smsConsentTimestamp,
        "status": "pending_payment",
        "paymentStatus": "unpaid",
        "leadSource": GHL_LEAD_SOURCE,
        "createdAt": datetime.now(timezone.utc).isoformat(),
    }
    _db_exec(
        """
        INSERT INTO consultations (
            id, fullName, email, phone, address, yardSize, projectType, fenceStyle, timeline, message,
            smsConsent, smsConsentTimestamp, status, paymentStatus, leadSource, createdAt
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """,
        (
            consultation_doc["id"],
            consultation_doc["fullName"],
            consultation_doc["email"],
            consultation_doc["phone"],
            consultation_doc["address"],
            consultation_doc["yardSize"],
            consultation_doc["projectType"],
            consultation_doc["fenceStyle"],
            consultation_doc["timeline"],
            consultation_doc["message"],
            1 if consultation_doc["smsConsent"] else 0,
            consultation_doc["smsConsentTimestamp"],
            consultation_doc["status"],
            consultation_doc["paymentStatus"],
            consultation_doc["leadSource"],
            consultation_doc["createdAt"],
        ),
    )
    logger.info(f"Lead captured: {consultation_id} - {data.fullName}")

    # Push to GHL
    ghl_contact_id = None
    try:
        ghl_contact_id = await push_to_ghl(consultation_doc)
        if ghl_contact_id:
            _db_exec(
                "UPDATE consultations SET ghlContactId = ? WHERE id = ?",
                (ghl_contact_id, consultation_id),
            )
    except Exception as e:
        logger.error(f"GHL push error: {e}")

    # Create Stripe checkout
    origin = data.originUrl.rstrip("/")
    success_url = f"{origin}/checkout/success?session_id={{CHECKOUT_SESSION_ID}}"
    cancel_url = f"{origin}/checkout/cancel?consultation_id={consultation_id}"

    try:
        session = stripe.checkout.Session.create(
            mode="payment",
            customer_email=data.email,
            success_url=success_url,
            cancel_url=cancel_url,
            line_items=[{
                "price_data": {
                    "currency": "usd",
                    "unit_amount": VIP_CONSULTATION_FEE,
                    "product_data": {
                        "name": "VIP Fence Consultation — Large Yard Division",
                        "description": (
                            "Same-day or next-day on-site consultation with your dedicated project manager. "
                            "Includes full property survey, material samples, HOA review, and a custom proposal within 48 hours. "
                            "This $150 fee is credited in full toward your fence installation. "
                            "100% Satisfaction Guarantee — full refund if not satisfied."
                        ),
                    },
                },
                "quantity": 1,
            }],
            metadata={
                "consultation_id": consultation_id,
                "customer_name": data.fullName,
                "customer_phone": data.phone,
                "property_address": data.address,
                "yard_size": data.yardSize,
                "project_type": data.projectType,
                "fence_style": data.fenceStyle or "Not specified",
                "lead_source": GHL_LEAD_SOURCE,
            },
            payment_intent_data={
                "description": f"VIP Fence Consultation for {data.fullName} — {data.address}",
                "metadata": {
                    "consultation_id": consultation_id,
                    "customer_name": data.fullName,
                    "customer_email": data.email,
                    "customer_phone": data.phone,
                },
            },
            custom_text={
                "submit": {
                    "message": (
                        "Your $150 consultation fee is credited in full toward your fence project. "
                        "100% Satisfaction Guarantee — refund if not satisfied for any reason."
                    ),
                },
            },
        )

        payment_doc = {
            "id": str(uuid.uuid4()),
            "session_id": session.id,
            "consultation_id": consultation_id,
            "amount": VIP_CONSULTATION_FEE,
            "currency": "usd",
            "payment_status": "initiated",
            "status": "pending",
            "createdAt": datetime.now(timezone.utc).isoformat(),
        }
        _db_exec(
            """
            INSERT INTO payment_transactions (
                id, session_id, consultation_id, amount, currency, payment_status, status, createdAt
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                payment_doc["id"],
                payment_doc["session_id"],
                payment_doc["consultation_id"],
                payment_doc["amount"],
                payment_doc["currency"],
                payment_doc["payment_status"],
                payment_doc["status"],
                payment_doc["createdAt"],
            ),
        )
        _db_exec(
            "UPDATE consultations SET stripeSessionId = ? WHERE id = ?",
            (session.id, consultation_id),
        )

        logger.info(f"Stripe session {session.id} for {consultation_id}")
        # Include ghlContactId to make verification/debugging easy (does not expose any secrets).
        return {
            "id": consultation_id,
            "checkoutUrl": session.url,
            "sessionId": session.id,
            "ghlContactId": ghl_contact_id,
        }

    except Exception as e:
        logger.error(f"Stripe error: {e}")
        raise HTTPException(status_code=500, detail=f"Payment setup failed: {str(e)}")


@api_router.get("/consultations/status/{session_id}")
async def get_consultation_payment_status(session_id: str):
    """Poll payment status after Stripe redirect"""
    payment = _db_one(
        "SELECT * FROM payment_transactions WHERE session_id = ?",
        (session_id,),
    )
    if not payment:
        raise HTTPException(status_code=404, detail="Payment session not found")

    if payment.get("payment_status") == "paid":
        consultation = _normalize_consultation(
            _db_one("SELECT * FROM consultations WHERE stripeSessionId = ?", (session_id,))
        )
        return {
            "status": "complete", "payment_status": "paid",
            "consultation": {"id": consultation["id"], "fullName": consultation.get("fullName")} if consultation else None,
        }

    try:
        session = stripe.checkout.Session.retrieve(session_id)
        _db_exec(
            "UPDATE payment_transactions SET status = ?, payment_status = ?, updatedAt = ? WHERE session_id = ?",
            (session.status, session.payment_status, datetime.now(timezone.utc).isoformat(), session_id),
        )

        if session.payment_status == "paid":
            consultation_id = payment.get("consultation_id")
            if consultation_id:
                _db_exec(
                    "UPDATE consultations SET status = ?, paymentStatus = ?, paidAt = ? WHERE id = ?",
                    ("confirmed", "paid", datetime.now(timezone.utc).isoformat(), consultation_id),
                )
                consultation = _normalize_consultation(
                    _db_one("SELECT * FROM consultations WHERE id = ?", (consultation_id,))
                )
                if consultation:
                    try:
                        await push_to_ghl({**consultation, "paymentStatus": "PAID - $150"}, "consultation")
                    except Exception:
                        pass
                logger.info(f"Consultation {consultation_id} confirmed")

        consultation = _normalize_consultation(
            _db_one("SELECT * FROM consultations WHERE stripeSessionId = ?", (session_id,))
        )
        return {
            "status": session.status, "payment_status": session.payment_status,
            "amount_total": session.amount_total, "currency": session.currency,
            "consultation": {"id": consultation["id"], "fullName": consultation.get("fullName")} if consultation else None,
        }
    except Exception as e:
        logger.error(f"Status check error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@api_router.post("/callbacks")
async def create_callback(data: CallbackCreate):
    """Save callback, push to GHL"""
    callback_doc = {
        "id": str(uuid.uuid4()),
        "name": data.name,
        "phone": data.phone,
        "status": "pending",
        "leadSource": GHL_LEAD_SOURCE,
        "createdAt": datetime.now(timezone.utc).isoformat(),
    }
    _db_exec(
        "INSERT INTO callbacks (id, name, phone, status, leadSource, createdAt) VALUES (?, ?, ?, ?, ?, ?)",
        (
            callback_doc["id"],
            callback_doc["name"],
            callback_doc["phone"],
            callback_doc["status"],
            callback_doc["leadSource"],
            callback_doc["createdAt"],
        ),
    )
    logger.info(f"Callback: {data.phone}")

    try:
        contact_id = await push_callback_to_ghl(data.name, data.phone)
    except Exception as e:
        logger.error(f"GHL callback error: {e}")
        contact_id = None

    return {"status": "ok", "ghlContactId": contact_id}


# --- Admin Endpoints ---

@api_router.get("/admin/consultations")
async def get_all_consultations():
    """Get all consultation leads"""
    docs = _db_many("SELECT * FROM consultations ORDER BY createdAt DESC LIMIT 500")
    return [_normalize_consultation(doc) for doc in docs]

@api_router.get("/admin/callbacks")
async def get_all_callbacks():
    """Get all callback requests"""
    return _db_many("SELECT * FROM callbacks ORDER BY createdAt DESC LIMIT 500")

@api_router.get("/admin/stats")
async def get_admin_stats():
    """Dashboard stats"""
    total_consultations = _db_one("SELECT COUNT(*) AS c FROM consultations")["c"]
    paid_consultations = _db_one(
        "SELECT COUNT(*) AS c FROM consultations WHERE paymentStatus = ?",
        ("paid",),
    )["c"]
    pending_consultations = _db_one(
        "SELECT COUNT(*) AS c FROM consultations WHERE paymentStatus != ?",
        ("paid",),
    )["c"]
    total_callbacks = _db_one("SELECT COUNT(*) AS c FROM callbacks")["c"]
    return {
        "totalConsultations": total_consultations,
        "paidConsultations": paid_consultations,
        "pendingConsultations": pending_consultations,
        "totalCallbacks": total_callbacks,
    }


# Include router
app.include_router(api_router)
app.include_router(lead_router_router)


# --- Stripe Webhook (outside /api prefix — Stripe posts directly) ---

async def handle_successful_payment(session):
    """Process a successful Stripe checkout payment"""
    consultation_id = session.get("metadata", {}).get("consultation_id")
    if not consultation_id:
        logger.warning("Webhook: No consultation_id in session metadata")
        return

    now = datetime.now(timezone.utc).isoformat()

    # Update consultation
    _db_exec(
        "UPDATE consultations SET status = ?, paymentStatus = ?, paidAt = ? WHERE id = ?",
        ("confirmed", "paid", now, consultation_id),
    )

    # Update payment transaction
    _db_exec(
        "UPDATE payment_transactions SET payment_status = ?, status = ?, updatedAt = ? WHERE consultation_id = ?",
        ("paid", "complete", now, consultation_id),
    )

    logger.info(f"Webhook: Consultation {consultation_id} marked as paid")

    # Push updated status to GHL with Paid tag
    consultation = _normalize_consultation(
        _db_one("SELECT * FROM consultations WHERE id = ?", (consultation_id,))
    )
    if consultation:
        try:
            ghl_data = {k: v for k, v in consultation.items()}
            ghl_data["paymentStatus"] = "PAID - $150"
            await push_to_ghl(ghl_data, "consultation")
            logger.info(f"Webhook: GHL updated with Paid tag for {consultation_id}")
        except Exception as e:
            logger.error(f"Webhook: GHL push failed for {consultation_id}: {e}")


@app.post("/api/stripe-webhook")
async def stripe_webhook(request: Request):
    """Handle Stripe webhook events for real-time payment updates"""
    payload = await request.body()
    sig_header = request.headers.get("stripe-signature")

    if STRIPE_WEBHOOK_SECRET and sig_header:
        try:
            event = stripe.Webhook.construct_event(
                payload, sig_header, STRIPE_WEBHOOK_SECRET
            )
        except stripe.error.SignatureVerificationError:
            logger.warning("Webhook: Invalid signature")
            raise HTTPException(status_code=400, detail="Invalid signature")
        except Exception as e:
            logger.error(f"Webhook: Construction error: {e}")
            raise HTTPException(status_code=400, detail=str(e))
    else:
        # No webhook secret configured — parse payload directly (dev/testing mode)
        import json
        try:
            event = json.loads(payload)
        except Exception:
            raise HTTPException(status_code=400, detail="Invalid payload")

    event_type = event.get("type", "")
    logger.info(f"Webhook received: {event_type}")

    if event_type == "checkout.session.completed":
        session_data = event.get("data", {}).get("object", {})
        if session_data.get("payment_status") == "paid":
            await handle_successful_payment(session_data)
    elif event_type == "checkout.session.async_payment_succeeded":
        session_data = event.get("data", {}).get("object", {})
        await handle_successful_payment(session_data)

    return {"received": True}

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    with db_lock:
        db_conn.close()
