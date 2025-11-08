"""
Campaign management routes for brand users.
"""
from fastapi import APIRouter, HTTPException, Depends, Query
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from app.core.supabase_clients import supabase_anon
from uuid import UUID

router = APIRouter()


class CampaignCreate(BaseModel):
    """Schema for creating a new campaign."""
    title: str = Field(..., min_length=1, max_length=255)
    slug: Optional[str] = None
    short_description: Optional[str] = None
    description: Optional[str] = None
    status: str = Field(default="draft", pattern="^(draft|active|paused|completed|archived)$")
    platforms: List[str] = Field(default_factory=list)
    deliverables: Optional[List[dict]] = Field(default_factory=list)
    target_audience: Optional[dict] = Field(default_factory=dict)
    budget_min: Optional[float] = None
    budget_max: Optional[float] = None
    preferred_creator_niches: List[str] = Field(default_factory=list)
    preferred_creator_followers_range: Optional[str] = None
    starts_at: Optional[datetime] = None
    ends_at: Optional[datetime] = None
    is_featured: bool = False


class CampaignUpdate(BaseModel):
    """Schema for updating an existing campaign."""
    title: Optional[str] = None
    slug: Optional[str] = None
    short_description: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    platforms: Optional[List[str]] = None
    deliverables: Optional[List[dict]] = None
    target_audience: Optional[dict] = None
    budget_min: Optional[float] = None
    budget_max: Optional[float] = None
    preferred_creator_niches: Optional[List[str]] = None
    preferred_creator_followers_range: Optional[str] = None
    starts_at: Optional[datetime] = None
    ends_at: Optional[datetime] = None
    is_featured: Optional[bool] = None


class CampaignResponse(BaseModel):
    """Schema for campaign response."""
    id: str
    brand_id: str
    title: str
    slug: Optional[str]
    short_description: Optional[str]
    description: Optional[str]
    status: str
    platforms: List[str]
    deliverables: List[dict]
    target_audience: dict
    budget_min: Optional[float]
    budget_max: Optional[float]
    preferred_creator_niches: List[str]
    preferred_creator_followers_range: Optional[str]
    created_at: datetime
    updated_at: datetime
    published_at: Optional[datetime]
    starts_at: Optional[datetime]
    ends_at: Optional[datetime]
    is_featured: bool


async def get_brand_id_from_user(user_id: str) -> str:
    """Get brand ID from user ID."""
    supabase = supabase_anon

    try:
        response = supabase.table("brands").select("id").eq("user_id", user_id).single().execute()

        if not response.data:
            raise HTTPException(status_code=404, detail="Brand profile not found")

        return response.data["id"]
    except Exception as e:
        if "PGRST116" in str(e):  # No rows returned
            raise HTTPException(status_code=404, detail="Brand profile not found")
        raise HTTPException(status_code=500, detail=f"Error fetching brand profile: {str(e)}")


@router.post("/campaigns", response_model=CampaignResponse, status_code=201)
async def create_campaign(campaign: CampaignCreate, user_id: str = Query(..., description="User ID from authentication")):
    """
    Create a new campaign for a brand.

    - **user_id**: The authenticated user's ID (should be passed from auth middleware)
    - **campaign**: Campaign details matching the database schema
    """
    supabase = supabase_anon

    # Get brand ID from user ID
    brand_id = await get_brand_id_from_user(user_id)

    # Generate slug if not provided
    if not campaign.slug:
        import re
        slug = re.sub(r'[^a-z0-9]+', '-', campaign.title.lower()).strip('-')
        campaign.slug = f"{slug}-{datetime.now().strftime('%Y%m%d')}"

    try:
        # Prepare campaign data
        campaign_data = {
            "brand_id": brand_id,
            "title": campaign.title,
            "slug": campaign.slug,
            "short_description": campaign.short_description,
            "description": campaign.description,
            "status": campaign.status,
            "platforms": campaign.platforms,
            "deliverables": campaign.deliverables,
            "target_audience": campaign.target_audience,
            "budget_min": campaign.budget_min,
            "budget_max": campaign.budget_max,
            "preferred_creator_niches": campaign.preferred_creator_niches,
            "preferred_creator_followers_range": campaign.preferred_creator_followers_range,
            "starts_at": campaign.starts_at.isoformat() if campaign.starts_at else None,
            "ends_at": campaign.ends_at.isoformat() if campaign.ends_at else None,
            "is_featured": campaign.is_featured,
        }

        # If status is active, set published_at
        if campaign.status == "active":
            campaign_data["published_at"] = datetime.now().isoformat()

        # Insert campaign
        response = supabase.table("campaigns").insert(campaign_data).execute()

        if not response.data:
            raise HTTPException(status_code=500, detail="Failed to create campaign")

        return response.data[0]

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating campaign: {str(e)}")



