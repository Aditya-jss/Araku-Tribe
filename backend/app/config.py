from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    database_url: str = "postgresql+psycopg://arakutribe:arakutribe@localhost:5432/arakutribe"
    jwt_secret: str = "change-me-to-a-long-random-string"
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 60 * 24
    pending_token_expire_minutes: int = 10
    cors_origins: str = "http://localhost:5173"
    uploads_dir: str = "uploads"

    # Google OAuth ("Sign in with Google"). Empty by default — the login
    # endpoint returns a clear error rather than a broken redirect until a
    # real Client ID/Secret from Google Cloud Console are set.
    google_client_id: str = ""
    google_client_secret: str = ""
    google_redirect_uri: str = "http://localhost:8000/api/auth/google/callback"
    frontend_base_url: str = "http://localhost:5173"

    # AI chatbot (Claude API). Empty by default — the chat endpoint returns a
    # clear "not configured" error until a real key is set.
    anthropic_api_key: str = ""

    # Transactional email (Resend). Empty by default — falls back to logging
    # OTPs/emails to stdout instead of sending them. email_from defaults to
    # Resend's shared sandbox sender, which works without verifying a domain.
    resend_api_key: str = ""
    email_from: str = "Araku Tribe <onboarding@resend.dev>"
    # Where contact-form submissions get emailed to. Empty by default — Resend's
    # shared sandbox sender can only deliver to the account owner's own
    # verified address anyway, until a custom domain is verified, so this is
    # log-only until you set it to a real inbox you control.
    contact_notification_email: str = ""

    @property
    def cors_origin_list(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]


settings = Settings()
