from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Inpact Backend", version="0.1.0")

# --- CORS Setup (so frontend can talk to backend) ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # later we’ll restrict this to your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {"message": "Welcome to Inpact Backend 🚀"}
