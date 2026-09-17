# Araku Tribe — Modern Stack Rebuild

Rebuild of the Araku Tribe e-commerce site (legacy PHP at `arakutribe.com`) on a modern stack.

## Structure

- `web/` — React + TypeScript (Vite) customer-facing web app. **Phase 1, in progress.**
- `backend/` — FastAPI Python backend (Phase 2, not yet started). Re-implements the contract already defined by the legacy `api/*.php` endpoints.
- `mobile/` — React Native app (Phase 3, not yet started).
- `infra/` — Terraform for AWS (RDS Postgres, ECS Fargate, S3, ALB) (Phase 4, not yet started).

## Current status

`backend/` (Phase 2) is now a working FastAPI + PostgreSQL implementation of
the `api/*.php` contract — same request/response shapes as the legacy PHP, so
`web/` talks to it with no frontend changes. See `backend/README.md` for the
endpoint list and auth/OTP flow.

`web/`'s page components are still mostly `ComingSoon` placeholders (Phase 1
scaffolding); wiring real pages up to the now-working backend is the next
piece of work.

### Local development

Start Postgres + the API:

```bash
docker compose up -d --build
```

Then the frontend:

```bash
cd web
npm install
npm run dev
```

The Vite dev server proxies `/api`, `/chatbot_api.php`, `/mail.php`, `/uploads`, and `/img` to `http://localhost:8000`, which is now this repo's own `backend/` service (see `backend/README.md`) rather than the legacy PHP app.
