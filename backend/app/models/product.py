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
