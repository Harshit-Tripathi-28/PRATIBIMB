import os
from typing import Optional, List
from pydantic import BaseModel
from dotenv import load_dotenv

# Robustly find and load .env from backend/ or root directory
_current_dir = os.path.dirname(os.path.abspath(__file__))
_backend_env = os.path.abspath(os.path.join(_current_dir, "..", ".env"))
_root_env = os.path.abspath(os.path.join(_current_dir, "..", "..", ".env"))

if os.path.exists(_backend_env):
    load_dotenv(_backend_env, override=True)
elif os.path.exists(_root_env):
    load_dotenv(_root_env, override=True)
else:
    load_dotenv(override=True)

class Settings(BaseModel):
    PROJECT_NAME: str = "PRATIBIMB — Personal AI Operating Layer & Digital Twin"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api"
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    
    BASE_DIR: str = os.path.dirname(os.path.abspath(__file__))
    STATIC_DIR: str = os.path.join(BASE_DIR, "static")
    CATALOG_DIR: str = os.path.join(STATIC_DIR, "catalog")
    UPLOADS_DIR: str = os.path.join(STATIC_DIR, "uploads")
    SAMPLES_DIR: str = os.path.join(STATIC_DIR, "samples")
    
    # LLM Provider Configuration
    GEMINI_API_KEY: Optional[str] = os.getenv("GEMINI_API_KEY")
    GEMINI_MODEL: str = os.getenv("GEMINI_MODEL", "gemini-3.8-flash")
    OPENAI_API_KEY: Optional[str] = os.getenv("OPENAI_API_KEY")
    ANTHROPIC_API_KEY: Optional[str] = os.getenv("ANTHROPIC_API_KEY")
    OLLAMA_BASE_URL: Optional[str] = os.getenv("OLLAMA_BASE_URL")
    LLM_MODEL: str = os.getenv("LLM_MODEL", "")

    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "*"
    ]

settings = Settings()

