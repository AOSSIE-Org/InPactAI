import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    """Handles application configuration using environment variables."""
    # This will now throw an error if SECRET_KEY is missing from .env
    SECRET_KEY: str 
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24

    model_config = {"env_file": ".env"}

settings = Settings()