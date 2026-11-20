"""Contact form endpoint."""

from __future__ import annotations

from fastapi import APIRouter, Request
from fastapi.responses import JSONResponse

from app.config import get_settings
from app.schemas.contact import ContactRequest, ContactResponse
from app.services.contact_service import ContactService

router = APIRouter(prefix="/api", tags=["contact"])


def _client_ip(request: Request) -> str:
    forwarded = request.headers.get("x-forwarded-for")
    if forwarded:
        return forwarded.split(",")[0].strip()
    if request.client:
        return request.client.host
    return "unknown"


@router.post("/contact", response_model=ContactResponse)
async def submit_contact(payload: ContactRequest, request: Request) -> JSONResponse:
    service = ContactService(get_settings())
    result = await service.submit(payload, _client_ip(request))
    status = 200 if result.ok else (429 if "Too many" in result.message else 502)
    return JSONResponse(status_code=status, content=result.model_dump())
