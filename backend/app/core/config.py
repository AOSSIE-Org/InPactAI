# Configuration settings for FastAPI app
from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    # Supabase Configuration
    supabase_url: str
    supabase_key: str
    supabase_service_key: str

    # Database Configuration
    database_url: Optional[str] = None

    # AI Configuration
    ai_api_key: Optional[str] = None
    groq_api_key: Optional[str] = None
    gemini_api_key: str

    # CORS Configuration
    allowed_origins: str = "http://localhost:3000"

    # Server Configuration
    host: str = "0.0.0.0"
    port: int = 8000

    # Application Settings
    app_name: Optional[str] = None

    model_config = {
        "env_file": ".env"
    }

settings = Settings()
