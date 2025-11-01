from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
from app.api.routes import health

app = FastAPI(title="Inpact Backend", version="0.1.0")

# --- CORS Setup (so frontend can talk to backend) ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("ALLOWED_ORIGINS", "http://localhost:3000").split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(health.router)

@app.get("/")
def root():
    return {"message": "Welcome to Inpact Backend 🚀"}
