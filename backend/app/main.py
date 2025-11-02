from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
from app.api.routes import health
from app.services.supabase_client import supabase

app = FastAPI(title="Inpact Backend", version="0.1.0")

# Verify Supabase client initialization on startup
try:
    # Try a lightweight query
    response = supabase.table("_supabase_test").select("*").limit(1).execute()
    print("✅ Supabase client initialized successfully.")
except Exception as e:
    error_msg = str(e)
    if "Could not find the table" in error_msg:
        print("⚠️ Supabase client connected, but test table does not exist. Connection is working.")
    else:
        print(f"❌ Failed to verify Supabase connection: {e}")

# --- CORS Setup ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("ALLOWED_ORIGINS", "http://localhost:3000").split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router)

@app.get("/")
def root():
    return {"message": "Welcome to Inpact Backend 🚀"}
