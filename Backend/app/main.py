from fastapi import FastAPI
from db.db import engine
from models import models
from routes.post import router as post_router
from sqlalchemy.exc import SQLAlchemyError
from contextlib import asynccontextmanager
import logging
import os
from dotenv import load_dotenv
from contextlib import asynccontextmanager

# Load environment variables
load_dotenv()
host=os.getenv("host")

import socket
socket.getaddrinfo(host,443)

# Initialize logger
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Async function to create database tables with exception handling
async def create_tables():
    try:
        async with engine.begin() as conn:
            await conn.run_sync(models.Base.metadata.create_all)
        print("✅ Tables created successfully or already exist.")
    except SQLAlchemyError as e:
        print(f"❌ Error creating tables: {e}")

#Lifespan context manager for startup and shutdown events
@asynccontextmanager
async def lifespan(app: FastAPI):
    print("App is starting...")
    await create_tables()
    yield
    print("App is shutting down...")

# Initialize FastAPI
app = FastAPI(lifespan=lifespan)

# Include the routes
app.include_router(post_router)

@app.get("/")
async def home():
    try:
        return {"message": "Welcome to Inpact API!"}
    except Exception as e:
        return {"error": f"Unexpected error: {e}"}
