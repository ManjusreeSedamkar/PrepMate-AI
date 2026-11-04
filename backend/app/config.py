import os
from typing import List
from dotenv import load_dotenv

# Load environment variables from .env file (check backend/.env, root .env, or system)
backend_env = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".env"))
if os.path.exists(backend_env):
    load_dotenv(dotenv_path=backend_env)
load_dotenv()

class Settings:
    PROJECT_NAME: str = "PrepMate AI"
    VERSION: str = "1.0.0"
    API_PREFIX: str = "/api"
    
    # Gemini Configuration
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "").strip()
    GEMINI_MODEL: str = os.getenv("GEMINI_MODEL", "gemini-3.8-flash").strip()
    
    # Server Configuration
    HOST: str = os.getenv("HOST", "0.0.0.0")
    PORT: int = int(os.getenv("PORT", 8000))
    
    # CORS Configuration
    CORS_ORIGINS: List[str] = [
        origin.strip()
        for origin in os.getenv("CORS_ORIGINS", "*").split(",")
        if origin.strip()
    ]

settings = Settings()
