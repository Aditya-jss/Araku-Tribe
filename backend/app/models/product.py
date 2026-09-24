from sqlalchemy import Integer, Numeric, String
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class Product(Base):
    __tablename__ = "products"

    product_id: Mapped[str] = mapped_column(String(50), primary_key=True)
    name: Mapped[str] = mapped_column(String(255))
    price: Mapped[float] = mapped_column(Numeric(10, 2))
    quantity: Mapped[int] = mapped_column(Integer, default=0)
    category: Mapped[str] = mapped_column(String(20), index=True)
    image: Mapped[str] = mapped_column(String(255))
    min_order_quantity: Mapped[int] = mapped_column(Integer, default=1)

    # min_order_quantity doubles as the low-stock reorder threshold (matching
    # the legacy catalog's dual use of the same field). low_stock_alerted
    # tracks whether the one-time alert for the current dip has already
    # fired, so restocking above the threshold resets it and lets the alert
    # fire again on the next dip instead of firing on every quantity change.
    low_stock_alerted: Mapped[bool] = mapped_column(default=False)
