import logging

import httpx

from app.config import settings

logger = logging.getLogger("arakutribe.email")

RESEND_API_URL = "https://api.resend.com/emails"


def _send(to_email: str, subject: str, html: str, log_fallback: str) -> bool:
    """Sends via Resend when configured; otherwise logs the content instead
    (dev-mode stub) so callers never have to know which happened."""
    if not settings.resend_api_key:
        logger.info("[email not configured] %s", log_fallback)
        return True

    try:
        res = httpx.post(
            RESEND_API_URL,
            headers={"Authorization": f"Bearer {settings.resend_api_key}"},
            json={"from": settings.email_from, "to": [to_email], "subject": subject, "html": html},
            timeout=10,
        )
        res.raise_for_status()
        return True
    except httpx.HTTPError as exc:
        logger.error("Resend send failed for %s: %s", to_email, exc)
        return False


def send_otp_email(to_email: str, otp: str, purpose: str) -> bool:
    subject = "Your Araku Tribe verification code"
    html = f"""
    <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
      <h2 style="color: #3f271e;">Araku Tribe</h2>
      <p>Your one-time verification code is:</p>
      <p style="font-size: 32px; font-weight: bold; letter-spacing: 4px; color: #3f271e;">{otp}</p>
      <p style="color: #7e7e7e; font-size: 14px;">This code expires in 10 minutes. If you didn't request this, you can ignore this email.</p>
    </div>
    """
    return _send(to_email, subject, html, f"OTP for {to_email} ({purpose}): {otp}")


def send_order_confirmation_email(to_email: str, order_id: int, total: float) -> bool:
    subject = f"Araku Tribe order #{order_id} confirmed"
    html = f"""
    <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
      <h2 style="color: #3f271e;">Araku Tribe</h2>
      <p>Thanks for your order! We've received order <strong>#{order_id}</strong> for a total of <strong>${total:.2f}</strong>.</p>
      <p style="color: #7e7e7e; font-size: 14px;">You can check its status anytime from your account's Orders page.</p>
    </div>
    """
    return _send(to_email, subject, html, f"Order confirmation for {to_email}: order #{order_id}, total {total:.2f}")


def send_contact_message(name: str, email: str, phone: str, subject: str, message: str) -> bool:
    # This one notifies the store, not the customer — always log it too so
    # it's visible even without a notification inbox configured.
    logger.info("Contact form from %s <%s> (%s), subject=%r: %s", name, email, phone, subject, message)
    if not settings.resend_api_key or not settings.contact_notification_email:
        return True

    html = f"""
    <div style="font-family: sans-serif;">
      <p><strong>From:</strong> {name} &lt;{email}&gt;</p>
      <p><strong>Phone:</strong> {phone}</p>
      <p><strong>Subject:</strong> {subject or '(none)'}</p>
      <p>{message}</p>
    </div>
    """
    return _send(
        settings.contact_notification_email,
        f"New contact form message: {subject or 'General'}",
        html,
        "contact form (logged above)",
    )
