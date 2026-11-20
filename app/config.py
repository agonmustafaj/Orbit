"""Application configuration from environment variables."""

from __future__ import annotations

import os
from functools import lru_cache

from dotenv import load_dotenv

load_dotenv()


def _bool(value: str | None, default: bool = False) -> bool:
    if value is None:
        return default
    return value.strip().lower() in {"1", "true", "yes", "on"}


def _list(value: str | None) -> list[str]:
    if not value:
        return []
    return [item.strip() for item in value.split(",") if item.strip()]


class Settings:
    """Runtime settings for ORBIT."""

    def __init__(self) -> None:
        self.app_name: str = os.getenv("APP_NAME", "ORBIT")
        self.app_env: str = os.getenv("APP_ENV", "development")
        self.debug: bool = _bool(os.getenv("DEBUG"), default=True)
        self.site_url: str = os.getenv("SITE_URL", "http://localhost:8000").rstrip("/")
        self.contact_name: str = os.getenv("CONTACT_NAME", "Agon Mustafaj")
        self.contact_email: str = os.getenv(
            "CONTACT_EMAIL", "agonmustafaj01@gmail.com"
        )
        self.contact_to: str = os.getenv("CONTACT_TO", self.contact_email)
        self.contact_from: str = os.getenv("CONTACT_FROM", "")
        self.resend_api_key: str = os.getenv("RESEND_API_KEY", "")
        self.allowed_origins: list[str] = _list(os.getenv("ALLOWED_ORIGINS"))
        self.contact_rate_limit: int = int(os.getenv("CONTACT_RATE_LIMIT", "8"))
        self.contact_rate_window_seconds: int = int(
            os.getenv("CONTACT_RATE_WINDOW_SECONDS", "60")
        )

    @property
    def email_delivery_configured(self) -> bool:
        return bool(self.resend_api_key and self.contact_from and self.contact_to)


@lru_cache
def get_settings() -> Settings:
    return Settings()
