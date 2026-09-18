from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException, Request, Response
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.config import settings
from app.database import get_db
from app.email import send_otp_email
from app.models.user import User
from app.security import (
    create_access_token,
    create_pending_token,
    decode_pending_token,
    generate_otp,
    hash_password,
    verify_password,
)
from app.utils import get_request_data, require_fields

router = APIRouter()

PENDING_COOKIE = "pending_session"
OTP_TTL_MINUTES = 10
MAX_OTP_ATTEMPTS = 5


def _normalize_email(email: str) -> str:
    return email.strip().lower()


def _set_pending_cookie(response: Response, user_id: int, purpose: str) -> None:
    token = create_pending_token(user_id, purpose)
    response.set_cookie(
        PENDING_COOKIE,
        token,
        max_age=settings.pending_token_expire_minutes * 60,
        httponly=True,
        samesite="lax",
    )


def _issue_otp(user: User, purpose: str) -> str:
    otp = generate_otp()
    user.otp_code = otp
    user.otp_expires_at = datetime.now(timezone.utc) + timedelta(minutes=OTP_TTL_MINUTES)
    user.otp_attempts = 0
    send_otp_email(user.email, otp, purpose)
    return otp


def _check_otp(user: User, submitted: str, db: Session) -> None:
    """Validates an OTP, tracking failed attempts to prevent brute-forcing the
    6-digit code within its TTL. Raises HTTPException on any failure."""
    if user.otp_code is None or user.otp_expires_at is None or user.otp_expires_at < datetime.now(timezone.utc):
        raise HTTPException(status_code=400, detail="Invalid or expired OTP")

    if user.otp_code != submitted:
        user.otp_attempts += 1
        if user.otp_attempts >= MAX_OTP_ATTEMPTS:
            user.otp_code = None
            user.otp_expires_at = None
        db.commit()
        raise HTTPException(status_code=400, detail="Invalid or expired OTP")


def _user_public(user: User) -> dict:
    return {
        "user_id": user.user_id,
        "firstname": user.firstname,
        "lastname": user.lastname,
        "email": user.email,
        "phonenumber": user.phonenumber,
    }


def _pending_user(request: Request, db: Session, purpose: str) -> User:
    user_id = decode_pending_token(request.cookies.get(PENDING_COOKIE), purpose)
    if user_id is None:
        raise HTTPException(status_code=401, detail="Verification session expired, please start again")
    user = db.get(User, user_id)
    if user is None:
        raise HTTPException(status_code=401, detail="Verification session expired, please start again")
    return user


@router.api_route("/api/auth.php", methods=["GET", "POST"])
async def auth_endpoint(request: Request, response: Response, db: Session = Depends(get_db)):
    data = await get_request_data(request)
    action = data.get("action", "")

    if action == "signup":
        return _signup(data, response, db)
    if action == "login":
        return _login(data, response, db)
    if action == "resend_otp":
        return _resend_otp(request, response, db)
    if action == "verify_otp":
        return _verify_otp(data, request, response, db)
    if action == "logout":
        return _logout(response)
    if action == "forgot_password":
        return _forgot_password(data, response, db)
    if action == "reset_password":
        return _reset_password(data, request, response, db)

    raise HTTPException(status_code=400, detail=f"Unknown action: {action}")


def _signup(data: dict, response: Response, db: Session) -> dict:
    require_fields(data, "firstname", "lastname", "email", "phonenumber", "password", "repeat_password")
    if data["password"] != data["repeat_password"]:
        raise HTTPException(status_code=400, detail="Passwords do not match")
    if len(data["password"]) < 8:
        raise HTTPException(status_code=400, detail="Password must be at least 8 characters")

    email = _normalize_email(data["email"])
    existing = db.query(User).filter(User.email == email).one_or_none()
    if existing is not None:
        raise HTTPException(status_code=409, detail="An account with that email already exists")

    user = User(
        firstname=data["firstname"],
        lastname=data["lastname"],
        email=email,
        phonenumber=data["phonenumber"],
        password_hash=hash_password(data["password"]),
        is_verified=False,
    )
    db.add(user)
    try:
        db.flush()
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=409, detail="An account with that email already exists") from None
    _issue_otp(user, "signup")
    db.commit()

    _set_pending_cookie(response, user.user_id, "otp_auth")
    return {"success": True, "message": "Account created. Enter the OTP sent to your email to verify."}


def _login(data: dict, response: Response, db: Session) -> dict:
    require_fields(data, "email", "password")

    email = _normalize_email(data["email"])
    user = db.query(User).filter(User.email == email).one_or_none()
    if user is None or not verify_password(data["password"], user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    _issue_otp(user, "login")
    db.commit()

    _set_pending_cookie(response, user.user_id, "otp_auth")
    return {"success": True, "message": "OTP sent to your email."}


def _resend_otp(request: Request, response: Response, db: Session) -> dict:
    user = _pending_user(request, db, "otp_auth")
    _issue_otp(user, "resend")
    db.commit()
    _set_pending_cookie(response, user.user_id, "otp_auth")
    return {"success": True, "message": "OTP resent to your email."}


def _verify_otp(data: dict, request: Request, response: Response, db: Session) -> dict:
    require_fields(data, "otp")
    user = _pending_user(request, db, "otp_auth")
    _check_otp(user, data["otp"], db)

    user.is_verified = True
    user.otp_code = None
    user.otp_expires_at = None
    db.commit()

    response.delete_cookie(PENDING_COOKIE)
    token = create_access_token(user.user_id)
    return {"success": True, "token": token, "user": _user_public(user)}


def _logout(response: Response) -> dict:
    response.delete_cookie(PENDING_COOKIE)
    return {"success": True}


def _forgot_password(data: dict, response: Response, db: Session) -> dict:
    require_fields(data, "email")
    email = _normalize_email(data["email"])
    user = db.query(User).filter(User.email == email).one_or_none()

    # Always respond the same way whether or not the account exists, so this
    # endpoint can't be used to enumerate registered emails. The OTP/cookie is
    # only actually issued when there's a real account to reset.
    if user is not None:
        _issue_otp(user, "password_reset")
        db.commit()
        _set_pending_cookie(response, user.user_id, "password_reset")

    return {"success": True, "message": "If an account exists for that email, an OTP has been sent."}


def _reset_password(data: dict, request: Request, response: Response, db: Session) -> dict:
    require_fields(data, "otp", "password", "repeat_password")
    if data["password"] != data["repeat_password"]:
        raise HTTPException(status_code=400, detail="Passwords do not match")
    if len(data["password"]) < 8:
        raise HTTPException(status_code=400, detail="Password must be at least 8 characters")

    user = _pending_user(request, db, "password_reset")
    _check_otp(user, data["otp"], db)

    user.password_hash = hash_password(data["password"])
    user.otp_code = None
    user.otp_expires_at = None
    db.commit()

    response.delete_cookie(PENDING_COOKIE)
    return {"success": True, "message": "Password reset. You can now log in."}
