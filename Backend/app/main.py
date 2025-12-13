from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.base import BaseHTTPMiddleware
from .db.db import engine
from .db.seed import seed_db
from .models import models, chat
from .routes.post import router as post_router
from .routes.chat import router as chat_router
from .routes.match import router as match_router
from sqlalchemy.exc import SQLAlchemyError
import logging
import os
import time
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
    await create_tables()
    await seed_db()
    yield
    print("App is shutting down...")


# Custom middleware for logging and timing
class RequestMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        start_time = time.time()
        
        logger.info(f"Incoming: {request.method} {request.url.path}")
        
        response = await call_next(request)
        
        process_time = time.time() - start_time
        response.headers["X-Process-Time"] = str(process_time)
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        
        logger.info(f"Completed: {request.method} {request.url.path} - {response.status_code} ({process_time:.3f}s)")
        
        return response

# Initialize FastAPI
app = FastAPI(lifespan=lifespan)

# Add custom middleware
app.add_middleware(RequestMiddleware)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:5175",
        "http://localhost:5176",
        "http://frontend:5173",
        "http://127.0.0.1:5173"
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
    try:
        return {"message": "Welcome to Inpact API!"}
    except Exception as e:
        return {"error": f"Unexpected error: {e}"}
