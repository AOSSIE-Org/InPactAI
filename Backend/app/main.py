from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .db.db import engine
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


# Async function to create database tables with exception handling
async def create_tables():
    """
    Creates database tables asynchronously if the database engine is available.

    This function attempts to create all tables defined in the SQLAlchemy models
    (models.Base and chat.Base). It handles cases where the database engine
    might not be initialized due to connection errors.
    """
    if engine is None:
        print("⚠️ Database engine is not available. Skipping table creation.")
        return

    try:
        async with engine.begin() as conn:
            await conn.run_sync(models.Base.metadata.create_all)
            await conn.run_sync(chat.Base.metadata.create_all)
        print("✅ Tables created successfully or already exist.")
    except SQLAlchemyError as e:
        print(f"❌ Error creating tables: {e}")


# Lifespan context manager for startup and shutdown events
@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Lifespan context manager for the FastAPI application.

    Handles startup and shutdown events. On startup, it attempts to
    create database tables and seed the database.

    Args:
        app (FastAPI): The FastAPI application instance.
    """
    print("App is starting...")
    await create_tables()
    # verify engine is not None before seeding
    if engine:
        await seed_db()
    else:
        print("⚠️ Database engine is not available. Skipping data seeding.")
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
    """
    Root endpoint for the API.

    Returns:
        dict: A welcome message.
    """
    try:
        return {"message": "Welcome to Inpact API!"}
    except Exception as e:
        return {"error": f"Unexpected error: {e}"}
