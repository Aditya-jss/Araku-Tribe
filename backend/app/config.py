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

    @property
    def cors_origin_list(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]


settings = Settings()
