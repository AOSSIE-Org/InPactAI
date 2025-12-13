from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, AsyncEngine
from sqlalchemy.orm import sessionmaker, declarative_base
from sqlalchemy.exc import SQLAlchemyError, OperationalError
from sqlalchemy import text
import asyncio
import logging
from typing import Optional, AsyncGenerator
from contextlib import asynccontextmanager
import socket
import os
from ..config import db_config

logger = logging.getLogger(__name__)

# Database engine and session
engine: Optional[AsyncEngine] = None
AsyncSessionLocal: Optional[sessionmaker] = None
Base = declarative_base()

# Connection state
db_connected = False
db_connection_error: Optional[str] = None


class DatabaseConnectionError(Exception):
    """Custom exception for database connection issues"""
    pass


def check_ipv6_connectivity(host: str) -> bool:
    """Check if the host resolves to IPv6 and if we can connect to it"""
    try:
        addr_info = socket.getaddrinfo(host, None)
        has_ipv6 = any(addr[0] == socket.AF_INET6 for addr in addr_info)
        
        if has_ipv6:
            logger.info(f"🔍 Host {host} resolves to IPv6 addresses")
            # Try to create a test socket connection
            for addr in addr_info:
                if addr[0] == socket.AF_INET6:
                    try:
                        test_socket = socket.socket(socket.AF_INET6, socket.SOCK_STREAM)
                        test_socket.settimeout(2)
                        test_socket.close()
                        logger.info("✅ IPv6 connectivity appears to be available")
                        return True
                    except Exception as e:
                        logger.warning(f"⚠️ IPv6 address found but connectivity test failed: {e}")
                        return False
        return True  # If no IPv6, assume IPv4 works
    except Exception as e:
        logger.warning(f"⚠️ Could not check IPv6 connectivity: {e}")
        return True  # Assume it's okay and let the actual connection fail if needed


async def test_connection(test_engine: AsyncEngine) -> bool:
    """Test if database connection is working"""
    try:
        async with test_engine.connect() as conn:
            await conn.execute(text("SELECT 1"))
        return True
    except Exception as e:
        logger.error(f"Connection test failed: {e}")
        return False


