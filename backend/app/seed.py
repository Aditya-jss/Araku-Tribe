"""Populate the database with demo catalog data. Run with:
    python -m app.seed
"""

from urllib.parse import quote

from app.database import Base, SessionLocal, engine
from app.models.product import Product

# Real product photography (from the legacy arakutribe.com catalog) ships as
# static frontend assets under web/public/img/shop/. T-shirts have no real
# photos in the legacy catalog, so that category still falls back to a
# placeholder image service until real photos exist.
def _placeholder(label: str) -> str:
    return f"https://placehold.co/600x600/f0c14b/3f271e?text={quote(label)}"


PRODUCTS = [
    {
        "product_id": "BAG001",
        "name": "Araku Valley Arabica - 250g",
        "price": 14.00,
        "quantity": 120,
        "category": "bag",
        "image": "/img/shop/bag/arabica-250g.jpg",
        "min_order_quantity": 1,
    },
    {
        "product_id": "BAG002",
        "name": "Araku Valley Robusta - 250g",
        "price": 12.00,
        "quantity": 150,
        "category": "bag",
        "image": "/img/shop/bag/robusta-250g.jpg",
        "min_order_quantity": 1,
    },
    {
        "product_id": "BAG003",
        "name": "Single Origin Dark Roast - 500g",
        "price": 24.00,
        "quantity": 80,
        "category": "bag",
        "image": "/img/shop/bag/dark-roast-500g.jpg",
        "min_order_quantity": 1,
    },
    {
        "product_id": "CUP001",
        "name": "Handcrafted Ceramic Filter Cup",
        "price": 18.00,
        "quantity": 60,
        "category": "cup",
        "image": "/img/shop/cup/filter-cup.jpg",
        "min_order_quantity": 1,
    },
    {
        "product_id": "CUP002",
        "name": "Tribal Motif Espresso Cup Set (2)",
        "price": 28.00,
        "quantity": 45,
        "category": "cup",
        "image": "/img/shop/cup/espresso-set.jpg",
        "min_order_quantity": 1,
    },
    {
        "product_id": "MUG001",
        "name": "Araku Tribe Logo Mug",
        "price": 16.00,
        "quantity": 200,
        "category": "mug",
        "image": "/img/shop/mug/logo-mug.jpg",
        "min_order_quantity": 1,
    },
    {
        "product_id": "MUG002",
        "name": "Hand-painted Tribal Mug",
        "price": 22.00,
        "quantity": 70,
        "category": "mug",
        "image": "/img/shop/mug/tribal-mug.jpg",
        "min_order_quantity": 1,
    },
    {
        "product_id": "TSHIRT001",
        "name": "Araku Tribe Logo T-Shirt - Black",
        "price": 25.00,
        "quantity": 100,
        "category": "tshirt",
        "image": _placeholder("T-Shirt Black"),
        "min_order_quantity": 1,
    },
    {
        "product_id": "TSHIRT002",
        "name": "Araku Tribe Logo T-Shirt - White",
        "price": 25.00,
        "quantity": 100,
        "category": "tshirt",
        "image": _placeholder("T-Shirt White"),
        "min_order_quantity": 1,
    },
]


def seed() -> None:
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        for data in PRODUCTS:
            product = db.get(Product, data["product_id"])
            if product is None:
                db.add(Product(**data))
            else:
                for key, value in data.items():
                    setattr(product, key, value)
        db.commit()
        print(f"Seeded {len(PRODUCTS)} products.")
    finally:
        db.close()


if __name__ == "__main__":
    seed()
