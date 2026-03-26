# FastAPI router for AI-powered endpoints, including trending niches
from fastapi import APIRouter, HTTPException, Query
from datetime import date
import os
import requests
import json
from supabase import create_client, Client
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry

# Initialize router
router = APIRouter()

# Load environment variables for Supabase and Gemini
SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY")
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY")

# Validate required environment variables
if not all([SUPABASE_URL, SUPABASE_KEY, GEMINI_API_KEY]):
    raise ValueError("Missing required environment variables: SUPABASE_URL, SUPABASE_KEY, GEMINI_API_KEY")

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

@router.get("/api/trending-niches")
def trending_niches():
    """
    API endpoint to get trending niches for the current day.
    - If today's data exists in Supabase, return it.
    - Otherwise, fetch from Gemini, store in Supabase, and return the new data.
    - If Gemini fails, fallback to the most recent data available.
    """
    today = str(date.today())
    # Check if today's data exists in Supabase
    result = supabase.table("trending_niches").select("*").eq("fetched_at", today).execute()
    if not result.data:
        # Fetch from Gemini and store
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
            print("Gemini fetch failed:", e)
            # fallback: serve most recent data
            result = supabase.table("trending_niches").select("*").order("fetched_at", desc=True).limit(6).execute()
    return result.data

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
