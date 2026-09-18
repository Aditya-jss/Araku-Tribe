from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session

from app.database import get_db
from app.deps import get_current_user
from app.email import send_order_confirmation_email
from app.models.cart import CartItem
from app.models.order import Order, OrderItem
from app.models.product import Product
from app.models.user import User
from app.utils import get_request_data, require_fields

router = APIRouter()

VALID_PAYMENT_METHODS = {"upi", "card", "amazonpay", "netbanking", "cod"}
CANCELLABLE_STATUSES = {"Processing", "Pending"}


def _order_public(order: Order) -> dict:
    return {
        "order_id": order.order_id,
        "total_amount": float(order.total_amount),
        "order_status": order.order_status,
        "order_date": order.order_date.isoformat(),
        "payment_method": order.payment_method,
        "payment_status": order.payment_status,
        "shipping_address": order.shipping_address,
        "items": [
            {
                "product_id": item.product_id,
                "product_name": item.product_name,
                "quantity": item.quantity,
                "price": float(item.price),
            }
            for item in order.items
        ],
    }


@router.api_route("/api/orders.php", methods=["GET", "POST"])
async def orders_endpoint(
    request: Request,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    data = await get_request_data(request)
    action = data.get("action", "")

    if action == "place":
        return _place(data, user, db)
    if action == "list":
        return _list(user, db)
    if action == "detail":
        return _detail(data, user, db)
    if action == "cancel":
        return _cancel(data, user, db)

    raise HTTPException(status_code=400, detail=f"Unknown action: {action}")


def _place(data: dict, user: User, db: Session) -> dict:
    require_fields(data, "name", "email", "phone", "address", "city", "state", "zipcode", "payment_method")
    if data["payment_method"] not in VALID_PAYMENT_METHODS:
        raise HTTPException(status_code=400, detail="Invalid payment method")

    cart_rows = (
        db.query(CartItem, Product)
        .join(Product, Product.product_id == CartItem.product_id)
        .filter(CartItem.user_id == user.user_id)
        .all()
    )
    if not cart_rows:
        raise HTTPException(status_code=400, detail="Your cart is empty")

    for cart_item, product in cart_rows:
        if cart_item.quantity > product.quantity:
            raise HTTPException(status_code=400, detail=f"Not enough stock for {product.name}")

    total = sum(float(product.price) * cart_item.quantity for cart_item, product in cart_rows)
    payment_status = "Pending" if data["payment_method"] == "cod" else "Paid"

    order = Order(
        user_id=user.user_id,
        total_amount=total,
        order_status="Processing",
        payment_method=data["payment_method"],
        payment_status=payment_status,
        name=data["name"],
        email=data["email"],
        phone=data["phone"],
        address=data["address"],
        city=data["city"],
        state=data["state"],
        zipcode=data["zipcode"],
    )
    db.add(order)
    db.flush()

    for cart_item, product in cart_rows:
        db.add(
            OrderItem(
                order_id=order.order_id,
                product_id=product.product_id,
                product_name=product.name,
                quantity=cart_item.quantity,
                price=product.price,
            )
        )
        product.quantity -= cart_item.quantity
        db.delete(cart_item)

    db.commit()

    email_sent = send_order_confirmation_email(order.email, order.order_id, total)

    return {
        "success": True,
        "order_id": order.order_id,
        "total": total,
        "payment_status": order.payment_status,
        "email_sent": email_sent,
    }


def _list(user: User, db: Session) -> dict:
    orders = (
        db.query(Order)
        .filter(Order.user_id == user.user_id)
        .order_by(Order.order_date.desc())
        .all()
    )
    return {"success": True, "orders": [_order_public(o) for o in orders]}


def _get_owned_order(data: dict, user: User, db: Session) -> Order:
    require_fields(data, "order_id")
    try:
        order_id = int(data["order_id"])
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid order id")

    order = db.get(Order, order_id)
    if order is None or order.user_id != user.user_id:
        raise HTTPException(status_code=404, detail="Order not found")
    return order


def _detail(data: dict, user: User, db: Session) -> dict:
    order = _get_owned_order(data, user, db)
    return {"success": True, "order": _order_public(order)}


def _cancel(data: dict, user: User, db: Session) -> dict:
    order = _get_owned_order(data, user, db)
    if order.order_status not in CANCELLABLE_STATUSES:
        raise HTTPException(status_code=400, detail=f"Order cannot be cancelled once {order.order_status}")

    for item in order.items:
        product = db.get(Product, item.product_id)
        if product is not None:
            product.quantity += item.quantity

    order.order_status = "Cancelled"
    db.commit()

    return {"success": True, "order_id": order.order_id, "order_status": order.order_status}
