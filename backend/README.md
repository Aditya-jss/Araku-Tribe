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
