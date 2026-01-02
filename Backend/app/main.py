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
from supabase import create_client, AsyncClient

# Load environment variables
load_dotenv()


# Async function to create database tables with exception handling
async def create_tables():
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
    print("App is starting...")
    # Initialize Supabase async client (non-fatal if missing envs)
    supabase_url = os.getenv("SUPABASE_URL")
    supabase_key = os.getenv("SUPABASE_KEY")
    if supabase_url and supabase_key:
        app.state.supabase = create_client(supabase_url, supabase_key, supabase_cls=AsyncClient)
    else:
        app.state.supabase = None
        logging.warning("Supabase configuration missing; related endpoints will return 500 until configured.")

    await create_tables()
    await seed_db()
    yield
    # Close Supabase async client if initialized
    supabase_client = getattr(app.state, "supabase", None)
    if supabase_client:
        close = getattr(supabase_client, "aclose", None)
        if close:
            await close()
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
