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
from app.services.asset_generator import ensure_assets

# Ensure essential assets and directory paths exist
ensure_assets()
os.makedirs(settings.STATIC_DIR, exist_ok=True)
os.makedirs(settings.CATALOG_DIR, exist_ok=True)
os.makedirs(settings.UPLOADS_DIR, exist_ok=True)
os.makedirs(settings.SAMPLES_DIR, exist_ok=True)

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Pratibimb - AI Virtual Mirror & Smart Apparel/Eyewear Try-On Platform"
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
app.include_router(tryon_router, prefix=settings.API_V1_STR)
app.include_router(stream_router, prefix=settings.API_V1_STR)
app.include_router(catalog_router, prefix=settings.API_V1_STR)
app.include_router(analysis_router, prefix=settings.API_V1_STR)
app.include_router(lookbook_router, prefix=settings.API_V1_STR)

@app.get("/")
def root():
    return {
        "app": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "status": "operational",
        "docs": "/docs"
    }

@app.get("/health")
def health_check():
    return {"status": "healthy", "service": "Pratibimb AI Engine"}
