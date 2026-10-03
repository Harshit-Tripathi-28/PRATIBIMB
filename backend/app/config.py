import os
from pydantic import BaseModel

class Settings(BaseModel):
    PROJECT_NAME: str = "Pratibimb AI Virtual Try-On & Smart Mirror"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api"
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    
    BASE_DIR: str = os.path.dirname(os.path.abspath(__file__))
    STATIC_DIR: str = os.path.join(BASE_DIR, "static")
    CATALOG_DIR: str = os.path.join(STATIC_DIR, "catalog")
    UPLOADS_DIR: str = os.path.join(STATIC_DIR, "uploads")
    SAMPLES_DIR: str = os.path.join(STATIC_DIR, "samples")
    
    CORS_ORIGINS: list[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "*"
    ]

settings = Settings()
