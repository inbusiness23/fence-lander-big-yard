"""
Backend API Tests for ASAP Fence & Gates VIP Landing Page
Tests: consultations, callbacks, admin endpoints, Stripe checkout creation
"""
import pytest
import requests
import os
import uuid

# Use the public backend URL from environment
BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestHealthCheck:
    """Basic health check and API availability tests"""
    
    def test_api_root(self):
        """Test API root endpoint"""
        response = requests.get(f"{BASE_URL}/api/")
        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        assert data["message"] == "Hello World"
        print("✓ API root endpoint working")


class TestCallbackEndpoint:
    """Callback request endpoint tests"""
    
    def test_create_callback_success(self):
        """Test creating a callback request"""
        callback_data = {
            "name": f"TEST_User_{uuid.uuid4().hex[:6]}",
            "phone": "3215551234"
        }
        response = requests.post(f"{BASE_URL}/api/callbacks", json=callback_data)
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "ok"
        print("✓ Callback created successfully")
    
    def test_create_callback_phone_only(self):
        """Test creating callback with phone only (name optional)"""
        callback_data = {
            "phone": "3215559999"
        }
        response = requests.post(f"{BASE_URL}/api/callbacks", json=callback_data)
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "ok"
        print("✓ Callback with phone only created successfully")
    
    def test_create_callback_missing_phone(self):
        """Test callback fails without phone"""
        callback_data = {
            "name": "Test User"
        }
        response = requests.post(f"{BASE_URL}/api/callbacks", json=callback_data)
        # Should fail validation - phone is required
        assert response.status_code == 422
        print("✓ Callback correctly rejected without phone")


class TestConsultationEndpoint:
    """Consultation booking and Stripe checkout tests"""
    
    def test_create_consultation_success(self):
        """Test creating consultation and getting Stripe checkout URL"""
        consultation_data = {
            "fullName": f"TEST_Consultation_{uuid.uuid4().hex[:6]}",
            "email": "test@example.com",
            "phone": "(321) 555-4321",
            "address": "456 Pine Street, Sanford, FL 32771",
            "yardSize": "½ – ¾ Acre",
            "projectType": "New Fence Installation",
            "fenceStyle": "White Vinyl Privacy",
            "timeline": "Within 1 month",
            "message": "Test consultation from automated tests",
            "originUrl": "https://luxuryfence.preview.emergentagent.com"
        }
        response = requests.post(f"{BASE_URL}/api/consultations", json=consultation_data)
        assert response.status_code == 200
        data = response.json()
        
        # Verify response structure
        assert "id" in data, "Response should contain consultation ID"
        assert "checkoutUrl" in data, "Response should contain Stripe checkout URL"
        assert "sessionId" in data, "Response should contain Stripe session ID"
        
        # Verify checkout URL is valid Stripe URL
        assert data["checkoutUrl"].startswith("https://checkout.stripe.com/"), "Checkout URL should be Stripe"
        print(f"✓ Consultation created with ID: {data['id']}")
        print(f"✓ Stripe checkout URL returned: {data['checkoutUrl'][:50]}...")
    
    def test_create_consultation_without_phone(self):
        """Test consultation works WITHOUT phone (phone is now optional)"""
        consultation_data = {
            "fullName": f"TEST_NoPhone_{uuid.uuid4().hex[:6]}",
            "email": "nophone@gmail.com",
            "address": "123 Oak Street, Lake Mary, FL",
            "yardSize": "½ – ¾ Acre",
            "projectType": "New Fence Installation",
            "smsConsent": False,
            "originUrl": "https://luxuryfence.preview.emergentagent.com"
        }
        response = requests.post(f"{BASE_URL}/api/consultations", json=consultation_data)
        assert response.status_code == 200
        data = response.json()
        assert "checkoutUrl" in data
        assert "id" in data
        print("✓ Consultation WITHOUT phone works (phone is optional)")
    
    def test_create_consultation_with_sms_consent(self):
        """Test consultation with SMS consent = true and timestamp"""
        consultation_data = {
            "fullName": f"TEST_SMSConsent_{uuid.uuid4().hex[:6]}",
            "email": "smsconsent@gmail.com",
            "phone": "(321) 555-1234",
            "address": "456 Pine Ave, Sanford, FL",
            "yardSize": "¾ – 1 Acre",
            "projectType": "Fence Replacement",
            "smsConsent": True,
            "smsConsentTimestamp": "2026-02-12T17:00:00.000Z",
            "originUrl": "https://luxuryfence.preview.emergentagent.com"
        }
        response = requests.post(f"{BASE_URL}/api/consultations", json=consultation_data)
        assert response.status_code == 200
        data = response.json()
        assert "checkoutUrl" in data
        print("✓ Consultation with smsConsent=true and timestamp works")
    
    def test_create_consultation_without_sms_consent(self):
        """Test consultation with SMS consent = false (default)"""
        consultation_data = {
            "fullName": f"TEST_NoSMS_{uuid.uuid4().hex[:6]}",
            "email": "nosmsconsent@gmail.com",
            "phone": "(321) 555-5678",
            "address": "789 Maple Dr, Oviedo, FL",
            "yardSize": "¼ – ½ Acre",
            "projectType": "Both — Replace & Extend",
            "smsConsent": False,
            "originUrl": "https://luxuryfence.preview.emergentagent.com"
        }
        response = requests.post(f"{BASE_URL}/api/consultations", json=consultation_data)
        assert response.status_code == 200
        data = response.json()
        assert "checkoutUrl" in data
        print("✓ Consultation with smsConsent=false works")
    
    def test_create_consultation_required_fields_only(self):
        """Test consultation with only required fields (no phone, no optional fields)"""
        consultation_data = {
            "fullName": f"TEST_MinFields_{uuid.uuid4().hex[:6]}",
            "email": "minimal@test.com",
            "address": "789 Oak Ave, Lake Mary, FL 32746",
            "yardSize": "¼ – ½ Acre",
            "projectType": "Fence Replacement",
            "originUrl": "https://luxuryfence.preview.emergentagent.com"
        }
        response = requests.post(f"{BASE_URL}/api/consultations", json=consultation_data)
        assert response.status_code == 200
        data = response.json()
        assert "checkoutUrl" in data
        print("✓ Consultation with required fields only works (no phone)")
    
    def test_create_consultation_missing_required_field(self):
        """Test consultation fails without required fields"""
        consultation_data = {
            "fullName": "Test User",
            "email": "test@test.com",
            # Missing address, yardSize, projectType (phone is now optional)
            "originUrl": "https://example.com"
        }
        response = requests.post(f"{BASE_URL}/api/consultations", json=consultation_data)
        assert response.status_code == 422
        print("✓ Consultation correctly rejected without required fields")


