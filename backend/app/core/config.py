# Configuration settings for FastAPI app
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    database_url: str
    ai_api_key: str

    model_config = {
        "env_file": ".env"
    }

settings = Settings()
