# Araku Tribe API (backend)

FastAPI + PostgreSQL rewrite of the legacy `api/*.php` endpoints. It implements
the exact same contract the `web/` frontend already calls (`action`-based,
form-encoded requests, JSON responses shaped like `{ success, ... }`), so
`web/` needs no changes to point at it.

## Endpoints

All paths match the legacy PHP filenames for drop-in compatibility, dispatched
by an `action` field (query string on GET, form body on POST):

- `POST/GET /api/auth.php` — `signup`, `login`, `resend_otp`, `verify_otp`, `logout`, `forgot_password`, `reset_password`
- `POST/GET /api/products.php` — `list`, `detail`
- `POST/GET /api/cart.php` — `get`, `add`, `update` (requires `Authorization: Bearer <token>`)
- `POST/GET /api/orders.php` — `place`, `list`, `detail`, `cancel` (requires auth)
- `POST/GET /api/profile.php` — `get`, `update`, `delete_account` (requires auth)
- `POST /api/profile_picture.php` — multipart upload (requires auth)

Login/signup/forgot_password issue a one-time code (logged to stdout by the
stub mailer in `app/email.py` — swap in a real provider later) and set a
short-lived `pending_session` httpOnly cookie identifying which user the
follow-up `resend_otp`/`verify_otp`/`reset_password` call is for, matching how
the legacy PHP session-based flow worked. `verify_otp` exchanges the OTP for a
JWT bearer token used on every subsequent request.

## Admin API

Unlike the customer endpoints above, the admin API is a fresh JSON REST
design under `/api/admin/*` (no legacy contract to preserve) — deliberately
**not** replicating the legacy admin panel's security model, which had
critical vulnerabilities (SQL injection, no auth on some pages, self-service
admin signup, password reset by email alone). Notable differences here:

- **No public admin signup.** The first superadmin is bootstrapped via
  `python -m app.seed_admin` (reads `ADMIN_EMAIL`/`ADMIN_PASSWORD`/
  `ADMIN_FIRSTNAME`/`ADMIN_LASTNAME` env vars, safe to re-run). Every other
  admin account is created by an existing superadmin through
  `POST /api/admin/admins`.
- **Role-gated on every endpoint**, not just in the UI: `staff` < `manager` <
  `admin` < `superadmin` (see `app/models/admin.py`). Staff can only move a
  product's stock quantity; manager+ can fully manage products and orders;
  admin+ can manage customer accounts; superadmin manages other admins and
  can delete products/customers.
- **Password reset requires an OTP** (same mechanism as customers), not
  "reset by email alone."
- A superadmin can't delete or demote themselves out of existence — the API
  blocks removing the last remaining superadmin.

Endpoints: `/api/admin/auth/{login,me,forgot-password,reset-password}`,
`/api/admin/dashboard`, `/api/admin/inventory-alerts`,
`/api/admin/products` (+ `/{id}`), `/api/admin/users` (+ `/{id}`),
`/api/admin/orders` (+ `/{id}`, `/{id}/status`), `/api/admin/admins` (+ `/{id}`).

Products carry a `min_order_quantity` that doubles as a low-stock reorder
threshold — `low_stock_alerted` flips on when stock dips to or below it
(checked on every admin edit, checkout, and cancellation) and resets once
restocked above it, so `/api/admin/inventory-alerts` only re-surfaces a
product after a fresh dip rather than on every request.

## Local development

Requires Docker (for Postgres) and Python 3.12+.

```bash
# from the repo root: start Postgres only
docker compose up -d db

cd backend
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env   # defaults already point at the docker-compose db

alembic upgrade head    # create schema
python -m app.seed      # load demo products
ADMIN_EMAIL=you@example.com ADMIN_PASSWORD=changeme123 python -m app.seed_admin  # bootstrap the first superadmin
uvicorn app.main:app --reload --port 8000
```

The `web/` Vite dev server proxies `/api`, `/uploads`, etc. to
`http://localhost:8000` already, so `npm run dev` in `web/` talks to this
straight away.

## Running everything with Docker Compose

```bash
docker compose up -d --build
```

This starts Postgres and the API (migrations + seed run automatically on
container start, see `Dockerfile`). The API is on `http://localhost:8000`.

## Migrations

Schema changes go through Alembic:

```bash
alembic revision --autogenerate -m "describe the change"
alembic upgrade head
```
