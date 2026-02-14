# Branch Protection Checklist

Use this once in GitHub settings.

## 1) Protect `main` (production)
Repository -> Settings -> Branches -> Add branch protection rule for `main`:

- [ ] Require a pull request before merging
- [ ] Require approvals: 1
- [ ] Dismiss stale approvals when new commits are pushed
- [ ] Require conversation resolution before merging
- [ ] Require status checks to pass before merging (enable once CI checks exist)
- [ ] Require branches to be up to date before merging
- [ ] Restrict who can push to matching branches (optional for solo)
- [ ] Do not allow force pushes
- [ ] Do not allow deletions

## 2) Protect `dev` (integration)
Add rule for `dev`:

- [ ] Require a pull request before merging
- [ ] Require approvals: 0 or 1 (recommended: 0 when solo)
- [ ] Require conversation resolution before merging
- [ ] Allow maintainers to bypass optional checks when needed
- [ ] Do not allow force pushes

## 3) Repo defaults
Repository -> Settings -> General:

- [ ] Set default branch to `main`
- [ ] Enable auto-delete head branches after merge
- [ ] Enable merge queue only if you start batching many PRs

## 4) PR discipline for this project
- Feature work: `feature/*` -> `dev`
- Release to production: `dev` -> `main`
- Hotfix (urgent): `hotfix/*` -> `main`, then back-merge to `dev`

## 5) Practical release gate
Before merging `dev` -> `main`:

- [ ] Render backend healthy at `/api/`
- [ ] Vercel prod env var `REACT_APP_BACKEND_URL` is correct
- [ ] Stripe webhook endpoint is active
- [ ] Lead flow tested end-to-end with a real/test payment
