from pydantic_settings import BaseSettings
from typing import Optional, Dict, Any
import json

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
    gemini_api_key: Optional[str] = None

    # CORS Configuration
    allowed_origins: str = "http://localhost:3000"

    # Server Configuration
    host: str = "0.0.0.0"
    port: int = 8000

    # Application Settings
    app_name: Optional[str] = None

    # JWT Authentication (RAW JSON STRING)
    SUPABASE_JWT_PUBLIC_KEY: str

    model_config = {
        "env_file": ".env"
    }

    @property
    def supabase_jwt_jwk(self) -> Dict[str, Any]:
        return json.loads(self.SUPABASE_JWT_PUBLIC_KEY)

settings = Settings()
