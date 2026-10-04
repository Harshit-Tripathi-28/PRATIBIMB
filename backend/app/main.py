import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.config import settings
from app.api.tryon import router as tryon_router
from app.api.stream import router as stream_router
from app.api.catalog import router as catalog_router
from app.api.analysis import router as analysis_router
from app.api.lookbook import router as lookbook_router
from app.api.twin_routes import router as twin_router
from app.api.ai_routes import router as ai_router
from app.api.task_goal_routes import router as operations_router
from app.services.asset_generator import ensure_assets
from app.services.twin_service import twin_service

# Ensure essential assets and directory paths exist
ensure_assets()
os.makedirs(settings.STATIC_DIR, exist_ok=True)
os.makedirs(settings.CATALOG_DIR, exist_ok=True)
os.makedirs(settings.UPLOADS_DIR, exist_ok=True)
os.makedirs(settings.SAMPLES_DIR, exist_ok=True)

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="PRATIBIMB — AI Digital Twin & Personal Intelligence Operating Layer"
)

# Enable CORS for frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static asset directory
app.mount("/static", StaticFiles(directory=settings.STATIC_DIR), name="static")

# Mount API Routers
app.include_router(twin_router, prefix=settings.API_V1_STR)
app.include_router(ai_router, prefix=settings.API_V1_STR)
app.include_router(operations_router, prefix=settings.API_V1_STR)
app.include_router(tryon_router, prefix=settings.API_V1_STR)
app.include_router(stream_router, prefix=settings.API_V1_STR)
app.include_router(catalog_router, prefix=settings.API_V1_STR)
app.include_router(analysis_router, prefix=settings.API_V1_STR)
app.include_router(lookbook_router, prefix=settings.API_V1_STR)

@app.get("/")
def root():
    twin = twin_service.get_twin()
    return {
        "app": "PRATIBIMB AI Operating Layer",
        "user": twin.profile.name,
        "title": twin.profile.title,
        "status": "online",
        "digital_twin_synced": True,
        "docs": "/docs"
    }

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "PRATIBIMB AI Digital Twin & Neural Engine",
        "twin_state": twin_service.get_twin().state.context_mode
    }
