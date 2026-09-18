"""Populate the database with demo catalog data. Run with:
    python -m app.seed
"""

from urllib.parse import quote

from app.database import Base, SessionLocal, engine
from app.models.product import Product

# No real product photography exists yet, so seed data points at a
# placeholder image service (rendered client-side) instead of a local
# path that would 404. Swap for real uploaded images later.
def _placeholder(label: str) -> str:
    return f"https://placehold.co/600x600/f0c14b/3f271e?text={quote(label)}"


PRODUCTS = [
    {
        "product_id": "BAG001",
        "name": "Araku Valley Arabica - 250g",
        "price": 349.00,
        "quantity": 120,
        "category": "bag",
        "image": _placeholder("Arabica 250g"),
        "min_order_quantity": 1,
    },
    {
        "product_id": "BAG002",
        "name": "Araku Valley Robusta - 250g",
        "price": 299.00,
        "quantity": 150,
        "category": "bag",
        "image": _placeholder("Robusta 250g"),
        "min_order_quantity": 1,
    },
    {
        "product_id": "BAG003",
        "name": "Single Origin Dark Roast - 500g",
        "price": 599.00,
        "quantity": 80,
        "category": "bag",
        "image": _placeholder("Dark Roast 500g"),
        "min_order_quantity": 1,
    },
    {
        "product_id": "CUP001",
        "name": "Handcrafted Ceramic Filter Cup",
        "price": 249.00,
        "quantity": 60,
        "category": "cup",
        "image": _placeholder("Filter Cup"),
        "min_order_quantity": 1,
    },
    {
        "product_id": "CUP002",
        "name": "Tribal Motif Espresso Cup Set (2)",
        "price": 399.00,
        "quantity": 45,
        "category": "cup",
        "image": _placeholder("Espresso Set"),
        "min_order_quantity": 1,
    },
    {
        "product_id": "MUG001",
        "name": "Araku Tribe Logo Mug",
        "price": 199.00,
        "quantity": 200,
        "category": "mug",
        "image": _placeholder("Logo Mug"),
        "min_order_quantity": 1,
    },
    {
        "product_id": "MUG002",
        "name": "Hand-painted Tribal Mug",
        "price": 349.00,
        "quantity": 70,
        "category": "mug",
        "image": _placeholder("Tribal Mug"),
        "min_order_quantity": 1,
    },
    {
        "product_id": "TSHIRT001",
        "name": "Araku Tribe Logo T-Shirt - Black",
        "price": 499.00,
        "quantity": 100,
        "category": "tshirt",
        "image": _placeholder("T-Shirt Black"),
        "min_order_quantity": 1,
    },
    {
        "product_id": "TSHIRT002",
        "name": "Araku Tribe Logo T-Shirt - White",
        "price": 499.00,
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