async def create_engine_with_retry() -> Optional[AsyncEngine]:
    """Create database engine with retry logic and IPv6 handling"""
    global db_connection_error
    
    if not db_config.is_configured():
        missing = db_config.get_missing_vars()
        db_connection_error = f"Missing required environment variables: {', '.join(missing)}"
        logger.error(f"❌ {db_connection_error}")
        logger.info("\n" + "="*70)
        logger.info("📋 DATABASE SETUP REQUIRED")
        logger.info("="*70)
        logger.info("Please create a .env file in the Backend directory with:")
        logger.info("")
        for var in missing:
            logger.info(f"  {var}=your_{var}_here")
        logger.info("")
        logger.info("For Supabase users:")
        logger.info("  1. Go to your Supabase project settings")
        logger.info("  2. Navigate to Database settings")
        logger.info("  3. Copy the connection string and extract the credentials")
        logger.info("="*70 + "\n")
        return None
    
    database_url = db_config.get_database_url()
    
    # Check IPv6 connectivity
    if db_config.host and db_config.prefer_ipv4:
        if not check_ipv6_connectivity(db_config.host):
            logger.warning("⚠️ IPv6 connectivity issues detected. This is a known issue with some Supabase hosts.")
            logger.info("💡 Consider using Supabase connection pooler or IPv4-compatible proxy")
    
    # Retry logic with exponential backoff
    for attempt in range(1, db_config.max_retries + 1):
        try:
            logger.info(f"🔄 Database connection attempt {attempt}/{db_config.max_retries}...")
            
            connect_args = {
                "ssl": db_config.ssl_mode if db_config.ssl_mode != "disable" else None,
                "timeout": db_config.connection_timeout,
                "command_timeout": 60,
            }
            
            # Remove None values
            connect_args = {k: v for k, v in connect_args.items() if v is not None}
            
            test_engine = create_async_engine(
                database_url,
                echo=False,  # Reduce log noise
                pool_size=db_config.pool_size,
                max_overflow=db_config.max_overflow,
                pool_timeout=db_config.pool_timeout,
                pool_recycle=db_config.pool_recycle,
                pool_pre_ping=True,  # Enable connection health checks
                connect_args=connect_args
            )
            
            # Test the connection
            if await test_connection(test_engine):
                logger.info("✅ Database connected successfully!")
                return test_engine
            else:
                await test_engine.dispose()
                raise DatabaseConnectionError("Connection test failed")
                
        except (SQLAlchemyError, OperationalError, OSError, socket.gaierror) as e:
            error_msg = str(e)
            db_connection_error = error_msg
            
            logger.error(f"❌ Connection attempt {attempt} failed: {error_msg}")
            
            # Specific error handling
            if "getaddrinfo failed" in error_msg or "gaierror" in error_msg:
                logger.error("\n" + "="*70)
                logger.error("🔴 DNS/IPv6 RESOLUTION ERROR")
                logger.error("="*70)
                logger.error("This is typically caused by:")
                logger.error("  1. IPv6-only Supabase host with limited IPv6 support")
                logger.error("  2. Local network/ISP doesn't support IPv6 properly")
                logger.error("  3. DNS resolution issues")
                logger.error("")
                logger.error("Possible solutions:")
                logger.error("  1. Use Supabase Connection Pooler (IPv4 compatible):")
                logger.error("     - Enable in Supabase Dashboard > Database > Connection Pooler")
                logger.error("     - Use the pooler connection string in your .env")
                logger.error("  2. Use a VPN with IPv6 support")
                logger.error("  3. Configure IPv4 DNS servers (e.g., Google DNS: 8.8.8.8)")
                logger.error("  4. Use Supabase REST API (fallback mode - limited features)")
                logger.error("="*70 + "\n")
            
            if attempt < db_config.max_retries:
                delay = db_config.retry_delay * (2 ** (attempt - 1))  # Exponential backoff
                logger.info(f"⏳ Retrying in {delay} seconds...")
                await asyncio.sleep(delay)
            else:
                logger.error("❌ All connection attempts failed")
                
                if db_config.has_supabase_fallback():
                    logger.info("")
                    logger.info("💡 Supabase REST API fallback is available")
                    logger.info("   Server will start with limited database functionality")
                    logger.info("   Some features may not work as expected")
                else:
                    logger.error("")
                    logger.error("⚠️ No fallback available. Some endpoints will not work.")
                    logger.error("   Set SUPABASE_URL and SUPABASE_KEY for REST API fallback.")
                
                return None
    
    return None


async def initialize_database():
    """Initialize database connection"""
    global engine, AsyncSessionLocal, db_connected, db_connection_error
    
    logger.info("🚀 Initializing database connection...")
    
    engine = await create_engine_with_retry()
    
    if engine:
        AsyncSessionLocal = sessionmaker(
            bind=engine,
            class_=AsyncSession,
            expire_on_commit=False,
            autoflush=False,
            autocommit=False
        )
        db_connected = True
        db_connection_error = None
        logger.info("✅ Database initialization complete")
    else:
        db_connected = False
        logger.warning("⚠️ Database initialization failed - running in degraded mode")
        AsyncSessionLocal = None


async def close_database():
    """Close database connection"""
    global engine, db_connected
    
    if engine:
        logger.info("Closing database connections...")
        await engine.dispose()
        engine = None
        db_connected = False
        logger.info("✅ Database connections closed")


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """Get database session with error handling"""
    if not db_connected or not AsyncSessionLocal:
        raise DatabaseConnectionError(
            f"Database not connected. Error: {db_connection_error or 'Unknown error'}"
        )
    
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()


@asynccontextmanager
async def get_db_optional() -> AsyncGenerator[Optional[AsyncSession], None]:
    """Get database session, returns None if database is not connected"""
    if not db_connected or not AsyncSessionLocal:
        logger.warning("Database not connected, yielding None")
        yield None
        return
    
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()


def is_database_connected() -> bool:
    """Check if database is connected"""
    return db_connected


def get_connection_status() -> dict:
    """Get detailed connection status"""
    return {
        "connected": db_connected,
        "error": db_connection_error,
        "has_fallback": db_config.has_supabase_fallback(),
        "config_valid": db_config.is_configured()
    }
