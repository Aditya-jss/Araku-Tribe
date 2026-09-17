# Araku Tribe — Modern Stack Rebuild

Rebuild of the Araku Tribe e-commerce site (legacy PHP at `arakutribe.com`) on a modern stack.

## Structure

- `web/` — React + TypeScript (Vite) customer-facing web app. **Phase 1, in progress.**
- `backend/` — FastAPI Python backend (Phase 2, not yet started). Re-implements the contract already defined by the legacy `api/*.php` endpoints.
- `mobile/` — React Native app (Phase 3, not yet started).
- `infra/` — Terraform for AWS (RDS Postgres, ECS Fargate, S3, ALB) (Phase 4, not yet started).

## Current status

`web/` is wired to the **existing legacy PHP API** (`api/*.php` in the `arakutribe.com` repo) as its backend for now, so the frontend can be built and demoed without waiting on the FastAPI rewrite. See that repo's `api/` directory for the contract being mirrored.

### Local development

```bash
cd web
npm install
npm run dev
```

The Vite dev server proxies `/api`, `/chatbot_api.php`, `/mail.php`, `/uploads`, and `/img` to `http://localhost:8000`, where the legacy PHP app should be running locally (e.g. `php -S localhost:8000` from the `arakutribe.com` repo root).
