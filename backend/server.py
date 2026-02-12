from fastapi import FastAPI, APIRouter, Request, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional, Dict
import uuid
from datetime import datetime

from emergentintegrations.payments.stripe.checkout import (
    StripeCheckout,
    CheckoutSessionResponse,
    CheckoutStatusResponse,
    CheckoutSessionRequest,
)

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Stripe
STRIPE_API_KEY = os.environ.get('STRIPE_API_KEY')
VIP_CONSULTATION_FEE = 150.00

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
    originUrl: str  # Frontend origin for redirect URLs

class ConsultationResponse(BaseModel):
    id: str
    checkoutUrl: str
    sessionId: str

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
async def create_consultation(data: ConsultationCreate, request: Request):
    """Step 1: Save lead info, Step 2: Create Stripe checkout session"""
    
    consultation_id = str(uuid.uuid4())
    
    # Save lead to MongoDB immediately (even if they don't pay)
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
    
    # Create Stripe checkout session
    try:
        host_url = str(request.base_url).rstrip("/")
        webhook_url = f"{host_url}api/webhook/stripe"
        
        stripe_checkout = StripeCheckout(api_key=STRIPE_API_KEY, webhook_url=webhook_url)
        
        origin = data.originUrl.rstrip("/")
        success_url = f"{origin}/checkout/success?session_id={{CHECKOUT_SESSION_ID}}"
        cancel_url = f"{origin}/checkout/cancel?consultation_id={consultation_id}"
        
        checkout_request = CheckoutSessionRequest(
            amount=VIP_CONSULTATION_FEE,
            currency="usd",
            success_url=success_url,
            cancel_url=cancel_url,
            metadata={
                "consultation_id": consultation_id,
                "customer_name": data.fullName,
                "customer_email": data.email,
                "customer_phone": data.phone,
                "type": "vip_consultation",
            },
        )
        
        session: CheckoutSessionResponse = await stripe_checkout.create_checkout_session(checkout_request)
        
        # Create payment transaction record
        payment_doc = {
            "id": str(uuid.uuid4()),
            "session_id": session.session_id,
            "consultation_id": consultation_id,
            "amount": VIP_CONSULTATION_FEE,
            "currency": "usd",
            "payment_status": "initiated",
            "status": "pending",
            "metadata": {
                "consultation_id": consultation_id,
                "customer_name": data.fullName,
                "customer_email": data.email,
            },
            "createdAt": datetime.utcnow().isoformat(),
        }
        await db.payment_transactions.insert_one(payment_doc)
        
        # Update consultation with session_id
        await db.consultations.update_one(
            {"id": consultation_id},
            {"$set": {"stripeSessionId": session.session_id}}
        )
        
        logger.info(f"Stripe session created: {session.session_id} for consultation {consultation_id}")
        
        return {
            "id": consultation_id,
            "checkoutUrl": session.url,
            "sessionId": session.session_id,
        }
        
    except Exception as e:
        logger.error(f"Stripe checkout creation failed: {e}")
        raise HTTPException(status_code=500, detail=f"Payment setup failed: {str(e)}")


@api_router.get("/consultations/status/{session_id}")
async def get_consultation_payment_status(session_id: str, request: Request):
    """Poll payment status after Stripe redirect"""
    
    # Check if already processed
    payment = await db.payment_transactions.find_one({"session_id": session_id})
    if not payment:
        raise HTTPException(status_code=404, detail="Payment session not found")
    
    # If already marked as paid, return immediately
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
    
    # Poll Stripe for current status
    try:
        host_url = str(request.base_url).rstrip("/")
        webhook_url = f"{host_url}api/webhook/stripe"
        stripe_checkout = StripeCheckout(api_key=STRIPE_API_KEY, webhook_url=webhook_url)
        
        checkout_status: CheckoutStatusResponse = await stripe_checkout.get_checkout_status(session_id)
        
        # Update payment transaction
        await db.payment_transactions.update_one(
            {"session_id": session_id},
            {"$set": {
                "status": checkout_status.status,
                "payment_status": checkout_status.payment_status,
                "updatedAt": datetime.utcnow().isoformat(),
            }}
        )
        
        # If paid, update consultation status
        if checkout_status.payment_status == "paid":
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
                logger.info(f"Consultation {consultation_id} confirmed - payment received")
        
        consultation = await db.consultations.find_one({"stripeSessionId": session_id})
        
        return {
            "status": checkout_status.status,
            "payment_status": checkout_status.payment_status,
            "amount_total": checkout_status.amount_total,
            "currency": checkout_status.currency,
            "consultation": {
                "id": consultation["id"] if consultation else None,
                "fullName": consultation.get("fullName") if consultation else None,
            } if consultation else None,
        }
        
    except Exception as e:
        logger.error(f"Status check failed: {e}")
        raise HTTPException(status_code=500, detail=f"Status check failed: {str(e)}")


@api_router.post("/webhook/stripe")
async def stripe_webhook(request: Request):
    """Handle Stripe webhooks"""
    try:
        body = await request.body()
        signature = request.headers.get("Stripe-Signature", "")
        
        host_url = str(request.base_url).rstrip("/")
        webhook_url = f"{host_url}api/webhook/stripe"
        stripe_checkout = StripeCheckout(api_key=STRIPE_API_KEY, webhook_url=webhook_url)
        
        webhook_response = await stripe_checkout.handle_webhook(body, signature)
        
        if webhook_response and webhook_response.payment_status == "paid":
            session_id = webhook_response.session_id
            
            # Update payment transaction
            await db.payment_transactions.update_one(
                {"session_id": session_id},
                {"$set": {
                    "payment_status": "paid",
                    "status": "complete",
                    "updatedAt": datetime.utcnow().isoformat(),
                }}
            )
            
            # Update consultation
            consultation_id = webhook_response.metadata.get("consultation_id")
            if consultation_id:
                await db.consultations.update_one(
                    {"id": consultation_id},
                    {"$set": {
                        "status": "confirmed",
                        "paymentStatus": "paid",
                        "paidAt": datetime.utcnow().isoformat(),
                    }}
                )
            
            logger.info(f"Webhook: Payment confirmed for session {session_id}")
        
        return {"status": "ok"}
    except Exception as e:
        logger.error(f"Webhook error: {e}")
        return {"status": "error", "message": str(e)}


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
