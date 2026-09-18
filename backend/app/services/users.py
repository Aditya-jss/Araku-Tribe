import os

from sqlalchemy.orm import Session

from app.config import settings
from app.models.cart import CartItem
from app.models.order import Order, OrderItem
from app.models.user import User


def delete_user_cascade(user: User, db: Session) -> None:
    """Deletes a user along with everything that references it (no DB-level
    cascade is defined on those foreign keys), and removes their uploaded
    profile picture from disk. Caller is responsible for db.commit()."""
    order_ids = [o.order_id for o in db.query(Order).filter(Order.user_id == user.user_id).all()]
    if order_ids:
        db.query(OrderItem).filter(OrderItem.order_id.in_(order_ids)).delete(synchronize_session=False)
        db.query(Order).filter(Order.user_id == user.user_id).delete(synchronize_session=False)
    db.query(CartItem).filter(CartItem.user_id == user.user_id).delete(synchronize_session=False)

    if user.profile_picture:
        path = os.path.join(settings.uploads_dir, os.path.basename(user.profile_picture))
        if os.path.exists(path):
            os.remove(path)

    db.delete(user)
