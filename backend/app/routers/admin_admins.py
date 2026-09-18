from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, EmailStr
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.database import get_db
from app.deps import require_role
from app.models.admin import ROLES, Admin
from app.security import hash_password

router = APIRouter(prefix="/api/admin/admins", tags=["admin-admins"])


class AdminOut(BaseModel):
    admin_id: int
    email: str
    firstname: str
    lastname: str
    role: str


class AdminListOut(BaseModel):
    admins: list[AdminOut]


class AdminCreate(BaseModel):
    firstname: str
    lastname: str
    email: EmailStr
    password: str
    role: str


class AdminRoleUpdate(BaseModel):
    firstname: str
    lastname: str
    role: str


def _out(a: Admin) -> AdminOut:
    return AdminOut(admin_id=a.admin_id, email=a.email, firstname=a.firstname, lastname=a.lastname, role=a.role)


def _remaining_superadmins(db: Session, excluding_id: int | None = None) -> int:
    query = db.query(func.count(Admin.admin_id)).filter(Admin.role == "superadmin")
    if excluding_id is not None:
        query = query.filter(Admin.admin_id != excluding_id)
    return query.scalar() or 0


@router.get("", response_model=AdminListOut)
def list_admins(admin: Admin = Depends(require_role("superadmin")), db: Session = Depends(get_db)):
    admins = db.query(Admin).order_by(Admin.admin_id).all()
    return AdminListOut(admins=[_out(a) for a in admins])


@router.post("", response_model=AdminOut, status_code=201)
def create_admin(
    body: AdminCreate,
    admin: Admin = Depends(require_role("superadmin")),
    db: Session = Depends(get_db),
):
    if body.role not in ROLES:
        raise HTTPException(status_code=400, detail=f"Role must be one of: {', '.join(ROLES)}")
    if len(body.password) < 8:
        raise HTTPException(status_code=400, detail="Password must be at least 8 characters")

    email = body.email.strip().lower()
    existing = db.query(Admin).filter(Admin.email == email).one_or_none()
    if existing is not None:
        raise HTTPException(status_code=409, detail="An admin with that email already exists")

    new_admin = Admin(
        firstname=body.firstname,
        lastname=body.lastname,
        email=email,
        password_hash=hash_password(body.password),
        role=body.role,
    )
    db.add(new_admin)
    db.commit()
    return _out(new_admin)


@router.patch("/{admin_id}", response_model=AdminOut)
def update_admin(
    admin_id: int,
    body: AdminRoleUpdate,
    admin: Admin = Depends(require_role("superadmin")),
    db: Session = Depends(get_db),
):
    if body.role not in ROLES:
        raise HTTPException(status_code=400, detail=f"Role must be one of: {', '.join(ROLES)}")

    target = db.get(Admin, admin_id)
    if target is None:
        raise HTTPException(status_code=404, detail="Admin not found")

    if target.role == "superadmin" and body.role != "superadmin" and _remaining_superadmins(db, excluding_id=target.admin_id) == 0:
        raise HTTPException(status_code=400, detail="Cannot demote the last remaining superadmin")

    target.firstname = body.firstname
    target.lastname = body.lastname
    target.role = body.role
    db.commit()
    return _out(target)


@router.delete("/{admin_id}", status_code=204)
def delete_admin(admin_id: int, admin: Admin = Depends(require_role("superadmin")), db: Session = Depends(get_db)):
    if admin_id == admin.admin_id:
        raise HTTPException(status_code=400, detail="You cannot delete your own admin account")

    target = db.get(Admin, admin_id)
    if target is None:
        raise HTTPException(status_code=404, detail="Admin not found")

    if target.role == "superadmin" and _remaining_superadmins(db, excluding_id=target.admin_id) == 0:
        raise HTTPException(status_code=400, detail="Cannot delete the last remaining superadmin")

    db.delete(target)
    db.commit()