class TestSMSConsentVerification:
    """Verify SMS consent is stored and returned in admin endpoints"""
    
    def test_sms_consent_stored_and_returned(self):
        """Create consultation with smsConsent and verify it appears in admin"""
        unique_name = f"TEST_SMSVerify_{uuid.uuid4().hex[:8]}"
        consultation_data = {
            "fullName": unique_name,
            "email": "smsverify@gmail.com",
            "phone": "(321) 555-9999",
            "address": "999 Test Lane, Sanford, FL",
            "yardSize": "½ – ¾ Acre",
            "projectType": "New Fence Installation",
            "smsConsent": True,
            "smsConsentTimestamp": "2026-02-12T17:30:00.000Z",
            "originUrl": "https://luxuryfence.preview.emergentagent.com"
        }
        
        # Create the consultation
        create_response = requests.post(f"{BASE_URL}/api/consultations", json=consultation_data)
        assert create_response.status_code == 200
        created_data = create_response.json()
        consultation_id = created_data["id"]
        
        # Fetch from admin endpoint
        admin_response = requests.get(f"{BASE_URL}/api/admin/consultations")
        assert admin_response.status_code == 200
        consultations = admin_response.json()
        
        # Find our consultation
        our_consultation = next((c for c in consultations if c["id"] == consultation_id), None)
        assert our_consultation is not None, f"Consultation {consultation_id} not found in admin"
        
        # Verify smsConsent is True
        assert our_consultation.get("smsConsent") == True, "smsConsent should be True"
        assert our_consultation.get("smsConsentTimestamp") == "2026-02-12T17:30:00.000Z", "smsConsentTimestamp should match"
        
        print(f"✓ SMS consent stored and returned correctly for {consultation_id}")


