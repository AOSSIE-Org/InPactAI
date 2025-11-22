from fastapi import APIRouter, HTTPException
from app.services.analytics_service import (
    get_campaign_analytics,
    get_creator_analytics
)

router = APIRouter(prefix="/analytics", tags=["Analytics"])

@router.get("/campaign/{campaign_id}")
async def campaign_analytics(campaign_id: int):
    data = get_campaign_analytics(campaign_id)
    if not data:
        raise HTTPException(status_code=404, detail="Campaign not found")
    return data

@router.get("/creator/{creator_id}")
async def creator_analytics(creator_id: int):
    data = get_creator_analytics(creator_id)
    if not data:
        raise HTTPException(status_code=404, detail="Creator not found")
    return data
