from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker, declarative_base
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.pool import NullPool
from sqlalchemy import text
import asyncio
import os
from dotenv import load_dotenv

# Load environment variables from .env
load_dotenv()

# Fetch database credentials and strip whitespace
USER = os.getenv("user", "").strip()
PASSWORD = os.getenv("password", "").strip()
HOST = os.getenv("host", "").strip()
PORT = os.getenv("port", "").strip()
DBNAME = os.getenv("dbname", "").strip()

# Construct async SQLAlchemy connection string with connection parameters
DATABASE_URL = f"postgresql+asyncpg://{USER}:{PASSWORD}@{HOST}:{PORT}/{DBNAME}"

# Initialize async SQLAlchemy components
try:
    engine = create_async_engine(
        DATABASE_URL,
        echo=False,  # Reduce noise in logs
        poolclass=NullPool,
        future=True,
        connect_args={
            "server_settings": {
                "application_name": "InPact_Backend",
            },
            "command_timeout": 30,
            # Add SSL configuration for Supabase
            "ssl": "require",
        }
    )

    AsyncSessionLocal = sessionmaker(
        bind=engine,
        class_=AsyncSession,
        expire_on_commit=False
    )
    
    Base = declarative_base()
    print("✅ Database engine created successfully!")
except SQLAlchemyError as e:
    print(f"❌ Error creating database engine: {e}")
    engine = None
    AsyncSessionLocal = None
    Base = None


async def test_connection():
    """Test database connection with detailed diagnostics"""
    try:
        if engine is None:
            return False, "Engine not initialized"
        
        # Test DNS resolution first
        import socket
        try:
            socket.getaddrinfo(HOST, PORT, socket.AF_UNSPEC, socket.SOCK_STREAM)
        except socket.gaierror as dns_error:
            if "11001" in str(dns_error):
                return False, f"IPv6 connectivity issue detected for {HOST}. Your network may not support IPv6, but Supabase REST API is available as fallback."
            else:
                return False, f"DNS resolution failed: {dns_error}"
        
        # Try database connection with timeout
        try:
            async with asyncio.wait_for(engine.begin(), timeout=10) as conn:
                result = await conn.execute(text("SELECT 1"))
                await result.fetchone()
            return True, "PostgreSQL connection successful"
        except asyncio.TimeoutError:
            return False, "Connection timeout - database may be unreachable"
            
    except Exception as e:
        error_msg = str(e)
        if "11001" in error_msg:
            return False, f"IPv6 connectivity issue: Your system cannot resolve the IPv6-only Supabase database host. Using REST API fallback."
        return False, f"Connection failed: {e}"


async def test_connection_with_retry(max_retries: int = 2):
    """Test connection with retry mechanism"""
    for attempt in range(max_retries):
        is_connected, message = await test_connection()
        if is_connected:
            return True, message
        
        if attempt < max_retries - 1:
            print(f"⚠️ Connection attempt {attempt + 1} failed: {message}")
            print(f"🔄 Retrying in 2 seconds...")
            await asyncio.sleep(2)
        else:
            return False, message
    
    return False, "All connection attempts failed"


async def get_db():
    if AsyncSessionLocal is None:
        raise Exception("Database not configured properly")
    
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()
