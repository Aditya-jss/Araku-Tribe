from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy import asc, desc
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.product import Product
from app.utils import get_request_data, require_fields

router = APIRouter()

PAGE_SIZE = 12
VALID_CATEGORIES = {"bag", "cup", "mug", "tshirt"}

SORT_COLUMNS = {
    "lowtohigh": asc(Product.price),
    "hightolow": desc(Product.price),
    "quantity_asc": asc(Product.quantity),
    "quantity_desc": desc(Product.quantity),
}


def _product_public(product: Product) -> dict:
    return {
        "product_id": product.product_id,
        "name": product.name,
        "price": float(product.price),
        "quantity": product.quantity,
        "category": product.category,
        "image": product.image,
        "min_order_quantity": product.min_order_quantity,
    }


@router.api_route("/api/products.php", methods=["GET", "POST"])
async def products_endpoint(request: Request, db: Session = Depends(get_db)):
    data = await get_request_data(request)
    action = data.get("action", "")

    if action == "list":
        return _list(data, db)
    if action == "detail":
        return _detail(data, db)

    raise HTTPException(status_code=400, detail=f"Unknown action: {action}")


def _list(data: dict, db: Session) -> dict:
    require_fields(data, "category")
    category = data["category"]
    if category not in VALID_CATEGORIES:
        raise HTTPException(status_code=400, detail="Invalid category")

    try:
        page = max(1, int(data.get("page", 1)))
    except ValueError:
        page = 1

    query = db.query(Product).filter(Product.category == category)

    sort = data.get("sort") or ""
    if sort in SORT_COLUMNS:
        query = query.order_by(SORT_COLUMNS[sort])
    else:
        query = query.order_by(Product.name)

    total = query.count()
    total_pages = max(1, (total + PAGE_SIZE - 1) // PAGE_SIZE)
    products = query.offset((page - 1) * PAGE_SIZE).limit(PAGE_SIZE).all()

    return {
        "success": True,
        "products": [_product_public(p) for p in products],
        "total": total,
        "page": page,
        "total_pages": total_pages,
    }


def _detail(data: dict, db: Session) -> dict:
    require_fields(data, "product_id")
    product = db.get(Product, data["product_id"])
    if product is None:
        raise HTTPException(status_code=404, detail="Product not found")
    return {"success": True, "product": _product_public(product)}
