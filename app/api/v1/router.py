from fastapi import APIRouter

from app.api.v1.endpoints import auth, detect, source, news, extension, admin

api_router = APIRouter(prefix="/api/v1")

# Mount Authentication Endpoints
api_router.include_router(auth.router)

# Mount Multimodal Detection Endpoints
api_router.include_router(detect.router)

# Mount Source Credibility Endpoints
api_router.include_router(source.router)

# Mount Live News Radar Endpoints
api_router.include_router(news.router)

# Mount Browser Extension Endpoints
api_router.include_router(extension.router)

# Mount Admin Operations Endpoints
api_router.include_router(admin.router)