@router.get("/campaigns", response_model=List[CampaignResponse])
async def get_campaigns(
    user_id: str = Query(..., description="User ID from authentication"),
    status: Optional[str] = Query(None, description="Filter by status"),
    search: Optional[str] = Query(None, description="Search by title or description"),
    platform: Optional[str] = Query(None, description="Filter by platform"),
    budget_min: Optional[float] = Query(None, description="Minimum budget"),
    budget_max: Optional[float] = Query(None, description="Maximum budget"),
    starts_after: Optional[datetime] = Query(None, description="Campaign starts after this date"),
    ends_before: Optional[datetime] = Query(None, description="Campaign ends before this date"),
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0)
):
    """
    Get all campaigns for a brand with optional filters.

    - **user_id**: The authenticated user's ID
    - **status**: Optional filter by campaign status
    - **search**: Optional search term for title or description
    - **platform**: Optional filter by platform
    - **budget_min**: Optional minimum budget
    - **budget_max**: Optional maximum budget
    - **starts_after**: Optional filter for campaigns starting after this date
    - **ends_before**: Optional filter for campaigns ending before this date
    - **limit**: Maximum number of results (default: 50, max: 100)
    - **offset**: Number of results to skip for pagination
    """
    supabase = supabase_anon

    # Get brand ID from user ID
    brand_id = await get_brand_id_from_user(user_id)

    try:
        # Build query
        query = supabase.table("campaigns").select("*").eq("brand_id", brand_id)

        # Apply filters
        if status:
            query = query.eq("status", status)

        if search:
            # Search in title and description
            query = query.or_(f"title.ilike.%{search}%,description.ilike.%{search}%")

        if platform:
            query = query.contains("platforms", [platform])

        if budget_min is not None:
            query = query.gte("budget_min", budget_min)

        if budget_max is not None:
            query = query.lte("budget_max", budget_max)

        if starts_after:
            query = query.gte("starts_at", starts_after.isoformat())

        if ends_before:
            query = query.lte("ends_at", ends_before.isoformat())

        # Apply pagination and ordering
        query = query.order("created_at", desc=True).range(offset, offset + limit - 1)

        response = query.execute()

        return response.data if response.data else []

    except Exception as e:
        import traceback
        tb = traceback.format_exc()
        raise HTTPException(
            status_code=500,
            detail=f"Error fetching campaigns: {str(e)} | Traceback: {tb}"
        )


@router.get("/campaigns/{campaign_id}", response_model=CampaignResponse)
async def get_campaign(
    campaign_id: str,
    user_id: str = Query(..., description="User ID from authentication")
):
    """
    Get a single campaign by ID.

    - **campaign_id**: The campaign ID
    - **user_id**: The authenticated user's ID
    """
    supabase = supabase_anon

    # Get brand ID from user ID
    brand_id = await get_brand_id_from_user(user_id)

    try:
        # Fetch campaign and verify ownership
        response = supabase.table("campaigns").select("*").eq("id", campaign_id).eq("brand_id", brand_id).single().execute()

        if not response.data:
            raise HTTPException(status_code=404, detail="Campaign not found")

        return response.data

    except Exception as e:
        if "PGRST116" in str(e):  # No rows returned
            raise HTTPException(status_code=404, detail="Campaign not found")
        raise HTTPException(status_code=500, detail=f"Error fetching campaign: {str(e)}")


@router.put("/campaigns/{campaign_id}", response_model=CampaignResponse)
async def update_campaign(
    campaign_id: str,
    campaign: CampaignUpdate,
    user_id: str = Query(..., description="User ID from authentication")
):
    """
    Update an existing campaign.

    - **campaign_id**: The campaign ID
    - **campaign**: Updated campaign details
    - **user_id**: The authenticated user's ID
    """
    supabase = supabase_anon

    # Get brand ID from user ID
    brand_id = await get_brand_id_from_user(user_id)

    try:
        # Verify campaign exists and belongs to this brand
        existing = supabase.table("campaigns").select("id").eq("id", campaign_id).eq("brand_id", brand_id).single().execute()

        if not existing.data:
            raise HTTPException(status_code=404, detail="Campaign not found")

        # Prepare update data (only include non-None fields)
        update_data = {k: v for k, v in campaign.dict().items() if v is not None}

        if not update_data:
            raise HTTPException(status_code=400, detail="No fields to update")

        # Update timestamp
        update_data["updated_at"] = datetime.now().isoformat()

        # If status changes to active and published_at is not set, set it
        if update_data.get("status") == "active":
            current = supabase.table("campaigns").select("published_at").eq("id", campaign_id).single().execute()
            if current.data and not current.data.get("published_at"):
                update_data["published_at"] = datetime.now().isoformat()

        # Update campaign
        response = supabase.table("campaigns").update(update_data).eq("id", campaign_id).execute()

        if not response.data:
            raise HTTPException(status_code=500, detail="Failed to update campaign")

        return response.data[0]

    except HTTPException:
        raise
    except Exception as e:
        if "PGRST116" in str(e):
            raise HTTPException(status_code=404, detail="Campaign not found")
        raise HTTPException(status_code=500, detail=f"Error updating campaign: {str(e)}")


@router.delete("/campaigns/{campaign_id}", status_code=204)
async def delete_campaign(
    campaign_id: str,
    user_id: str = Query(..., description="User ID from authentication")
):
    """
    Delete a campaign.

    - **campaign_id**: The campaign ID
    - **user_id**: The authenticated user's ID
    """
    supabase = supabase_anon

    # Get brand ID from user ID
    brand_id = await get_brand_id_from_user(user_id)

    try:
        # Verify campaign exists and belongs to this brand
        existing = supabase.table("campaigns").select("id").eq("id", campaign_id).eq("brand_id", brand_id).single().execute()

        if not existing.data:
            raise HTTPException(status_code=404, detail="Campaign not found")

        # Delete campaign
        supabase.table("campaigns").delete().eq("id", campaign_id).execute()

        return None

    except HTTPException:
        raise
    except Exception as e:
        if "PGRST116" in str(e):
            raise HTTPException(status_code=404, detail="Campaign not found")
        raise HTTPException(status_code=500, detail=f"Error deleting campaign: {str(e)}")
