from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.database import get_db
from app.deps import require_role
from app.models.admin import Admin
from app.models.order import Order

router = APIRouter(prefix="/api/admin/orders", tags=["admin-orders"])

VALID_STATUSES = ["Processing", "Out for Delivery", "Delivered", "Cancelled"]


class OrderItemOut(BaseModel):
    product_id: str
    product_name: str
    quantity: int
    price: float


class OrderOut(BaseModel):
    order_id: int
    user_id: int
    name: str
    email: str
    total_amount: float
    order_status: str
    order_date: str
    payment_method: str
    payment_status: str
    shipping_address: str


class OrderDetailOut(OrderOut):
    items: list[OrderItemOut]


class OrderListOut(BaseModel):
    orders: list[OrderOut]
    total: int


class StatusUpdate(BaseModel):
    order_status: str


def _out(o: Order) -> OrderOut:
    return OrderOut(
        order_id=o.order_id,
        user_id=o.user_id,
        name=o.name,
        email=o.email,
        total_amount=float(o.total_amount),
        order_status=o.order_status,
        order_date=o.order_date.isoformat(),
        payment_method=o.payment_method,
        payment_status=o.payment_status,
        shipping_address=o.shipping_address,
    )


@router.get("", response_model=OrderListOut)
def list_orders(
    status: str | None = None,
    page: int = 1,
    page_size: int = 20,
    admin: Admin = Depends(require_role("manager")),
    db: Session = Depends(get_db),
):
    query = db.query(Order)
    if status:
        query = query.filter(Order.order_status == status)
    total = query.count()
    orders = query.order_by(Order.order_date.desc()).offset((page - 1) * page_size).limit(page_size).all()
    return OrderListOut(orders=[_out(o) for o in orders], total=total)


@router.get("/{order_id}", response_model=OrderDetailOut)
def get_order(order_id: int, admin: Admin = Depends(require_role("manager")), db: Session = Depends(get_db)):
    order = db.get(Order, order_id)
    if order is None:
        raise HTTPException(status_code=404, detail="Order not found")
    return OrderDetailOut(
        **_out(order).model_dump(),
        items=[
            OrderItemOut(
                product_id=i.product_id, product_name=i.product_name, quantity=i.quantity, price=float(i.price)
            )
            for i in order.items
        ],
    )


@router.patch("/{order_id}/status", response_model=OrderOut)
def update_status(
    order_id: int,
    body: StatusUpdate,
    admin: Admin = Depends(require_role("manager")),
    db: Session = Depends(get_db),
):
    if body.order_status not in VALID_STATUSES:
        raise HTTPException(status_code=400, detail=f"Status must be one of: {', '.join(VALID_STATUSES)}")

    order = db.get(Order, order_id)
    if order is None:
        raise HTTPException(status_code=404, detail="Order not found")

    order.order_status = body.order_status
    db.commit()
    return _out(order)
