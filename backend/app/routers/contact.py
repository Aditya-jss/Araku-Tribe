from fastapi import APIRouter, HTTPException, Request

from app.email import send_contact_message
from app.utils import get_request_data, require_fields

router = APIRouter()


@router.api_route("/api/contact.php", methods=["GET", "POST"])
async def contact_endpoint(request: Request):
    data = await get_request_data(request)
    action = data.get("action", "")

    if action == "send":
        return _send(data)

    raise HTTPException(status_code=400, detail=f"Unknown action: {action}")


def _send(data: dict) -> dict:
    require_fields(data, "name", "email", "phone", "message")
    send_contact_message(
        name=data["name"],
        email=data["email"],
        phone=data["phone"],
        subject=data.get("subject", ""),
        message=data["message"],
    )
    return {"success": True, "message": "Thanks for reaching out — we'll get back to you soon."}
