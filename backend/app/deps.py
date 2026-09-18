from fastapi import Depends, Header, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.admin import ROLES, Admin
from app.models.user import User
from app.security import decode_access_token, decode_admin_access_token


def get_current_user(
    authorization: str | None = Header(default=None),
    db: Session = Depends(get_db),
) -> User:
    if not authorization or not authorization.lower().startswith("bearer "):
        raise HTTPException(status_code=401, detail="Not authenticated")

    token = authorization.split(" ", 1)[1].strip()
    user_id = decode_access_token(token)
    if user_id is None:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    user = db.get(User, user_id)
    if user is None:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    return user


def get_current_user_optional(
    authorization: str | None = Header(default=None),
    db: Session = Depends(get_db),
) -> User | None:
    """Like get_current_user, but returns None instead of raising when there's
    no (or an invalid) token — for endpoints usable by both guests and
    signed-in customers, such as the AI chat assistant."""
    if not authorization or not authorization.lower().startswith("bearer "):
        return None
    user_id = decode_access_token(authorization.split(" ", 1)[1].strip())
    if user_id is None:
        return None
    return db.get(User, user_id)


def get_current_admin(
    authorization: str | None = Header(default=None),
    db: Session = Depends(get_db),
) -> Admin:
    if not authorization or not authorization.lower().startswith("bearer "):
        raise HTTPException(status_code=401, detail="Not authenticated")

    token = authorization.split(" ", 1)[1].strip()
    admin_id = decode_admin_access_token(token)
    if admin_id is None:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    admin = db.get(Admin, admin_id)
    if admin is None:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    return admin


def require_role(minimum: str):
    """FastAPI dependency factory: require an authenticated admin whose role
    is at least `minimum` (see ROLES for the ordering)."""
    if minimum not in ROLES:
        raise ValueError(f"Unknown role: {minimum}")

    def dependency(admin: Admin = Depends(get_current_admin)) -> Admin:
        if not admin.has_role_at_least(minimum):
            raise HTTPException(status_code=403, detail="Insufficient permissions")
        return admin

    return dependency
