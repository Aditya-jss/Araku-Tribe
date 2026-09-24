from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session

from app.database import get_db
from app.deps import get_current_user
from app.models.cart import CartItem
from app.models.product import Product
from app.models.user import User
from app.utils import get_request_data, require_fields

router = APIRouter()


def _cart_response(user: User, db: Session) -> dict:
    rows = (
        db.query(CartItem, Product)
        .join(Product, Product.product_id == CartItem.product_id)
        .filter(CartItem.user_id == user.user_id)
        .all()
    )

    items = []
    total = 0.0
    for cart_item, product in rows:
        subtotal = float(product.price) * cart_item.quantity
        total += subtotal
        items.append(
            {
                "product_id": product.product_id,
                "product_name": product.name,
                "price": float(product.price),
                "quantity": cart_item.quantity,
                "image": product.image,
                "subtotal": subtotal,
            }
        )

    return {"success": True, "items": items, "total": total}


@router.api_route("/api/cart.php", methods=["GET", "POST"])
async def cart_endpoint(
    request: Request,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    data = await get_request_data(request)
    action = data.get("action", "")

    if action == "get":
        return _cart_response(user, db)
    if action == "add":
        return _add(data, user, db)
    if action == "update":
        return _update(data, user, db)

    raise HTTPException(status_code=400, detail=f"Unknown action: {action}")


def _add(data: dict, user: User, db: Session) -> dict:
    require_fields(data, "product_id", "quantity")
    try:
        quantity = int(data["quantity"])
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid quantity")
    if quantity <= 0:
        raise HTTPException(status_code=400, detail="Quantity must be positive")

    product = db.get(Product, data["product_id"])
    if product is None:
        raise HTTPException(status_code=404, detail="Product not found")

    existing = (
        db.query(CartItem)
        .filter(CartItem.user_id == user.user_id, CartItem.product_id == product.product_id)
        .one_or_none()
    )
    new_quantity = quantity + (existing.quantity if existing else 0)
    new_quantity = max(new_quantity, product.min_order_quantity)
    if new_quantity > product.quantity:
        raise HTTPException(status_code=400, detail="Not enough stock available")

    if existing is None:
        db.add(CartItem(user_id=user.user_id, product_id=product.product_id, quantity=new_quantity))
    else:
        existing.quantity = new_quantity
    db.commit()

    return _cart_response(user, db)


def _update(data: dict, user: User, db: Session) -> dict:
    require_fields(data, "product_id", "op")
    op = data["op"]
    if op not in {"increase", "decrease", "delete"}:
        raise HTTPException(status_code=400, detail="Invalid op")

    item = (
        db.query(CartItem)
        .filter(CartItem.user_id == user.user_id, CartItem.product_id == data["product_id"])
        .one_or_none()
    )
    if item is None:
        raise HTTPException(status_code=404, detail="Item not in cart")

    if op == "delete":
        db.delete(item)
    else:
        product = db.get(Product, item.product_id)
        if op == "increase":
            if item.quantity + 1 > product.quantity:
                raise HTTPException(status_code=400, detail="Not enough stock available")
            item.quantity += 1
        else:
            if item.quantity - 1 < product.min_order_quantity:
                db.delete(item)
            else:
                item.quantity -= 1
    db.commit()

    return _cart_response(user, db)
