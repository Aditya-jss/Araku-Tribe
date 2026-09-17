from datetime import datetime

from sqlalchemy import DateTime, String
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class User(Base):
    __tablename__ = "users"

    user_id: Mapped[int] = mapped_column(primary_key=True)
    firstname: Mapped[str] = mapped_column(String(100))
    lastname: Mapped[str] = mapped_column(String(100))
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    phonenumber: Mapped[str] = mapped_column(String(20))
    password_hash: Mapped[str] = mapped_column(String(255))

    area: Mapped[str] = mapped_column(String(255), default="")
    landmark: Mapped[str] = mapped_column(String(255), default="")
    zipcode: Mapped[str] = mapped_column(String(20), default="")
    profile_picture: Mapped[str | None] = mapped_column(String(255), nullable=True)

    is_verified: Mapped[bool] = mapped_column(default=False)

    otp_code: Mapped[str | None] = mapped_column(String(6), nullable=True)
    otp_expires_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)
