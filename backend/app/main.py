import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.config import settings

# Core Digital Twin Routers
from app.api.auth_routes import router as auth_router
from app.api.twin_routes import router as twin_router
from app.api.ai_routes import router as ai_router
from app.api.task_goal_routes import router as operations_router
from app.api.deep_learning_routes import router as dl_router

from app.services.twin_service import twin_service
from app.services.background_service import background_intelligence

# Ensure essential data and static directories exist
os.makedirs(settings.DATA_DIR, exist_ok=True)
os.makedirs(settings.STATIC_DIR, exist_ok=True)

@asynccontextmanager
async def lifespan(app: FastAPI):
    """FastAPI Lifespan managing background intelligence daemon startup and shutdown."""
    # Startup: Start background intelligence loop
    await background_intelligence.start()
    yield
    # Shutdown: Cleanly cancel background worker
    await background_intelligence.stop()

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="PRATIBIMB — AI Digital Twin & Personal Intelligence Operating Layer",
    lifespan=lifespan
)

# Enable CORS for frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS if settings.CORS_ORIGINS else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static asset directory if it exists
if os.path.exists(settings.STATIC_DIR):
    app.mount("/static", StaticFiles(directory=settings.STATIC_DIR), name="static")

# Mount Active API Routers
app.include_router(auth_router, prefix=settings.API_V1_STR)
app.include_router(twin_router, prefix=settings.API_V1_STR)
app.include_router(ai_router, prefix=settings.API_V1_STR)
app.include_router(operations_router, prefix=settings.API_V1_STR)
app.include_router(dl_router)

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
@app.get("/api/health")
def health_check():
    from app.services.llm_provider import llm_service
    twin = twin_service.get_twin()
    return {
        "status": "healthy",
        "service": "PRATIBIMB AI Digital Twin & Neural Engine",
        "version": settings.VERSION,
        "environment": settings.ENVIRONMENT,
        "twin_state": twin.state.context_mode,
        "ai_status": llm_service.get_status(),
        "background_daemon": "active" if background_intelligence._running else "idle"
    }
