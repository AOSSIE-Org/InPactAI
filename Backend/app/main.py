from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .db.db import engine, test_connection_with_retry
from .db.seed import seed_db
from .services.supabase_service import supabase_service
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


# Async function to create database tables with exception handling
async def create_tables():
    try:
        async with engine.begin() as conn:
            await conn.run_sync(models.Base.metadata.create_all)
            await conn.run_sync(chat.Base.metadata.create_all)
        print("✅ Tables created successfully or already exist.")
    except Exception as e:
        print(f"❌ Error creating tables: {e}")
        print("⚠️ Database connection failed. Server will start without database functionality.")


# Lifespan context manager for startup and shutdown events
@asynccontextmanager
async def lifespan(app: FastAPI):
    print("App is starting...")
    
    # Test PostgreSQL connection first
    print("🔍 Testing PostgreSQL database connection...")
    is_connected, message = await test_connection_with_retry(max_retries=2)
    
    if is_connected:
        print(f"✅ PostgreSQL connection: {message}")
        try:
            await create_tables()
            await seed_db()
            print("✅ Database initialization completed successfully!")
        except Exception as e:
            print(f"⚠️ Database initialization error: {e}")
    else:
        print(f"ℹ️  PostgreSQL unavailable: {message}")
        print("🔄 Switching to Supabase REST API...")
        
        # Try Supabase REST API as fallback
        supabase_connected = await supabase_service.connect()
        if supabase_connected:
            print("✅ Using Supabase REST API for database operations")
            await supabase_service.create_tables()
            await supabase_service.seed_data()
        else:
            print("🚀 Server starting in limited mode without database...")
    
    yield
    print("App is shutting down...")


# Initialize FastAPI
app = FastAPI(lifespan=lifespan)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
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
    try:
        return {"message": "Welcome to Inpact API!"}
    except Exception as e:
        return {"error": f"Unexpected error: {e}"}
