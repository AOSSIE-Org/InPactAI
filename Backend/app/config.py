import os
from dotenv import load_dotenv
from typing import Optional
import logging

# Load environment variables
load_dotenv()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class DatabaseConfig:
    """Database configuration with environment variable handling"""
    
    def __init__(self):
        self.user = os.getenv("user")
        self.password = os.getenv("password")
        self.host = os.getenv("host")
        self.port = os.getenv("port", "5432")
        self.dbname = os.getenv("dbname")
        
        # Connection settings
        self.pool_size = int(os.getenv("DB_POOL_SIZE", "5"))
        self.max_overflow = int(os.getenv("DB_MAX_OVERFLOW", "10"))
        self.pool_timeout = int(os.getenv("DB_POOL_TIMEOUT", "30"))
        self.pool_recycle = int(os.getenv("DB_POOL_RECYCLE", "3600"))
        
        # Connection retry settings
        self.max_retries = int(os.getenv("DB_MAX_RETRIES", "3"))
        self.retry_delay = float(os.getenv("DB_RETRY_DELAY", "1.0"))
        self.connection_timeout = int(os.getenv("DB_CONNECTION_TIMEOUT", "10"))
        
        # IPv6 handling
        self.prefer_ipv4 = os.getenv("DB_PREFER_IPV4", "true").lower() == "true"
        self.ssl_mode = os.getenv("DB_SSL_MODE", "require")
        
        # Supabase REST API fallback
        self.supabase_url = os.getenv("SUPABASE_URL")
        self.supabase_key = os.getenv("SUPABASE_KEY")
        self.use_rest_fallback = os.getenv("DB_USE_REST_FALLBACK", "true").lower() == "true"
    
    def get_database_url(self) -> Optional[str]:
        """Construct database URL from environment variables"""
        if not all([self.user, self.password, self.host, self.dbname]):
            return None
        return f"postgresql+asyncpg://{self.user}:{self.password}@{self.host}:{self.port}/{self.dbname}"
    
    def is_configured(self) -> bool:
        """Check if database is properly configured"""
        return all([self.user, self.password, self.host, self.dbname])
    
    def has_supabase_fallback(self) -> bool:
        """Check if Supabase REST API fallback is available"""
        return all([self.supabase_url, self.supabase_key]) and self.use_rest_fallback
    
    def get_missing_vars(self) -> list[str]:
        """Get list of missing required environment variables"""
        missing = []
        if not self.user:
            missing.append("user")
        if not self.password:
            missing.append("password")
        if not self.host:
            missing.append("host")
        if not self.dbname:
            missing.append("dbname")
        return missing


# Global configuration instance
db_config = DatabaseConfig()
