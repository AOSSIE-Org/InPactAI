from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from .db.db import (
    engine,
    initialize_database,
    close_database,
    is_database_connected,
    get_connection_status,
    Base
)
from .db.seed import seed_db
from .models import models, chat
from .routes.post import router as post_router
from .routes.chat import router as chat_router
from .routes.match import router as match_router
from sqlalchemy.exc import SQLAlchemyError
import logging
import os
from dotenv import load_dotenv
from contextlib import asynccontextmanager
from app.routes import ai

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


# Async function to create database tables with exception handling
async def create_tables():
    """Create database tables if database is connected"""
    if not is_database_connected() or not engine:
        logger.warning("⚠️ Skipping table creation - database not connected")
        return False
    
    try:
        async with engine.begin() as conn:
            # Create all model tables
            await conn.run_sync(models.Base.metadata.create_all)
            await conn.run_sync(chat.Base.metadata.create_all)
        logger.info("✅ Tables created successfully or already exist")
        return True
    except SQLAlchemyError as e:
        logger.error(f"❌ Error creating tables: {e}")
        return False
    except Exception as e:
        logger.error(f"❌ Unexpected error creating tables: {e}")
        return False


async def validate_schema():
    """Validate that required tables exist"""
    if not is_database_connected() or not engine:
        logger.warning("⚠️ Skipping schema validation - database not connected")
        return
    
    try:
        from sqlalchemy import inspect
        async with engine.connect() as conn:
            # Check for required tables
            inspector = await conn.run_sync(lambda sync_conn: inspect(sync_conn))
            tables = await conn.run_sync(lambda sync_conn: inspect(sync_conn).get_table_names())
            
            logger.info(f"📋 Found {len(tables)} tables in database")
            
            # Check for trending_niches table specifically
            if "trending_niches" not in tables:
                logger.warning("⚠️ 'trending_niches' table not found")
                logger.info("")
                logger.info("To create the trending_niches table, run:")
                logger.info("")
                logger.info("  CREATE TABLE trending_niches (")
                logger.info("    id SERIAL PRIMARY KEY,")
                logger.info("    name VARCHAR(255) NOT NULL,")
                logger.info("    insight TEXT,")
                logger.info("    global_activity INTEGER DEFAULT 1,")
                logger.info("    fetched_at DATE NOT NULL,")
                logger.info("    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP")
                logger.info("  );")
                logger.info("")
            else:
                logger.info("✅ trending_niches table found")
                
    except Exception as e:
        logger.warning(f"⚠️ Schema validation failed: {e}")


# Lifespan context manager for startup and shutdown events
@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("")
    logger.info("="*70)
    logger.info("🚀 InPact AI Backend Starting...")
    logger.info("="*70)
    
    # Initialize database
    try:
        await initialize_database()
        
        if is_database_connected():
            # Create tables
            await create_tables()
            
            # Validate schema
            await validate_schema()
            
            # Seed database
            try:
                await seed_db()
            except Exception as e:
                logger.warning(f"⚠️ Database seeding failed: {e}")
        else:
            logger.warning("")
            logger.warning("⚠️ Starting server in DEGRADED MODE")
            logger.warning("   Some features will not be available")
            logger.warning("")
    except Exception as e:
        logger.error(f"❌ Startup error: {e}")
        logger.warning("⚠️ Continuing with limited functionality...")
    
    logger.info("="*70)
    logger.info("✅ Server Ready")
    logger.info("="*70)
    logger.info("")
    
    yield
    
    logger.info("")
    logger.info("Shutting down...")
    await close_database()
    logger.info("✅ Shutdown complete")


# Initialize FastAPI
app = FastAPI(
    title="InPact AI API",
    description="AI-powered creator collaboration platform",
    version="1.0.0",
    lifespan=lifespan
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include the routes
app.include_router(post_router)
app.include_router(chat_router)
app.include_router(match_router)
app.include_router(ai.router)
app.include_router(ai.youtube_router)


@app.get("/")
async def home():
    """Health check endpoint"""
    try:
        status = get_connection_status()
        return {
            "message": "Welcome to InPact AI API!",
            "status": "healthy" if status["connected"] else "degraded",
            "database": {
                "connected": status["connected"],
                "has_fallback": status["has_fallback"]
            },
            "version": "1.0.0"
        }
    except Exception as e:
        logger.error(f"Error in health check: {e}")
        return {
            "message": "Welcome to InPact AI API!",
            "status": "unknown",
            "error": str(e)
        }


@app.get("/health")
async def health_check():
    """Detailed health check endpoint"""
    status = get_connection_status()
    return {
        "status": "healthy" if status["connected"] else "degraded",
        "database": status,
        "timestamp": None  # Could add timestamp if needed
    }


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Global exception handler to prevent server crashes"""
    logger.error(f"Unhandled exception: {exc}", exc_info=True)
    
    # Check if it's a database-related error
    error_str = str(exc).lower()
    if any(keyword in error_str for keyword in ["database", "connection", "postgresql", "sqlalchemy"]):
        return JSONResponse(
            status_code=503,
            content={
                "error": "Database connection error",
                "message": "The database is currently unavailable. Please try again later.",
                "details": str(exc) if os.getenv("DEBUG") == "true" else None
            }
        )
    
    return JSONResponse(
        status_code=500,
        content={
            "error": "Internal server error",
            "message": "An unexpected error occurred",
            "details": str(exc) if os.getenv("DEBUG") == "true" else None
        }
    )
