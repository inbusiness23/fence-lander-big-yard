# ASAP Fence & Gates — Large Yard Division Landing Page

## Problem Statement
Premium lead-generation landing page for ASAP Fence & Gates' Large Yard Division. Targets homeowners in Seminole County, FL with properties 1/4 acre+ expecting $7,500+ fence projects. Two conversion goals: call (321) 486-6414 or book a $150 VIP Consultation via Stripe.

## Tech Stack
- **Frontend:** React, TailwindCSS, Shadcn/UI
- **Backend:** FastAPI, Python
- **Database:** MongoDB
- **Payments:** Stripe (checkout + webhook)
- **CRM:** GoHighLevel (GHL) — sole notification/lead system
- **Analytics:** Google Tag Manager

## What's Been Implemented

### Landing Page
- [x] All sections (Hero, Services, Before/After, FAQ, CTA, etc.)
- [x] Mobile-first responsive — zero overflow on 375px
- [x] "Book VIP Consultation" scrolls directly to form

### Form & Validation
- [x] Two-step checkout (details -> Stripe payment)
- [x] Email validator catches common domain typos with clickable suggestion
- [x] Phone field is OPTIONAL
- [x] A2P-compliant SMS consent checkbox with TCPA verbiage + Privacy Policy/Terms links
- [x] Address placeholder: "i.e., 123 Oak Lane, Sanford, FL 32771"

### Backend & Integrations
- [x] Lead capture, callback requests, Stripe checkout + webhook
- [x] GHL push with routing tags (LP-VIP-Consultation, LP-Callback-Request, LP-Paid-$150, SMS-Opted-In)
- [x] Admin dashboard at /admin
- [x] GTM (GTM-5T4NDMF)

### Legal Pages
- [x] Privacy Policy at /privacy (SMS/TCPA section, data collection, Stripe, GHL disclosure)
- [x] Terms of Service at /terms (consultation fee, satisfaction guarantee, SMS terms)
- [x] Footer links to both pages
- [x] SMS consent text links to both pages

### UI
- [x] "Made with Emergent" badge hidden
- [x] Footer: Privacy Policy + Terms of Service links (removed Sitemap)

## Testing Status
- Backend: 100% (19/19 tests)
- Frontend: 100% (all features verified across 3 iterations)
- Mobile: Zero overflow on 375px

## Backlog
- Google Places Autocomplete for address (needs API key)
- Admin authentication
- Lead CSV export
- A/B headline testing
