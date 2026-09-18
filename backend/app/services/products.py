from app.models.product import Product


def sync_low_stock(product: Product) -> None:
    """Mirrors the legacy catalog's alert-flag behavior: fires once per dip
    below the reorder threshold (min_order_quantity doubles as that
    threshold), and resets once restocked above it so the next dip fires
    again. Call this anywhere product.quantity changes."""
    product.low_stock_alerted = product.quantity <= product.min_order_quantity
