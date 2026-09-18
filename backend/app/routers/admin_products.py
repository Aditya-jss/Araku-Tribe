from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.database import get_db
from app.deps import require_role
from app.models.admin import Admin
from app.models.product import Product
from app.services.products import sync_low_stock

router = APIRouter(prefix="/api/admin/products", tags=["admin-products"])

CATEGORY_PREFIX = {"bag": "BAG", "cup": "CUP", "mug": "MUG", "tshirt": "TSHIRT"}


class ProductOut(BaseModel):
    product_id: str
    name: str
    price: float
    quantity: int
    category: str
    image: str
    min_order_quantity: int
    low_stock_alerted: bool


class ProductListOut(BaseModel):
    products: list[ProductOut]
    total: int


class ProductCreate(BaseModel):
    name: str = Field(min_length=1)
    price: float = Field(gt=0)
    quantity: int = Field(ge=0)
    category: str
    image: str = Field(min_length=1)
    min_order_quantity: int = Field(default=1, ge=1)


class ProductUpdate(BaseModel):
    """All fields optional; which ones actually apply depends on the caller's
    role — staff may only move `quantity` (enforced in update_product)."""

    name: str | None = Field(default=None, min_length=1)
    price: float | None = Field(default=None, gt=0)
    quantity: int | None = Field(default=None, ge=0)
    category: str | None = None
    image: str | None = Field(default=None, min_length=1)
    min_order_quantity: int | None = Field(default=None, ge=1)


def _out(p: Product) -> ProductOut:
    return ProductOut(
        product_id=p.product_id,
        name=p.name,
        price=float(p.price),
        quantity=p.quantity,
        category=p.category,
        image=p.image,
        min_order_quantity=p.min_order_quantity,
        low_stock_alerted=p.low_stock_alerted,
    )


def _next_product_id(category: str, db: Session) -> str:
    prefix = CATEGORY_PREFIX.get(category)
    if prefix is None:
        raise HTTPException(status_code=400, detail="Invalid category")

    count = db.query(func.count(Product.product_id)).filter(Product.category == category).scalar() or 0
    for n in range(count + 1, count + 1000):
        candidate = f"{prefix}{n:03d}"
        if db.get(Product, candidate) is None:
            return candidate
    raise HTTPException(status_code=500, detail="Could not allocate a product id")


@router.get("", response_model=ProductListOut)
def list_products(
    category: str | None = None,
    page: int = 1,
    page_size: int = 20,
    admin: Admin = Depends(require_role("staff")),
    db: Session = Depends(get_db),
):
    query = db.query(Product)
    if category:
        query = query.filter(Product.category == category)
    total = query.count()
    products = query.order_by(Product.product_id).offset((page - 1) * page_size).limit(page_size).all()
    return ProductListOut(products=[_out(p) for p in products], total=total)


@router.post("", response_model=ProductOut, status_code=201)
def create_product(
    body: ProductCreate,
    admin: Admin = Depends(require_role("manager")),
    db: Session = Depends(get_db),
):
    if body.category not in CATEGORY_PREFIX:
        raise HTTPException(status_code=400, detail="Invalid category")

    product = Product(
        product_id=_next_product_id(body.category, db),
        name=body.name,
        price=body.price,
        quantity=body.quantity,
        category=body.category,
        image=body.image,
        min_order_quantity=body.min_order_quantity,
    )
    sync_low_stock(product)
    db.add(product)
    db.commit()
    return _out(product)


@router.patch("/{product_id}", response_model=ProductOut)
def update_product(
    product_id: str,
    body: ProductUpdate,
    admin: Admin = Depends(require_role("staff")),
    db: Session = Depends(get_db),
):
    product = db.get(Product, product_id)
    if product is None:
        raise HTTPException(status_code=404, detail="Product not found")

    is_staff_only = not admin.has_role_at_least("manager")
    data = body.model_dump(exclude_unset=True)

    if is_staff_only:
        # Staff may only move stock quantity — silently ignore any other
        # field rather than erroring, so a staff-only client can still PATCH
        # the same payload shape without special-casing itself.
        data = {k: v for k, v in data.items() if k == "quantity"}

    for key, value in data.items():
        setattr(product, key, value)

    sync_low_stock(product)
    db.commit()
    return _out(product)


@router.delete("/{product_id}", status_code=204)
def delete_product(
    product_id: str,
    admin: Admin = Depends(require_role("superadmin")),
    db: Session = Depends(get_db),
):
    product = db.get(Product, product_id)
    if product is None:
        raise HTTPException(status_code=404, detail="Product not found")
    db.delete(product)
    db.commit()
