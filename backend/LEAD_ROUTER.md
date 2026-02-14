# Lead Router API (My Salesman Automation)

## Endpoints

- `POST /api/lead-router/webhook`
- `POST /api/lead-router/inbound-sms`

If `LEAD_ROUTER_WEBHOOK_SECRET` is set, include header:

- `x-webhook-secret: <secret>`

## 1) Classify lead and route follow-up

### Request

```json
{
  "leadId": "opp_123",
  "contactId": "optional-existing-contact-id",
  "firstName": "John",
  "lastName": "Doe",
  "fullName": "John Doe",
  "phone": "+19415551212",
  "email": "john@example.com",
  "address": "123 Main St, Bradenton, FL",
  "locationId": "optional-ghl-location-id"
}
```

### Response (example)

```json
{
  "leadId": "opp_123",
  "address": "123 Main St, Bradenton, FL",
  "lat": 27.49,
  "lng": -82.57,
  "eligibilityClass": "B",
  "confidence": "0.78",
  "reason": "Streets and nearby homes visible; target lot unclear.",
  "crmTag": "MS-B-NEARBY-HOME",
  "recommendedAction": "Send My Salesman link with nearby-home example instructions.",
  "messageTemplate": "...",
  "tagsApplied": ["MS-AUTO-ROUTED", "MS-B-NEARBY-HOME", "MS-SEND-LINK"],
  "sendMode": "tag_only",
  "contactId": "abc123",
  "directSmsSent": false
}
```

## 2) Detect mobile-friction inbound replies

### Request

```json
{
  "contactId": "abc123",
  "message": "this map is not working on my phone",
  "phone": "+19415551212",
  "locationId": "optional"
}
```

### Behavior

- Detects mobile-friction keywords.
- Applies tags `MS-MOBILE-TROUBLE`, `MS-MANUAL-ESTIMATE-REQUIRED`.
- Optionally sends assist reply when `LEAD_ROUTER_SEND_MOBILE_ASSIST_REPLY=true`.

## Recommended mode

Use `LEAD_ROUTER_SEND_MODE=tag_only` first. Let GHL workflows send the actual SMS based on tags:

- `MS-A-VISIBLE` -> send normal My Salesman message
- `MS-B-NEARBY-HOME` -> send nearby-home workaround message
- `MS-C-SKIP` -> do not send tool link; create manual intake task

Switch to `direct_sms` later only if you specifically want this API to send SMS directly.

## Curl example

```bash
curl -X POST http://localhost:8000/api/lead-router/webhook \
  -H 'Content-Type: application/json' \
  -H 'x-webhook-secret: your-secret' \
  -d '{
    "leadId": "opp_123",
    "firstName": "Jane",
    "phone": "+19415550123",
    "address": "123 Main St, Bradenton, FL"
  }'
```
