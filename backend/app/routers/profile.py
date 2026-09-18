import os
import uuid

from fastapi import APIRouter, Depends, HTTPException, Request, UploadFile
from sqlalchemy.orm import Session

from app.config import settings
from app.database import get_db
from app.deps import get_current_user
from app.models.user import User
from app.security import verify_password
from app.services.users import delete_user_cascade
from app.utils import get_request_data, require_fields

router = APIRouter()

ALLOWED_IMAGE_TYPES = {"image/png", "image/jpeg", "image/webp"}
EXT_BY_TYPE = {"image/png": ".png", "image/jpeg": ".jpg", "image/webp": ".webp"}


def _profile_public(user: User) -> dict:
    return {
        "firstname": user.firstname,
        "lastname": user.lastname,
        "email": user.email,
        "phonenumber": user.phonenumber,
        "area": user.area,
        "landmark": user.landmark,
        "zipcode": user.zipcode,
        "profile_picture": user.profile_picture,
    }


@router.api_route("/api/profile.php", methods=["GET", "POST"])
async def profile_endpoint(
    request: Request,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    data = await get_request_data(request)
    action = data.get("action", "")

    if action == "get":
        return {"success": True, "user": _profile_public(user)}
    if action == "update":
        return _update(data, user, db)
    if action == "delete_account":
        return _delete_account(data, user, db)

    raise HTTPException(status_code=400, detail=f"Unknown action: {action}")


def _update(data: dict, user: User, db: Session) -> dict:
    # area/landmark/zipcode are optional address fields (default "") and must
    # stay excluded from require_fields so a user can submit them blank to
    # clear a previously-set address.
    require_fields(data, "firstname", "lastname", "email", "phonenumber")

    email = data["email"].strip().lower()
    if email != user.email:
        existing = db.query(User).filter(User.email == email).one_or_none()
        if existing is not None:
            raise HTTPException(status_code=409, detail="An account with that email already exists")

    user.firstname = data["firstname"]
    user.lastname = data["lastname"]
    user.email = email
    user.phonenumber = data["phonenumber"]
    user.area = data.get("area", "")
    user.landmark = data.get("landmark", "")
    user.zipcode = data.get("zipcode", "")
    db.commit()

    return {"success": True}


def _delete_account(data: dict, user: User, db: Session) -> dict:
    require_fields(data, "password")
    if not verify_password(data["password"], user.password_hash):
        raise HTTPException(status_code=401, detail="Incorrect password")

    delete_user_cascade(user, db)
    db.commit()

    return {"success": True, "message": "Account deleted"}


@router.post("/api/profile_picture.php")
async def upload_profile_picture(
    profile_picture: UploadFile,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    if profile_picture.content_type not in ALLOWED_IMAGE_TYPES:
        raise HTTPException(status_code=400, detail="Only PNG, JPEG, or WEBP images are allowed")

    ext = EXT_BY_TYPE[profile_picture.content_type]
    filename = f"user_{user.user_id}_{uuid.uuid4().hex[:8]}{ext}"

    os.makedirs(settings.uploads_dir, exist_ok=True)
    destination = os.path.join(settings.uploads_dir, filename)
    contents = await profile_picture.read()
    with open(destination, "wb") as f:
        f.write(contents)

    if user.profile_picture:
        old_path = os.path.join(settings.uploads_dir, os.path.basename(user.profile_picture))
        if os.path.exists(old_path):
            os.remove(old_path)

    url_path = f"/uploads/{filename}"
    user.profile_picture = url_path
    db.commit()

    return {"success": True, "profile_picture": url_path}
