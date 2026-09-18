"""Bootstrap the first superadmin account. There is no public admin signup
(that was a critical vulnerability in the legacy site) — every other admin
account is created by an existing superadmin through the admin panel. Run
with:

    ADMIN_EMAIL=you@example.com ADMIN_PASSWORD=... python -m app.seed_admin

Safe to re-run: does nothing if a superadmin already exists.
"""

import os
import sys

from app.database import Base, SessionLocal, engine
from app.models.admin import Admin
from app.security import hash_password


def seed_admin() -> None:
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        existing = db.query(Admin).filter(Admin.role == "superadmin").first()
        if existing is not None:
            print(f"Superadmin already exists ({existing.email}); nothing to do.")
            return

        email = os.environ.get("ADMIN_EMAIL")
        password = os.environ.get("ADMIN_PASSWORD")
        if not email or not password:
            sys.exit("Set ADMIN_EMAIL and ADMIN_PASSWORD to bootstrap the first superadmin.")
        if len(password) < 8:
            sys.exit("ADMIN_PASSWORD must be at least 8 characters.")

        admin = Admin(
            firstname=os.environ.get("ADMIN_FIRSTNAME", "Admin"),
            lastname=os.environ.get("ADMIN_LASTNAME", "User"),
            email=email.strip().lower(),
            password_hash=hash_password(password),
            role="superadmin",
        )
        db.add(admin)
        db.commit()
        print(f"Created superadmin {admin.email}.")
    finally:
        db.close()


if __name__ == "__main__":
    seed_admin()
