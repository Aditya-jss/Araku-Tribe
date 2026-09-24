import logging
import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.config import settings
from app.routers import (
    admin_admins,
    admin_auth,
    admin_dashboard,
    admin_orders,
    admin_products,
    admin_users,
    ai_chat,
    auth,
    cart,
    contact,
    google_auth,
    orders,
    products,
    profile,
)

logging.basicConfig(level=logging.INFO)

app = FastAPI(title="Araku Tribe API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

os.makedirs(settings.uploads_dir, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=settings.uploads_dir), name="uploads")

app.include_router(auth.router)
app.include_router(google_auth.router)
app.include_router(products.router)
app.include_router(cart.router)
app.include_router(orders.router)
app.include_router(profile.router)
app.include_router(contact.router)
app.include_router(admin_auth.router)
app.include_router(admin_dashboard.router)
app.include_router(admin_products.router)
app.include_router(admin_users.router)
app.include_router(admin_orders.router)
app.include_router(admin_admins.router)
app.include_router(ai_chat.router)


@app.get("/health")
def health():
    return {"status": "ok"}
