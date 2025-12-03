from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
from app.api.routes import health
from app.core.supabase_clients import supabase_anon as supabase
from app.api.routes import auth
from app.api.routes import gemini_generate
from app.api.routes import campaigns
from app.api.routes import groq_generate
from app.api.routes import collaborations
from app.api.routes import creators
from app.api.routes import proposals
from app.api.routes import analytics
from app.api.routes import ai_analytics
from app.api.routes import profiles
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
app.include_router(gemini_generate.router)
app.include_router(health.router)
app.include_router(auth.router)
app.include_router(campaigns.router)
app.include_router(groq_generate.router)
app.include_router(collaborations.router)
app.include_router(creators.router)
app.include_router(proposals.router)
app.include_router(analytics.router)
app.include_router(ai_analytics.router)
app.include_router(profiles.router)

@app.get("/")
def root():
    return {"message": "Welcome to Inpact Backend 🚀"}
