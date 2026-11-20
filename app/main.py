"""ORBIT FastAPI application entrypoint."""

from __future__ import annotations

from pathlib import Path

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates

from app.config import get_settings
from app.routes import contact, projects

BASE_DIR = Path(__file__).resolve().parent.parent
templates = Jinja2Templates(directory=str(BASE_DIR / "templates"))
settings = get_settings()

app = FastAPI(
    title=settings.app_name,
    docs_url="/api/docs" if settings.debug else None,
    redoc_url=None,
)

if settings.allowed_origins:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.allowed_origins,
        allow_credentials=False,
        allow_methods=["GET", "POST", "OPTIONS"],
        allow_headers=["*"],
    )

app.mount("/static", StaticFiles(directory=str(BASE_DIR / "static")), name="static")
app.include_router(projects.router)
app.include_router(contact.router)


@app.middleware("http")
async def security_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    response.headers["X-Frame-Options"] = "SAMEORIGIN"
    response.headers["Permissions-Policy"] = "camera=(), microphone=(), geolocation=()"
    return response


@app.get("/api/health")
async def health() -> dict:
    return {
        "ok": True,
        "service": "orbit",
        "env": settings.app_env,
        "emailDelivery": settings.email_delivery_configured,
    }


@app.get("/", response_class=HTMLResponse)
async def index(request: Request) -> HTMLResponse:
    data = projects.load_portfolio()
    return templates.TemplateResponse(
        request,
        "index.html",
        {
            "site": data.get("site", {}),
            "projects": data.get("projects", []),
            "capabilities": data.get("capabilities", []),
            "experiments": data.get("experiments", []),
            "site_url": settings.site_url,
            "contact_email": settings.contact_email,
        },
    )


@app.exception_handler(404)
async def not_found(request: Request, exc) -> HTMLResponse | JSONResponse:
    if request.url.path.startswith("/api/"):
        return JSONResponse(status_code=404, content={"ok": False, "detail": "Not found"})
    data = projects.load_portfolio()
    return templates.TemplateResponse(
        request,
        "index.html",
        {
            "site": data.get("site", {}),
            "projects": data.get("projects", []),
            "capabilities": data.get("capabilities", []),
            "experiments": data.get("experiments", []),
            "site_url": settings.site_url,
            "contact_email": settings.contact_email,
            "error_notice": "The requested path was not found. Returning to ORBIT.",
        },
        status_code=404,
    )
