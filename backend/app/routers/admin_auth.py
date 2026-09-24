from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException, Request, Response
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session

from app.config import settings
from app.database import get_db
from app.deps import get_current_admin
from app.email import send_otp_email
from app.models.admin import Admin
from app.security import (
    create_admin_access_token,
    create_pending_token,
    decode_pending_token,
    generate_otp,
    hash_password,
    verify_password,
)

router = APIRouter(prefix="/api/admin/auth", tags=["admin-auth"])

PENDING_COOKIE = "admin_pending_session"
OTP_TTL_MINUTES = 10
MAX_OTP_ATTEMPTS = 5


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class AdminOut(BaseModel):
    admin_id: int
    email: str
    firstname: str
    lastname: str
    role: str


class LoginResponse(BaseModel):
    token: str
    admin: AdminOut


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    otp: str
    password: str


class MessageResponse(BaseModel):
    message: str


def _admin_out(admin: Admin) -> AdminOut:
    return AdminOut(
        admin_id=admin.admin_id,
        email=admin.email,
        firstname=admin.firstname,
        lastname=admin.lastname,
        role=admin.role,
    )


@router.post("/login", response_model=LoginResponse)
def login(body: LoginRequest, db: Session = Depends(get_db)):
    email = body.email.strip().lower()
    admin = db.query(Admin).filter(Admin.email == email).one_or_none()
    if admin is None or not verify_password(body.password, admin.password_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token = create_admin_access_token(admin.admin_id)
    return LoginResponse(token=token, admin=_admin_out(admin))


@router.get("/me", response_model=AdminOut)
def me(admin: Admin = Depends(get_current_admin)):
    return _admin_out(admin)


@router.post("/forgot-password", response_model=MessageResponse)
def forgot_password(body: ForgotPasswordRequest, response: Response, db: Session = Depends(get_db)):
    email = body.email.strip().lower()
    admin = db.query(Admin).filter(Admin.email == email).one_or_none()

    if admin is not None:
        otp = generate_otp()
        admin.otp_code = otp
        admin.otp_expires_at = datetime.now(timezone.utc) + timedelta(minutes=OTP_TTL_MINUTES)
        admin.otp_attempts = 0
        db.commit()
        send_otp_email(admin.email, otp, "admin_password_reset")

        token = create_pending_token(admin.admin_id, "admin_password_reset")
        response.set_cookie(
            PENDING_COOKIE,
            token,
            max_age=settings.pending_token_expire_minutes * 60,
            httponly=True,
            samesite="lax",
        )

    return MessageResponse(message="If that admin account exists, an OTP has been sent.")


@router.post("/reset-password", response_model=MessageResponse)
def reset_password(body: ResetPasswordRequest, request: Request, response: Response, db: Session = Depends(get_db)):
    if len(body.password) < 8:
        raise HTTPException(status_code=400, detail="Password must be at least 8 characters")

    admin_id = decode_pending_token(request.cookies.get(PENDING_COOKIE), "admin_password_reset")
    if admin_id is None:
        raise HTTPException(status_code=401, detail="Verification session expired, please start again")

    admin = db.get(Admin, admin_id)
    if admin is None:
        raise HTTPException(status_code=401, detail="Verification session expired, please start again")

    if (
        admin.otp_code is None
        or admin.otp_expires_at is None
        or admin.otp_expires_at < datetime.now(timezone.utc)
    ):
        raise HTTPException(status_code=400, detail="Invalid or expired OTP")

    if admin.otp_code != body.otp:
        admin.otp_attempts += 1
        if admin.otp_attempts >= MAX_OTP_ATTEMPTS:
            admin.otp_code = None
            admin.otp_expires_at = None
        db.commit()
        raise HTTPException(status_code=400, detail="Invalid or expired OTP")

    admin.password_hash = hash_password(body.password)
    admin.otp_code = None
    admin.otp_expires_at = None
    db.commit()

    response.delete_cookie(PENDING_COOKIE)
    return MessageResponse(message="Password reset. You can now log in.")