class TestAdminEndpoints:
    """Admin dashboard API tests"""
    
    def test_admin_stats(self):
        """Test admin stats endpoint returns correct structure"""
        response = requests.get(f"{BASE_URL}/api/admin/stats")
        assert response.status_code == 200
        data = response.json()
        
        # Verify all required fields
        assert "totalConsultations" in data
        assert "paidConsultations" in data
        assert "pendingConsultations" in data
        assert "totalCallbacks" in data
        
        # Verify values are integers
        assert isinstance(data["totalConsultations"], int)
        assert isinstance(data["paidConsultations"], int)
        assert isinstance(data["pendingConsultations"], int)
        assert isinstance(data["totalCallbacks"], int)
        
        # Verify logical consistency
        assert data["paidConsultations"] + data["pendingConsultations"] == data["totalConsultations"], \
            "Paid + pending should equal total consultations"
        
        print(f"✓ Admin stats: {data['totalConsultations']} leads, {data['paidConsultations']} paid, {data['totalCallbacks']} callbacks")
    
    def test_admin_consultations_list(self):
        """Test admin consultations endpoint returns list without _id"""
        response = requests.get(f"{BASE_URL}/api/admin/consultations")
        assert response.status_code == 200
        data = response.json()
        
        assert isinstance(data, list), "Should return a list"
        
        if len(data) > 0:
            # Verify no MongoDB _id field
            first = data[0]
            assert "_id" not in first, "Response should not contain MongoDB _id"
            
            # Verify expected fields present
            assert "id" in first
            assert "fullName" in first
            assert "email" in first
            assert "phone" in first
            assert "paymentStatus" in first
            
        print(f"✓ Admin consultations returned {len(data)} leads (no _id)")
    
    def test_admin_callbacks_list(self):
        """Test admin callbacks endpoint returns list without _id"""
        response = requests.get(f"{BASE_URL}/api/admin/callbacks")
        assert response.status_code == 200
        data = response.json()
        
        assert isinstance(data, list), "Should return a list"
        
        if len(data) > 0:
            first = data[0]
            assert "_id" not in first, "Response should not contain MongoDB _id"
            assert "id" in first
            assert "phone" in first
            
        print(f"✓ Admin callbacks returned {len(data)} requests (no _id)")


class TestConsultationStatusEndpoint:
    """Payment status endpoint tests"""
    
    def test_status_invalid_session(self):
        """Test status check with invalid session ID returns 404"""
        response = requests.get(f"{BASE_URL}/api/consultations/status/invalid_session_id")
        assert response.status_code == 404
        print("✓ Invalid session correctly returns 404")


class TestStripeWebhook:
    """Stripe webhook endpoint tests - new feature for real-time payment updates"""
    
    def test_webhook_checkout_completed(self):
        """Test stripe-webhook accepts checkout.session.completed events"""
        payload = {
            "type": "checkout.session.completed",
            "data": {
                "object": {
                    "payment_status": "paid",
                    "metadata": {
                        "consultation_id": "test-webhook-id-123"
                    }
                }
            }
        }
        response = requests.post(f"{BASE_URL}/api/stripe-webhook", json=payload)
        assert response.status_code == 200
        data = response.json()
        assert data.get("received") == True
        print("✓ Webhook checkout.session.completed returns {received: true}")
    
    def test_webhook_async_payment_succeeded(self):
        """Test stripe-webhook accepts async_payment_succeeded events"""
        payload = {
            "type": "checkout.session.async_payment_succeeded",
            "data": {
                "object": {
                    "payment_status": "paid",
                    "metadata": {
                        "consultation_id": "test-async-id-456"
                    }
                }
            }
        }
        response = requests.post(f"{BASE_URL}/api/stripe-webhook", json=payload)
        assert response.status_code == 200
        data = response.json()
        assert data.get("received") == True
        print("✓ Webhook checkout.session.async_payment_succeeded works")
    
    def test_webhook_unknown_event(self):
        """Test webhook handles unknown event types gracefully"""
        payload = {
            "type": "unknown.event.type",
            "data": {"object": {}}
        }
        response = requests.post(f"{BASE_URL}/api/stripe-webhook", json=payload)
        assert response.status_code == 200
        data = response.json()
        assert data.get("received") == True
        print("✓ Webhook handles unknown events gracefully")
    
    def test_webhook_invalid_payload(self):
        """Test webhook rejects invalid JSON"""
        response = requests.post(
            f"{BASE_URL}/api/stripe-webhook", 
            data="not valid json",
            headers={"Content-Type": "application/json"}
        )
        assert response.status_code == 400
        print("✓ Webhook rejects invalid payload with 400")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
