from fastapi import FastAPI
from db.db import engine
from models import models
from routes.post import router as post_router
from sqlalchemy.exc import SQLAlchemyError
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Initialize FastAPI
app = FastAPI()

# Async function to create database tables with exception handling
async def create_tables():
    try:
        async with engine.begin() as conn:
            await conn.run_sync(models.Base.metadata.create_all)
        print("✅ Tables created successfully or already exist.")
    except SQLAlchemyError as e:
        print(f"❌ Error creating tables: {e}")

# Run table creation at startup
@app.on_event("startup")
async def startup():
    try:
        await create_tables()
    except Exception as e:
        print(f"❌ Unexpected error during startup: {e}")

# Include the routes
app.include_router(post_router)

@app.get("/")
async def home():
    try:
        return {"message": "Welcome to Inpact API!"}
    except Exception as e:
        return {"error": f"Unexpected error: {e}"}
