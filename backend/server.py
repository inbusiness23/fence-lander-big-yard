from fastapi import FastAPI, APIRouter, Request, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional
import uuid
from datetime import datetime
import stripe

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Stripe
STRIPE_API_KEY = os.environ.get('STRIPE_API_KEY')
stripe.api_key = STRIPE_API_KEY
VIP_CONSULTATION_FEE = 15000  # $150.00 in cents

# Create the main app
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


# ─── Models ───────────────────────────────────────────────────────────────────

class StatusCheck(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)

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


# ─── Routes ───────────────────────────────────────────────────────────────────

@api_router.get("/")
async def root():
    return {"message": "Hello World"}

@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status_dict = input.dict()
    status_obj = StatusCheck(**status_dict)
    _ = await db.status_checks.insert_one(status_obj.dict())
    return status_obj

@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    status_checks = await db.status_checks.find().to_list(1000)
    return [StatusCheck(**status_check) for status_check in status_checks]


# ─── Consultation / Stripe Checkout ──────────────────────────────────────────

@api_router.post("/consultations")
async def create_consultation(data: ConsultationCreate):
    """Save lead to MongoDB, create rich Stripe Checkout session"""

    consultation_id = str(uuid.uuid4())

    # Save lead immediately
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
        "createdAt": datetime.utcnow().isoformat(),
    }
    await db.consultations.insert_one(consultation_doc)
    logger.info(f"Lead captured: {consultation_id} - {data.fullName} - {data.email}")

    # Build description with project details
    desc_parts = [
        f"Property: {data.address}",
        f"Yard Size: {data.yardSize}",
        f"Project: {data.projectType}",
    ]
    if data.fenceStyle:
        desc_parts.append(f"Fence Style: {data.fenceStyle}")
    project_summary = " | ".join(desc_parts)

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
                            f"Same-day or next-day on-site consultation with your dedicated project manager. "
                            f"Includes full property survey, material samples, HOA review, and a custom proposal within 48 hours. "
                            f"This $150 fee is credited in full toward your fence installation. "
                            f"100% Satisfaction Guarantee — full refund if not satisfied."
                        ),
                        "metadata": {
                            "type": "vip_consultation",
                        },
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
            },
            payment_intent_data={
                "description": f"VIP Fence Consultation for {data.fullName} — {project_summary}",
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

        # Save payment record
        payment_doc = {
            "id": str(uuid.uuid4()),
            "session_id": session.id,
            "consultation_id": consultation_id,
            "amount": VIP_CONSULTATION_FEE,
            "currency": "usd",
            "payment_status": "initiated",
            "status": "pending",
            "createdAt": datetime.utcnow().isoformat(),
        }
        await db.payment_transactions.insert_one(payment_doc)

        # Update consultation with session ID
        await db.consultations.update_one(
            {"id": consultation_id},
            {"$set": {"stripeSessionId": session.id}}
        )

        logger.info(f"Stripe session {session.id} created for consultation {consultation_id}")

        return {
            "id": consultation_id,
            "checkoutUrl": session.url,
            "sessionId": session.id,
        }

    except stripe.error.StripeError as e:
        logger.error(f"Stripe error: {e}")
        raise HTTPException(status_code=500, detail=f"Payment setup failed: {str(e)}")
    except Exception as e:
        logger.error(f"Checkout creation failed: {e}")
        raise HTTPException(status_code=500, detail=f"Payment setup failed: {str(e)}")


@api_router.get("/consultations/status/{session_id}")
async def get_consultation_payment_status(session_id: str):
    """Poll payment status after Stripe redirect"""

    payment = await db.payment_transactions.find_one({"session_id": session_id})
    if not payment:
        raise HTTPException(status_code=404, detail="Payment session not found")

    # If already marked paid, return immediately
    if payment.get("payment_status") == "paid":
        consultation = await db.consultations.find_one({"stripeSessionId": session_id})
        return {
            "status": "complete",
            "payment_status": "paid",
            "consultation": {
                "id": consultation["id"] if consultation else None,
                "fullName": consultation.get("fullName") if consultation else None,
            }
        }

    # Poll Stripe
    try:
        session = stripe.checkout.Session.retrieve(session_id)

        new_status = session.status  # "open", "complete", "expired"
        new_payment = session.payment_status  # "unpaid", "paid", "no_payment_required"

        await db.payment_transactions.update_one(
            {"session_id": session_id},
            {"$set": {
                "status": new_status,
                "payment_status": new_payment,
                "updatedAt": datetime.utcnow().isoformat(),
            }}
        )

        if new_payment == "paid":
            consultation_id = payment.get("consultation_id")
            if consultation_id:
                await db.consultations.update_one(
                    {"id": consultation_id},
                    {"$set": {
                        "status": "confirmed",
                        "paymentStatus": "paid",
                        "paidAt": datetime.utcnow().isoformat(),
                    }}
                )
                logger.info(f"Consultation {consultation_id} confirmed — payment received")

        consultation = await db.consultations.find_one({"stripeSessionId": session_id})

        return {
            "status": new_status,
            "payment_status": new_payment,
            "amount_total": session.amount_total,
            "currency": session.currency,
            "consultation": {
                "id": consultation["id"] if consultation else None,
                "fullName": consultation.get("fullName") if consultation else None,
            } if consultation else None,
        }

    except stripe.error.StripeError as e:
        logger.error(f"Stripe status check error: {e}")
        raise HTTPException(status_code=500, detail=f"Status check failed: {str(e)}")


@api_router.post("/callbacks")
async def create_callback(data: CallbackCreate):
    """Save callback request"""
    callback_doc = {
        "id": str(uuid.uuid4()),
        "name": data.name,
        "phone": data.phone,
        "status": "pending",
        "createdAt": datetime.utcnow().isoformat(),
    }
    await db.callbacks.insert_one(callback_doc)
    logger.info(f"Callback requested: {data.phone}")
    return {"status": "ok", "message": "Callback request received"}


# Include the router in the main app
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
