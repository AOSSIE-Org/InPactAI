# FastAPI router for AI-powered endpoints, including trending niches
from fastapi import APIRouter, HTTPException, Query
from datetime import date
import os
from dotenv import load_dotenv
from pathlib import Path
import requests
import json
from supabase import create_client, Client
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry

# Initialize router
router = APIRouter()

# Load environment variables from Backend/.env
env_path = Path(__file__).parent.parent.parent / '.env'
load_dotenv(dotenv_path=env_path)

# Get environment variables
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

# Validate required variables
if not SUPABASE_URL or not SUPABASE_KEY:
    raise ValueError("Missing required environment variables: SUPABASE_URL, SUPABASE_KEY")

# Make GEMINI_API_KEY optional with a warning
if not GEMINI_API_KEY:
    print("⚠️ Warning: GEMINI_API_KEY not set. Some AI features may not work.")
    GEMINI_API_KEY = None  # Set to None instead of failing

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

def fetch_from_gemini():
    prompt = (
        "List the top 6 trending content niches for creators and brands this week. For each, provide: name (the niche), insight (a short qualitative reason why it's trending), and global_activity (a number from 1 to 5, where 5 means very high global activity in this category, and 1 means low).Return as a JSON array of objects with keys: name, insight, global_activity."
    )
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent?key={GEMINI_API_KEY}"
    # Set up retry strategy
    retry_strategy = Retry(
        total=3,
        backoff_factor=1,
        status_forcelist=[429, 500, 502, 503, 504],
        allowed_methods=["POST"],
    )
    adapter = HTTPAdapter(max_retries=retry_strategy)
    http = requests.Session()
    http.mount("https://", adapter)
    http.mount("http://", adapter)
    resp = http.post(url, json={"contents": [{"parts": [{"text": prompt}]}]}, timeout=(3.05, 10))
    resp.raise_for_status()
    print("Gemini raw response:", resp.text)
    data = resp.json()
    print("Gemini parsed JSON:", data)
    text = data['candidates'][0]['content']['parts'][0]['text']
    print("Gemini text to parse as JSON:", text)
    # Remove Markdown code block if present
    if text.strip().startswith('```'):
        text = text.strip().split('\n', 1)[1]  # Remove the first line (```json)
        text = text.rsplit('```', 1)[0]        # Remove the last ```
        text = text.strip()
    return json.loads(text)

def create_trending_niches_table():
    """Create the trending_niches table if it doesn't exist"""
    try:
        # Test if table exists by making a simple query
        supabase.table("trending_niches").select("id").limit(1).execute()
        return True
    except Exception:
        print("⚠️ trending_niches table doesn't exist. Please create it manually in Supabase:")
        print("""
        CREATE TABLE trending_niches (
            id SERIAL PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            insight TEXT NOT NULL,
            global_activity INTEGER NOT NULL CHECK (global_activity >= 1 AND global_activity <= 5),
            fetched_at DATE NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        """)
        return False

def get_fallback_niches():
    """Return hardcoded fallback niches when database/API is unavailable"""
    return [
        {
            "name": "AI & Tech Innovation",
            "insight": "Growing interest in AI tools and automation",
            "global_activity": 5,
            "fetched_at": str(date.today())
        },
        {
            "name": "Sustainable Living",
            "insight": "Eco-friendly lifestyle and green products",
            "global_activity": 4,
            "fetched_at": str(date.today())
        },
        {
            "name": "Mental Health & Wellness",
            "insight": "Focus on mental health awareness and self-care",
            "global_activity": 5,
            "fetched_at": str(date.today())
        },
        {
            "name": "Remote Work & Productivity",
            "insight": "Work-from-home tips and productivity hacks",
            "global_activity": 4,
            "fetched_at": str(date.today())
        },
        {
            "name": "Personal Finance",
            "insight": "Investment advice and financial literacy",
            "global_activity": 4,
            "fetched_at": str(date.today())
        },
        {
            "name": "Fitness & Nutrition",
            "insight": "Health-focused content and workout routines",
            "global_activity": 5,
            "fetched_at": str(date.today())
        }
    ]

@router.get("/api/trending-niches")
def trending_niches():
    """
    API endpoint to get trending niches for the current day.
    - If today's data exists in Supabase, return it.
    - Otherwise, fetch from Gemini, store in Supabase, and return the new data.
    - If Gemini fails, fallback to the most recent data available.
    - If table doesn't exist, return hardcoded fallback data.
    """
    today = str(date.today())
    
    # Check if table exists first
    if not create_trending_niches_table():
        print("⚠️ Using fallback niches data - table doesn't exist")
        return get_fallback_niches()
    
    try:
        # Check if today's data exists in Supabase
        result = supabase.table("trending_niches").select("*").eq("fetched_at", today).execute()
        
        if not result.data:
            # Fetch from Gemini and store
            try:
                if not GEMINI_API_KEY:
                    raise Exception("GEMINI_API_KEY not configured")
                    
                niches = fetch_from_gemini()
                for niche in niches:
                    supabase.table("trending_niches").insert({
                        "name": niche["name"],
                        "insight": niche["insight"],
                        "global_activity": int(niche["global_activity"]),
                        "fetched_at": today
                    }).execute()
                result = supabase.table("trending_niches").select("*").eq("fetched_at", today).execute()
            except Exception as e:
                print(f"⚠️ Gemini fetch failed: {e}")
                # fallback: serve most recent data from database
                try:
                    result = supabase.table("trending_niches").select("*").order("fetched_at", desc=True).limit(6).execute()
                    if not result.data:
                        raise Exception("No data in database")
                except Exception:
                    print("⚠️ No database data available, using hardcoded fallback")
                    return get_fallback_niches()
        
        return result.data
        
    except Exception as e:
        print(f"⚠️ Database error: {e}")
        return get_fallback_niches()

youtube_router = APIRouter(prefix="/youtube", tags=["YouTube"])

@youtube_router.get("/channel-info")
def get_youtube_channel_info(channelId: str = Query(..., description="YouTube Channel ID")):
    """
    Proxy endpoint to fetch YouTube channel info securely from the backend.
    The API key is kept secret and rate limiting can be enforced here.
    """
    api_key = os.getenv("YOUTUBE_API_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="YouTube API key not configured on server.")
    url = f"https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&id={channelId}&key={api_key}"
    try:
        resp = requests.get(url, timeout=10)
        resp.raise_for_status()
        return resp.json()
    except requests.RequestException as e:
        raise HTTPException(status_code=502, detail=f"YouTube API error: {str(e)}")
