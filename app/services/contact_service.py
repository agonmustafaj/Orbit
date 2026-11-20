"""Contact form processing — validate, rate-limit, optionally deliver."""

from __future__ import annotations

import logging
import time
from collections import defaultdict, deque
from typing import Deque

import httpx

from app.config import Settings
from app.schemas.contact import ContactRequest, ContactResponse

logger = logging.getLogger("orbit.contact")


class RateLimiter:
    """Simple in-memory sliding-window limiter keyed by client IP."""

    def __init__(self, limit: int, window_seconds: int) -> None:
        self.limit = limit
        self.window = window_seconds
        self._hits: dict[str, Deque[float]] = defaultdict(deque)

    def allow(self, key: str) -> bool:
        now = time.monotonic()
        bucket = self._hits[key]
        while bucket and now - bucket[0] > self.window:
            bucket.popleft()
        if len(bucket) >= self.limit:
            return False
        bucket.append(now)
        return True


class ContactService:
    def __init__(self, settings: Settings) -> None:
        self.settings = settings
        self.limiter = RateLimiter(
            settings.contact_rate_limit,
            settings.contact_rate_window_seconds,
        )

    async def submit(self, payload: ContactRequest, client_ip: str) -> ContactResponse:
        if payload.website.strip():
            # Silent honeypot success — do not tip bots
            return ContactResponse(
                ok=True,
                delivered=False,
                message="Message received.",
            )

        if not self.limiter.allow(client_ip or "unknown"):
            return ContactResponse(
                ok=False,
                delivered=False,
                message="Too many requests. Please wait a moment and try again.",
            )

        if not self.settings.email_delivery_configured:
            logger.info(
                "Contact received (delivery not configured): %s <%s> — %s",
                payload.name,
                payload.email,
                payload.subject,
            )
            return ContactResponse(
                ok=True,
                delivered=False,
                message=(
                    "Message received and validated. "
                    "Email delivery is not configured on this server yet — "
                    "your note was logged for review."
                ),
            )

        delivered = await self._send_resend(payload)
        if delivered:
            return ContactResponse(
                ok=True,
                delivered=True,
                message="Message sent successfully. We'll be in touch soon.",
            )
        return ContactResponse(
            ok=False,
            delivered=False,
            message="Unable to deliver your message right now. Please email us directly.",
        )

    async def _send_resend(self, payload: ContactRequest) -> bool:
        headers = {
            "Authorization": f"Bearer {self.settings.resend_api_key}",
            "Content-Type": "application/json",
        }
        body = {
            "from": self.settings.contact_from,
            "to": [self.settings.contact_to],
            "reply_to": payload.email,
            "subject": f"[ORBIT] {payload.subject}",
            "text": (
                f"Name: {payload.name}\n"
                f"Email: {payload.email}\n"
                f"Subject: {payload.subject}\n\n"
                f"{payload.message}\n"
            ),
        }
        try:
            async with httpx.AsyncClient(timeout=12.0) as client:
                response = await client.post(
                    "https://api.resend.com/emails",
                    headers=headers,
                    json=body,
                )
            if response.status_code >= 400:
                logger.error("Resend error %s: %s", response.status_code, response.text)
                return False
            return True
        except httpx.HTTPError as exc:
            logger.exception("Resend request failed: %s", exc)
            return False
