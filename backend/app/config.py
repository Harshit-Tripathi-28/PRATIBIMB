import os
import json
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
    VERSION: str = "2.0.0"
    API_V1_STR: str = "/api"
    HOST: str = os.getenv("HOST", "0.0.0.0")
    PORT: int = int(os.getenv("PORT", "8000"))
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    
    BASE_DIR: str = os.path.dirname(os.path.abspath(__file__))
    DATA_DIR: str = os.path.join(BASE_DIR, "data")
    DB_PATH: str = os.path.join(DATA_DIR, "pratibimb.db")
    STATIC_DIR: str = os.path.join(BASE_DIR, "static")
    
    # Auth & Security
    SECRET_KEY: str = os.getenv("AUTH_SECRET_KEY", "pratibimb_digital_twin_super_secret_signing_key_2026")
    
    # LLM Provider Configuration
    GEMINI_API_KEY: Optional[str] = os.getenv("GEMINI_API_KEY")
    GEMINI_MODEL: str = os.getenv("GEMINI_MODEL", "gemini-3.8-flash")
    OPENAI_API_KEY: Optional[str] = os.getenv("OPENAI_API_KEY")
    ANTHROPIC_API_KEY: Optional[str] = os.getenv("ANTHROPIC_API_KEY")
    OLLAMA_BASE_URL: Optional[str] = os.getenv("OLLAMA_BASE_URL")
    LLM_MODEL: str = os.getenv("LLM_MODEL", "")

    # Rate Limiting & Safety
    AI_RATE_LIMIT_PER_MINUTE: int = int(os.getenv("AI_RATE_LIMIT_PER_MINUTE", "30"))
    REQUEST_TIMEOUT_SECONDS: int = int(os.getenv("REQUEST_TIMEOUT_SECONDS", "20"))

    # Configurable CORS Origins
    CORS_ORIGINS: List[str] = [
        origin.strip() for origin in os.getenv(
            "CORS_ORIGINS", 
            "http://localhost:5173,http://127.0.0.1:5173,http://localhost:3000,http://127.0.0.1:3000"
        ).split(",") if origin.strip()
    ]

settings = Settings()

# Enforce security assertion in production mode
if settings.ENVIRONMENT == "production":
    if settings.SECRET_KEY == "pratibimb_digital_twin_super_secret_signing_key_2026":
        raise ValueError("CRITICAL SECURITY ERROR: Default AUTH_SECRET_KEY cannot be used in production.")
