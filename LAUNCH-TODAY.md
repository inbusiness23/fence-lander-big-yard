# ASAP Launch (Vercel + Render)

This path is optimized for "live today" with preview deployments and no coding on production.

## 0) Branch model (5 minutes)
1. Keep `main` as production only.
2. Create `dev` for ongoing work.
3. Use short feature branches from `dev`.

## 1) Deploy backend first on Render (20-30 minutes)
1. Open Render and create a new Web Service from this repo.
2. Render should read `render.yaml` automatically.
3. Confirm settings:
   - Root directory: `backend`
   - Build command: `pip install -r requirements-deploy.txt`
   - Start command: `uvicorn server:app --host 0.0.0.0 --port $PORT`
4. Add environment variables from `backend/.env.example`.
5. Deploy and copy backend URL (example: `https://asap-fence-backend.onrender.com`).
6. Verify backend health URL:
   - `https://YOUR-BACKEND-URL/api/`

## 2) Deploy frontend on Vercel (15-25 minutes)
1. In Vercel, import this repo.
2. Set project root directory to `frontend`.
3. Confirm Vercel settings (from `frontend/vercel.json`):
   - Install: `yarn install --frozen-lockfile`
   - Build: `yarn build`
   - Output: `build`
4. Add environment variable:
   - `REACT_APP_BACKEND_URL=https://YOUR-BACKEND-URL`
5. Deploy.

## 3) Wire Stripe webhook (10 minutes)
1. In Stripe dashboard, add webhook endpoint:
   - `https://YOUR-BACKEND-URL/api/stripe-webhook`
2. Subscribe to events:
   - `checkout.session.completed`
   - `checkout.session.async_payment_succeeded`
3. Copy webhook signing secret into Render env var:
   - `STRIPE_WEBHOOK_SECRET`
4. Redeploy backend (or restart service).

## 4) Smoke test before ads (15 minutes)
1. Open production frontend URL.
2. Submit callback form.
3. Submit consultation form and verify redirect to Stripe checkout.
4. Complete test payment and verify success page loads.
5. Verify lead appears in:
   - Mongo collections
   - GHL contact list (if configured)

## 5) Safe iteration workflow (ongoing)
1. Work on `dev` branch.
2. Every PR gets Vercel preview URL.
3. Test preview URL before merge.
4. Merge to `main` only when ready to go live.

## Required env vars summary
Frontend:
- `REACT_APP_BACKEND_URL`

Backend:
- `MONGO_URL`
- `DB_NAME`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `GHL_API_KEY`
- `GHL_LOCATION_ID`

## Notes for fastest path
- If GHL is not ready, you can still launch. The backend logs warning and continues.
- Stripe key must be valid for checkout to work.
- Keep DNS/domain cutover after smoke test passes.
