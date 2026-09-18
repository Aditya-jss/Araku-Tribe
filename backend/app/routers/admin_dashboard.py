from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.database import get_db
from app.deps import require_role
from app.models.admin import Admin
from app.models.order import Order
from app.models.product import Product
from app.models.user import User

router = APIRouter(prefix="/api/admin", tags=["admin-dashboard"])


class DashboardOut(BaseModel):
    total_orders: int
    total_users: int
    total_revenue: float
    low_stock_count: int
    orders_by_status: dict[str, int]


class LowStockProductOut(BaseModel):
    product_id: str
    name: str
    category: str
    quantity: int
    min_order_quantity: int


class LowStockOut(BaseModel):
    products: list[LowStockProductOut]


@router.get("/dashboard", response_model=DashboardOut)
def dashboard(admin: Admin = Depends(require_role("staff")), db: Session = Depends(get_db)):
    total_orders = db.query(func.count(Order.order_id)).scalar() or 0
    total_users = db.query(func.count(User.user_id)).scalar() or 0
    total_revenue = (
        db.query(func.coalesce(func.sum(Order.total_amount), 0)).filter(Order.payment_status == "Paid").scalar()
        or 0
    )
    low_stock_count = db.query(func.count(Product.product_id)).filter(Product.low_stock_alerted.is_(True)).scalar() or 0

    status_rows = db.query(Order.order_status, func.count(Order.order_id)).group_by(Order.order_status).all()

    return DashboardOut(
        total_orders=total_orders,
        total_users=total_users,
        total_revenue=float(total_revenue),
        low_stock_count=low_stock_count,
        orders_by_status={status: count for status, count in status_rows},
    )


@router.get("/inventory-alerts", response_model=LowStockOut)
def inventory_alerts(admin: Admin = Depends(require_role("staff")), db: Session = Depends(get_db)):
    products = (
        db.query(Product)
        .filter(Product.low_stock_alerted.is_(True))
        .order_by(Product.quantity)
        .all()
    )
    return LowStockOut(
        products=[
            LowStockProductOut(
                product_id=p.product_id,
                name=p.name,
                category=p.category,
                quantity=p.quantity,
                min_order_quantity=p.min_order_quantity,
            )
            for p in products
        ]
    )
