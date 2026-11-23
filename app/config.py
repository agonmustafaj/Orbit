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
        self.creator_url: str = os.getenv(
            "CREATOR_URL", "https://agonmustafaj.com/"
        ).rstrip("/") + "/"
        self.allowed_origins: list[str] = _list(os.getenv("ALLOWED_ORIGINS"))


@lru_cache
def get_settings() -> Settings:
    return Settings()
