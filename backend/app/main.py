from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import (
    health,
    auth,
    gemini_generate,
    campaigns,
    groq_generate,
    collaborations,
    creators,
    proposals,
    analytics,
    ai_analytics,
    profiles,
)

app = FastAPI(title="Inpact Backend", version="0.1.0")

# 🔥 FORCE OPEN CORS (DEBUG MODE)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,  # must be False when using "*"
    allow_methods=["*"],
    allow_headers=["*"],
)


# Routes
app.include_router(health.router)
app.include_router(auth.router)
app.include_router(gemini_generate.router)
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
    return {"message": "Inpact Backend Running 🚀"}

