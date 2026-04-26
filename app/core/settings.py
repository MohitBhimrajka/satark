# app/core/settings.py
"""
Satark — Centralized Application Settings.
All configuration is loaded from environment variables (.env file in dev).
"""
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    # ── Application ──────────────────────────────────────────────────────────
    APP_ENV: str = "development"
    LOG_LEVEL: str = "INFO"

    # ── Database ─────────────────────────────────────────────────────────────
    DATABASE_URL: str

    # ── AI ────────────────────────────────────────────────────────────────────
    GEMINI_API_KEY: str = ""
    AI_MODEL: str = "gemini-3-flash-preview"

    # ── Storage ──────────────────────────────────────────────────────────────
    STORAGE_BACKEND: str = "local"  # "local" or "gcs"
    GCS_BUCKET_NAME: str = "satark-evidence"
    LOCAL_UPLOAD_DIR: str = "/app/uploads"

    # ── Auth ─────────────────────────────────────────────────────────────────
    JWT_SECRET_KEY: str = "change-me-generate-with-openssl-rand-hex-32"
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRATION_MINUTES: int = 1440  # 24 hours

    # ── CORS ─────────────────────────────────────────────────────────────────
    FRONTEND_URL: str = "http://localhost:3000"

    model_config = {"env_file": ".env", "extra": "ignore"}


# Singleton instance — import this everywhere
settings = Settings()
