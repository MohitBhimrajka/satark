# app/main.py
"""
Satark API — AI-Powered Cyber Incident Intelligence Portal
SIH 2025 | PS ID: 25210
"""
import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException

from .core.logging_config import setup_logging

log = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Lifespan (replaces deprecated on_event)
# ---------------------------------------------------------------------------
@asynccontextmanager
async def lifespan(app: FastAPI):
    setup_logging()
    log.info("Satark API startup complete.")
    yield
    log.info("Satark API shutting down.")


# ---------------------------------------------------------------------------
# App Initialization
# ---------------------------------------------------------------------------
app = FastAPI(
    title="Satark API",
    description="AI-Powered Cyber Incident Intelligence Portal",
    version="0.1.0",
    lifespan=lifespan,
)

# CORS — restrict in production via FRONTEND_URL env var
import os

frontend_url = os.getenv("FRONTEND_URL", "http://localhost:3000")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[frontend_url, "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------------------------------------------------------
# Exception Handlers — Standard Satark Error Envelope
# ---------------------------------------------------------------------------
@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(request: Request, exc: StarletteHTTPException):
    """Return errors in the standard Satark error envelope."""
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": {
                "code": _status_to_code(exc.status_code),
                "message": str(exc.detail),
                "details": [],
            }
        },
    )


def _status_to_code(status: int) -> str:
    """Map HTTP status codes to human-readable error codes."""
    mapping = {
        400: "BAD_REQUEST",
        401: "UNAUTHORIZED",
        403: "FORBIDDEN",
        404: "NOT_FOUND",
        409: "CONFLICT",
        422: "VALIDATION_ERROR",
        429: "RATE_LIMITED",
        500: "INTERNAL_ERROR",
    }
    return mapping.get(status, "ERROR")


# ---------------------------------------------------------------------------
# Root-Level Endpoints (outside /api prefix — for health checks)
# ---------------------------------------------------------------------------
@app.get("/health", tags=["Health"])
def health():
    """Root-level health check for Cloud Run and load balancers."""
    return {"status": "healthy", "service": "satark-api"}


@app.get("/", tags=["Root"])
def root():
    """Root endpoint with service info."""
    return {
        "service": "Satark API",
        "version": "0.1.0",
        "status": "running",
        "docs": "/docs",
        "health": "/health",
    }


@app.get("/favicon.ico", include_in_schema=False)
def favicon():
    """Prevent 404 for favicon requests."""
    from fastapi import Response

    return Response(content="", media_type="image/x-icon")


# ---------------------------------------------------------------------------
# API Routers
# ---------------------------------------------------------------------------
from .routers import admin, auth, dashboard, incidents

app.include_router(auth.router, prefix="/api")
app.include_router(incidents.router, prefix="/api")
app.include_router(dashboard.router, prefix="/api")
app.include_router(admin.router, prefix="/api")

# ── Local file serving for dev (uploads) ─────────────────────────────────
from .core.settings import settings

if settings.STORAGE_BACKEND == "local":
    import os

    from fastapi.staticfiles import StaticFiles

    os.makedirs(settings.LOCAL_UPLOAD_DIR, exist_ok=True)
    app.mount(
        "/uploads",
        StaticFiles(directory=settings.LOCAL_UPLOAD_DIR),
        name="uploads",
    )
