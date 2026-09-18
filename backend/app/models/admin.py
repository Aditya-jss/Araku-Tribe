from datetime import datetime

from sqlalchemy import DateTime, String
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base

# Ordered least -> most privileged. Compared by list index, so append new
# roles at the end rather than reordering existing ones.
ROLES = ["staff", "manager", "admin", "superadmin"]


class Admin(Base):
    __tablename__ = "admins"

    admin_id: Mapped[int] = mapped_column(primary_key=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    password_hash: Mapped[str] = mapped_column(String(255))
    firstname: Mapped[str] = mapped_column(String(100))
    lastname: Mapped[str] = mapped_column(String(100))
    role: Mapped[str] = mapped_column(String(20))

    otp_code: Mapped[str | None] = mapped_column(String(6), nullable=True)
    otp_expires_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    otp_attempts: Mapped[int] = mapped_column(default=0)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)

    def has_role_at_least(self, minimum: str) -> bool:
        return ROLES.index(self.role) >= ROLES.index(minimum)
