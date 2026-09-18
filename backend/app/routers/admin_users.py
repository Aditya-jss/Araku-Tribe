from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, EmailStr
from sqlalchemy import or_
from sqlalchemy.orm import Session

from app.database import get_db
from app.deps import require_role
from app.models.admin import Admin
from app.models.order import Order
from app.models.user import User
from app.services.users import delete_user_cascade

router = APIRouter(prefix="/api/admin/users", tags=["admin-users"])


class UserOut(BaseModel):
    user_id: int
    firstname: str
    lastname: str
    email: str
    phonenumber: str
    is_verified: bool


class UserListOut(BaseModel):
    users: list[UserOut]
    total: int


class UserOrderSummary(BaseModel):
    order_id: int
    total_amount: float
    order_status: str
    order_date: str


class UserDetailOut(UserOut):
    orders: list[UserOrderSummary]


class UserUpdate(BaseModel):
    firstname: str
    lastname: str
    email: EmailStr
    phonenumber: str


def _out(u: User) -> UserOut:
    return UserOut(
        user_id=u.user_id,
        firstname=u.firstname,
        lastname=u.lastname,
        email=u.email,
        phonenumber=u.phonenumber,
        is_verified=u.is_verified,
    )


@router.get("", response_model=UserListOut)
def list_users(
    search: str | None = None,
    page: int = 1,
    page_size: int = 20,
    admin: Admin = Depends(require_role("admin")),
    db: Session = Depends(get_db),
):
    query = db.query(User)
    if search:
        like = f"%{search}%"
        query = query.filter(
            or_(User.email.ilike(like), User.firstname.ilike(like), User.lastname.ilike(like))
        )
    total = query.count()
    users = query.order_by(User.user_id).offset((page - 1) * page_size).limit(page_size).all()
    return UserListOut(users=[_out(u) for u in users], total=total)


@router.get("/{user_id}", response_model=UserDetailOut)
def get_user(user_id: int, admin: Admin = Depends(require_role("admin")), db: Session = Depends(get_db)):
    user = db.get(User, user_id)
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")

    orders = db.query(Order).filter(Order.user_id == user_id).order_by(Order.order_date.desc()).all()
    return UserDetailOut(
        **_out(user).model_dump(),
        orders=[
            UserOrderSummary(
                order_id=o.order_id,
                total_amount=float(o.total_amount),
                order_status=o.order_status,
                order_date=o.order_date.isoformat(),
            )
            for o in orders
        ],
    )


@router.patch("/{user_id}", response_model=UserOut)
def update_user(
    user_id: int,
    body: UserUpdate,
    admin: Admin = Depends(require_role("admin")),
    db: Session = Depends(get_db),
):
    user = db.get(User, user_id)
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")

    email = body.email.strip().lower()
    if email != user.email:
        existing = db.query(User).filter(User.email == email).one_or_none()
        if existing is not None:
            raise HTTPException(status_code=409, detail="An account with that email already exists")

    user.firstname = body.firstname
    user.lastname = body.lastname
    user.email = email
    user.phonenumber = body.phonenumber
    db.commit()
    return _out(user)


@router.delete("/{user_id}", status_code=204)
def delete_user(user_id: int, admin: Admin = Depends(require_role("superadmin")), db: Session = Depends(get_db)):
    user = db.get(User, user_id)
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    delete_user_cascade(user, db)
    db.commit()
