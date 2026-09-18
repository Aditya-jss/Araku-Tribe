import logging

logger = logging.getLogger("arakutribe.email")


def send_otp_email(to_email: str, otp: str, purpose: str) -> bool:
    """
    Stub mail sender: no SMTP is configured yet, so OTPs are logged instead of
    delivered. Swap this for a real provider (SES, Postmark, ...) when one is
    wired up; callers only depend on the bool return, not the delivery mechanism.
    """
    logger.info("OTP for %s (%s): %s", to_email, purpose, otp)
    return True


def send_order_confirmation_email(to_email: str, order_id: int, total: float) -> bool:
    logger.info("Order confirmation for %s: order #%s, total %.2f", to_email, order_id, total)
    return True
