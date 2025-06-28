from fastapi import APIRouter, HTTPException
from supabase import create_client, Client
import os
from dotenv import load_dotenv
from ..services.db_service import match_creators_for_brand, match_brands_for_creator

# Load environment variables
load_dotenv()
url: str = os.getenv("SUPABASE_URL")
key: str = os.getenv("SUPABASE_KEY")
supabase: Client = create_client(url, key)

router = APIRouter(prefix="/match", tags=["Matching"])

@router.get("/creators-for-brand/{sponsorship_id}")
def get_creators_for_brand(sponsorship_id: str):
    matches = match_creators_for_brand(sponsorship_id)
    if not matches:
        raise HTTPException(status_code=404, detail="No matching creators found.")
    return {"matches": matches}

@router.get("/brands-for-creator/{creator_id}")
def get_brands_for_creator(creator_id: str):
    matches = match_brands_for_creator(creator_id)
    if not matches:
        raise HTTPException(status_code=404, detail="No matching brand campaigns found.")
    return {"matches": matches}

# Placeholder for endpoints, logic to be added next 