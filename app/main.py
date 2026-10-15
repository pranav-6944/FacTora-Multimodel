from contextlib import asynccontextmanager
from pathlib import Path
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

from app.core.config import settings
from app.db.session import engine, Base
from app.api.v1.router import api_router

FRONTEND_DIST = settings.BASE_DIR / "frontend" / "dist"


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application lifespan manager.
    Initializes database tables on startup and disposes connections on shutdown.
    """
    print(f"[STARTUP] Initializing {settings.APP_NAME} v{settings.APP_VERSION}...")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    print(f"[STARTUP] Database tables verified at {settings.DATABASE_URL}")
    yield
    print(f"[SHUTDOWN] Shutting down {settings.APP_NAME}...")
    await engine.dispose()


app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="Full-Spectrum Multimodal Credibility Intelligence Platform (Text, Image, Video, Audio)",
    lifespan=lifespan,
    docs_url="/docs" if settings.DEBUG else None,
    redoc_url="/redoc" if settings.DEBUG else None
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount API Router
app.include_router(api_router)

# Extension legacy compatibility endpoint
from app.api.v1.endpoints.extension import extension_credibility_score, ExtensionScoreRequest
@app.post("/api/credibility-score", tags=["Browser Extension Compatibility"])
async def root_credibility_score(payload: ExtensionScoreRequest):
    return await extension_credibility_score(payload)


# Mount Static Assets & Dist
if (FRONTEND_DIST / "assets").exists():
    app.mount("/assets", StaticFiles(directory=str(FRONTEND_DIST / "assets")), name="assets")

if settings.STATIC_DIR.exists():
    app.mount("/static", StaticFiles(directory=str(settings.STATIC_DIR)), name="static")


@app.get("/health", tags=["System"])
async def health_check():
    """Health check endpoint for deployment monitoring."""
    return {
        "status": "healthy",
        "app": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "env": settings.APP_ENV,
        "database": "connected"
    }


# Catch-all route to serve modern React SPA frontend and root static assets (logos, favicons)
@app.get("/{full_path:path}", tags=["Frontend"])
async def serve_react_spa(full_path: str):
    if full_path:
        requested_file = FRONTEND_DIST / full_path
        if requested_file.is_file():
            return FileResponse(requested_file)
    index_file = FRONTEND_DIST / "index.html"
    if index_file.exists():
        return FileResponse(index_file)
    return {
        "message": f"Welcome to {settings.APP_NAME} API v{settings.APP_VERSION}",
        "docs": "/docs",
        "health": "/health",
        "api": "/api/v1"
    }
