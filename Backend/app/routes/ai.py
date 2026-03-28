# FastAPI router for AI-powered endpoints, including trending niches
from fastapi import APIRouter, HTTPException, Query
from datetime import date
import os
import requests
import json
from supabase import create_client, Client
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry
import logging

# Initialize router
router = APIRouter()
logger = logging.getLogger(__name__)

# Load environment variables for Supabase and Gemini
SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY")
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY")

# Validate required environment variables
supabase: Client = None
supabase_available = False

try:
    if not all([SUPABASE_URL, SUPABASE_KEY]):
        logger.warning("⚠️ Supabase credentials not configured - trending niches endpoint will be limited")
    else:
        supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
        supabase_available = True
        logger.info("✅ Supabase client initialized")
except Exception as e:
    logger.error(f"❌ Failed to initialize Supabase client: {e}")
    supabase_available = False

if not GEMINI_API_KEY:
    logger.warning("⚠️ GEMINI_API_KEY not configured - trending niches will not be able to fetch new data")

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

@router.get("/api/trending-niches")
def trending_niches():
    """
    API endpoint to get trending niches for the current day.
    - If today's data exists in Supabase, return it.
    - Otherwise, fetch from Gemini, store in Supabase, and return the new data.
    - If Gemini fails, fallback to the most recent data available.
    - If Supabase is not available, return mock data.
    """
    # Check if Supabase is available
    if not supabase_available or not supabase:
        logger.warning("⚠️ Supabase not available - returning mock data")
        return {
            "error": "Database not available",
            "message": "Trending niches feature requires database connection",
            "setup_required": True,
            "data": [
                {
                    "name": "AI Content Creation",
                    "insight": "Mock data - configure SUPABASE_URL and SUPABASE_KEY to see real trends",
                    "global_activity": 5
                }
            ]
        }
    
    today = str(date.today())
    
    try:
        # Check if today's data exists in Supabase
        result = supabase.table("trending_niches").select("*").eq("fetched_at", today).execute()
        
        if not result.data:
            # Fetch from Gemini and store
            if not GEMINI_API_KEY:
                logger.warning("⚠️ GEMINI_API_KEY not configured - cannot fetch new data")
                # Return most recent data or error
                try:
                    result = supabase.table("trending_niches").select("*").order("fetched_at", desc=True).limit(6).execute()
                    if result.data:
                        return {"message": "Returning cached data (Gemini not configured)", "data": result.data}
                except Exception as e:
                    logger.error(f"Failed to fetch cached data: {e}")
                
                raise HTTPException(
                    status_code=503,
                    detail="Cannot fetch trending niches: GEMINI_API_KEY not configured and no cached data available"
                )
            
            try:
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
                logger.error(f"Gemini fetch failed: {e}")
                # fallback: serve most recent data
                try:
                    result = supabase.table("trending_niches").select("*").order("fetched_at", desc=True).limit(6).execute()
                    if result.data:
                        return {"message": "Returning cached data (Gemini fetch failed)", "data": result.data}
                except Exception as inner_e:
                    logger.error(f"Failed to fetch cached data: {inner_e}")
                
                raise HTTPException(
                    status_code=503,
                    detail=f"Failed to fetch trending niches: {str(e)}"
                )
        
        return {"data": result.data}
        
    except HTTPException:
        raise
    except Exception as e:
        error_msg = str(e).lower()
        
        # Check if it's a missing table error
        if "trending_niches" in error_msg and ("does not exist" in error_msg or "relation" in error_msg):
            logger.error("❌ trending_niches table does not exist")
            raise HTTPException(
                status_code=503,
                detail={
                    "error": "Table not found",
                    "message": "The 'trending_niches' table does not exist in the database",
                    "solution": "Please create the table using the SQL script provided in the logs or documentation",
                    "sql": """
CREATE TABLE trending_niches (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    insight TEXT,
    global_activity INTEGER DEFAULT 1,
    fetched_at DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
                    """
                }
            )
        
        logger.error(f"Unexpected error in trending_niches: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {str(e)}"
        )

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
