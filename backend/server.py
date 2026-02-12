from fastapi import FastAPI, APIRouter, HTTPException, Request
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional
import uuid
from datetime import datetime, timezone
import stripe
import httpx

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

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
    phone: str
    address: str
    yardSize: str
    projectType: str
    fenceStyle: Optional[str] = None
    timeline: Optional[str] = None
    message: Optional[str] = None
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
            tags.append("Paid-$150")

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
            "Content-Type": "application/json",
            "Version": "2021-07-28",
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
                        "contactId": contact_id,
                    }
                    await http_client.post(
                        f"{GHL_BASE_URL}/contacts/{contact_id}/notes",
                        json=note_payload,
                        headers=headers,
                    )
                    logger.info(f"GHL note added for contact {contact_id}")

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
            "Content-Type": "application/json",
            "Version": "2021-07-28",
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
    await db.status_checks.insert_one(status_obj.dict())
    return status_obj

@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    status_checks = await db.status_checks.find().to_list(1000)
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
        "status": "pending_payment",
        "paymentStatus": "unpaid",
        "leadSource": GHL_LEAD_SOURCE,
        "createdAt": datetime.now(timezone.utc).isoformat(),
    }
    await db.consultations.insert_one(consultation_doc)
    logger.info(f"Lead captured: {consultation_id} - {data.fullName}")

    # Push to GHL
    try:
        ghl_contact_id = await push_to_ghl(consultation_doc)
        if ghl_contact_id:
            await db.consultations.update_one(
                {"id": consultation_id},
                {"$set": {"ghlContactId": ghl_contact_id}}
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
        await db.payment_transactions.insert_one(payment_doc)
        await db.consultations.update_one(
            {"id": consultation_id},
            {"$set": {"stripeSessionId": session.id}}
        )

        logger.info(f"Stripe session {session.id} for {consultation_id}")
        return {"id": consultation_id, "checkoutUrl": session.url, "sessionId": session.id}

    except Exception as e:
        logger.error(f"Stripe error: {e}")
        raise HTTPException(status_code=500, detail=f"Payment setup failed: {str(e)}")


@api_router.get("/consultations/status/{session_id}")
async def get_consultation_payment_status(session_id: str):
    """Poll payment status after Stripe redirect"""
    payment = await db.payment_transactions.find_one({"session_id": session_id})
    if not payment:
        raise HTTPException(status_code=404, detail="Payment session not found")

    if payment.get("payment_status") == "paid":
        consultation = await db.consultations.find_one({"stripeSessionId": session_id})
        return {
            "status": "complete", "payment_status": "paid",
            "consultation": {"id": consultation["id"], "fullName": consultation.get("fullName")} if consultation else None,
        }

    try:
        session = stripe.checkout.Session.retrieve(session_id)
        await db.payment_transactions.update_one(
            {"session_id": session_id},
            {"$set": {"status": session.status, "payment_status": session.payment_status, "updatedAt": datetime.now(timezone.utc).isoformat()}}
        )

        if session.payment_status == "paid":
            consultation_id = payment.get("consultation_id")
            if consultation_id:
                await db.consultations.update_one(
                    {"id": consultation_id},
                    {"$set": {"status": "confirmed", "paymentStatus": "paid", "paidAt": datetime.now(timezone.utc).isoformat()}}
                )
                consultation = await db.consultations.find_one({"id": consultation_id})
                if consultation:
                    try:
                        await push_to_ghl({**consultation, "paymentStatus": "PAID - $150"}, "consultation")
                    except Exception:
                        pass
                logger.info(f"Consultation {consultation_id} confirmed")

        consultation = await db.consultations.find_one({"stripeSessionId": session_id})
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
    await db.callbacks.insert_one(callback_doc)
    logger.info(f"Callback: {data.phone}")

    try:
        await push_callback_to_ghl(data.name, data.phone)
    except Exception as e:
        logger.error(f"GHL callback error: {e}")

    return {"status": "ok"}


# --- Admin Endpoints ---

@api_router.get("/admin/consultations")
async def get_all_consultations():
    """Get all consultation leads"""
    docs = await db.consultations.find().sort("createdAt", -1).to_list(500)
    return [
        {k: v for k, v in doc.items() if k != "_id"}
        for doc in docs
    ]

@api_router.get("/admin/callbacks")
async def get_all_callbacks():
    """Get all callback requests"""
    docs = await db.callbacks.find().sort("createdAt", -1).to_list(500)
    return [
        {k: v for k, v in doc.items() if k != "_id"}
        for doc in docs
    ]

@api_router.get("/admin/stats")
async def get_admin_stats():
    """Dashboard stats"""
    total_consultations = await db.consultations.count_documents({})
    paid_consultations = await db.consultations.count_documents({"paymentStatus": "paid"})
    pending_consultations = await db.consultations.count_documents({"paymentStatus": {"$ne": "paid"}})
    total_callbacks = await db.callbacks.count_documents({})
    return {
        "totalConsultations": total_consultations,
        "paidConsultations": paid_consultations,
        "pendingConsultations": pending_consultations,
        "totalCallbacks": total_callbacks,
    }


# Include router
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
