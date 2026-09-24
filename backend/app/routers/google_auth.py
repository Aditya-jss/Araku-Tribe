import logging
import secrets
from urllib.parse import urlencode

import httpx
from fastapi import APIRouter, Request, Response
from fastapi.responses import RedirectResponse

from app.config import settings
from app.database import SessionLocal
from app.models.user import User
from app.security import create_access_token, hash_password

router = APIRouter(prefix="/api/auth/google", tags=["google-auth"])
logger = logging.getLogger("arakutribe.google_auth")

STATE_COOKIE = "google_oauth_state"
AUTHORIZE_URL = "https://accounts.google.com/o/oauth2/v2/auth"
TOKEN_URL = "https://oauth2.googleapis.com/token"
USERINFO_URL = "https://www.googleapis.com/oauth2/v3/userinfo"


@router.get("/login")
def google_login(response: Response):
    if not settings.google_client_id or not settings.google_client_secret:
        return RedirectResponse(
            f"{settings.frontend_base_url}/login?error=google_not_configured", status_code=302
        )

    state = secrets.token_urlsafe(24)
    params = {
        "client_id": settings.google_client_id,
        "redirect_uri": settings.google_redirect_uri,
        "response_type": "code",
        "scope": "openid email profile",
        "state": state,
        "access_type": "online",
        "prompt": "select_account",
    }
    redirect = RedirectResponse(f"{AUTHORIZE_URL}?{urlencode(params)}", status_code=302)
    redirect.set_cookie(STATE_COOKIE, state, max_age=600, httponly=True, samesite="lax")
    return redirect


@router.get("/callback")
async def google_callback(request: Request):
    def fail(reason: str) -> RedirectResponse:
        logger.warning("Google OAuth failed: %s", reason)
        return RedirectResponse(f"{settings.frontend_base_url}/login?error=google_auth_failed", status_code=302)

    if request.query_params.get("error"):
        return fail(request.query_params["error"])

    code = request.query_params.get("code")
    state = request.query_params.get("state")
    cookie_state = request.cookies.get(STATE_COOKIE)
    if not code or not state or not cookie_state or state != cookie_state:
        return fail("missing or mismatched state")

    async with httpx.AsyncClient(timeout=10) as client:
        try:
            token_res = await client.post(
                TOKEN_URL,
                data={
                    "code": code,
                    "client_id": settings.google_client_id,
                    "client_secret": settings.google_client_secret,
                    "redirect_uri": settings.google_redirect_uri,
                    "grant_type": "authorization_code",
                },
            )
            token_res.raise_for_status()
            access_token = token_res.json()["access_token"]

            userinfo_res = await client.get(USERINFO_URL, headers={"Authorization": f"Bearer {access_token}"})
            userinfo_res.raise_for_status()
            profile = userinfo_res.json()
        except (httpx.HTTPError, KeyError) as exc:
            return fail(f"token/userinfo exchange error: {exc}")

    google_id = profile.get("sub")
    email = (profile.get("email") or "").strip().lower()
    if not google_id or not email:
        return fail("incomplete Google profile")

    db = SessionLocal()
    try:
        user = db.query(User).filter((User.google_id == google_id) | (User.email == email)).one_or_none()
        if user is None:
            user = User(
                firstname=profile.get("given_name") or "Google",
                lastname=profile.get("family_name") or "User",
                email=email,
                phonenumber="",
                password_hash=hash_password(secrets.token_urlsafe(32)),
                google_id=google_id,
                is_verified=True,
            )
            db.add(user)
        elif user.google_id is None:
            # Existing password-based account with the same email — link it
            # rather than creating a second account for the same person.
            user.google_id = google_id
            user.is_verified = True
        db.commit()

        token = create_access_token(user.user_id)
    finally:
        db.close()

    redirect = RedirectResponse(f"{settings.frontend_base_url}/auth/google/complete?token={token}", status_code=302)
    redirect.delete_cookie(STATE_COOKIE)
    return redirect
