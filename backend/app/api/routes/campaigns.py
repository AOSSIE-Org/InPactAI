"""
Campaign management routes for brand users.
"""
from fastapi import APIRouter, HTTPException, Depends, Query
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime, timezone
from app.core.supabase_clients import supabase_anon
from app.core.dependencies import get_current_brand, get_current_creator, optional_security
from fastapi.security import HTTPAuthorizationCredentials
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
    is_open_for_applications: bool = False
    is_on_campaign_wall: bool = False


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
    is_open_for_applications: Optional[bool] = None
    is_on_campaign_wall: Optional[bool] = None


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
    is_open_for_applications: Optional[bool] = False
    is_on_campaign_wall: Optional[bool] = False


@router.post("/campaigns", response_model=CampaignResponse, status_code=201)
async def create_campaign(campaign: CampaignCreate, brand: dict = Depends(get_current_brand)):
    """
    Create a new campaign for a brand.

    - **campaign**: Campaign details matching the database schema
    """
    supabase = supabase_anon

    # Get brand ID from authenticated brand profile
    brand_id = brand['id']

    # Generate slug if not provided
    if not campaign.slug:
        import re
        slug = re.sub(r'[^a-z0-9]+', '-', campaign.title.lower()).strip('-')
        # Ensure uniqueness by checking existing slugs (race condition handled below)
        base_slug = f"{slug}-{datetime.now(timezone.utc).strftime('%Y%m%d')}"
        campaign.slug = base_slug
        counter = 1
        while True:
            existing = supabase.table("campaigns").select("id").eq("slug", campaign.slug).execute()
            if not existing.data:
                break
            campaign.slug = f"{base_slug}-{counter}"
            counter += 1

    import time
    max_attempts = 5
    for attempt in range(max_attempts):
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
                "is_open_for_applications": campaign.is_open_for_applications,
                "is_on_campaign_wall": campaign.is_on_campaign_wall,
            }

            # If status is active, set published_at
            if campaign.status == "active":
                campaign_data["published_at"] = datetime.now(timezone.utc).isoformat()

            # Insert campaign
            response = supabase.table("campaigns").insert(campaign_data).execute()

            if not response.data:
                raise HTTPException(status_code=500, detail="Failed to create campaign")

            created_campaign = response.data[0]
            campaign_id = created_campaign["id"]

            # Also insert deliverables into campaign_deliverables table for analytics
            if campaign.deliverables:
                deliverable_records = []
                for deliverable in campaign.deliverables:
                    if isinstance(deliverable, dict):
                        deliverable_records.append({
                            "campaign_id": campaign_id,
                            "platform": deliverable.get("platform"),
                            "content_type": deliverable.get("content_type"),
                            "quantity": deliverable.get("quantity", 1),
                            "guidance": deliverable.get("guidance"),
                            "required": deliverable.get("required", True)
                        })

                if deliverable_records:
                    supabase.table("campaign_deliverables").insert(deliverable_records).execute()

            return created_campaign

        except HTTPException:
            raise
        except Exception as e:
            # Check for unique constraint violation on slug
            if "duplicate key value violates unique constraint" in str(e) and "slug" in str(e):
                # Regenerate slug and retry
                campaign.slug = f"{base_slug}-{int(time.time() * 1000)}"
                continue
            raise HTTPException(status_code=500, detail=f"Error creating campaign: {str(e)}") from e
    raise HTTPException(status_code=500, detail="Could not generate a unique slug for the campaign after multiple attempts.")



@router.get("/campaigns", response_model=List[CampaignResponse])
async def get_campaigns(
    brand: dict = Depends(get_current_brand),
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

    # Get brand ID from authenticated brand profile
    brand_id = brand['id']

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

    except HTTPException:
        raise
    except Exception as e:
        # Log the full error internally
        import logging
        logger = logging.getLogger(__name__)
        logger.exception("Error fetching campaigns")
        raise HTTPException(
            status_code=500,
            detail="Error fetching campaigns. Please contact support if the issue persists."
        ) from e


# ============================================================================
# PUBLIC CAMPAIGN WALL ENDPOINT (Must be before /campaigns/{campaign_id} to avoid route conflict)
# ============================================================================

@router.get("/campaigns/public", response_model=List[CampaignResponse])
async def get_public_campaigns(
    search: Optional[str] = Query(None, description="Search by title or description"),
    platform: Optional[str] = Query(None, description="Filter by platform"),
    niche: Optional[str] = Query(None, description="Filter by preferred niche"),
    budget_min: Optional[float] = Query(None, description="Minimum budget"),
    budget_max: Optional[float] = Query(None, description="Maximum budget"),
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0)
):
    """
    Get all campaigns that are open for applications and on the campaign wall.
    This endpoint is accessible to any authenticated user (creators and brands).
    """
    from app.core.supabase_clients import supabase_anon
    supabase = supabase_anon

    try:
        # Build query for campaigns that are open and on wall
        query = supabase.table("campaigns").select("*").eq("is_open_for_applications", True).eq("is_on_campaign_wall", True).eq("status", "active")

        # Apply filters
        if search:
            query = query.or_(f"title.ilike.%{search}%,description.ilike.%{search}%,short_description.ilike.%{search}%")

        if platform:
            query = query.contains("platforms", [platform])

        if niche:
            query = query.contains("preferred_creator_niches", [niche])

        if budget_min is not None:
            query = query.gte("budget_min", budget_min)

        if budget_max is not None:
            query = query.lte("budget_max", budget_max)

        # Apply pagination and ordering
        query = query.order("created_at", desc=True).range(offset, offset + limit - 1)

        response = query.execute()

        return response.data if response.data else []

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error fetching public campaigns: {str(e)}"
        ) from e


@router.get("/campaigns/{campaign_id}", response_model=CampaignResponse)
async def get_campaign(
    campaign_id: str,
    brand: dict = Depends(get_current_brand)
):
    """
    Get a single campaign by ID.

    - **campaign_id**: The campaign ID
    """
    supabase = supabase_anon

    # Get brand ID from authenticated brand profile
    brand_id = brand['id']

    try:
        # Fetch campaign and verify ownership
        response = supabase.table("campaigns").select("*").eq("id", campaign_id).eq("brand_id", brand_id).single().execute()

        if not response.data:
            raise HTTPException(status_code=404, detail="Campaign not found")

        return response.data

    except HTTPException:
        raise
    except Exception as e:
        if "PGRST116" in str(e):  # No rows returned
            raise HTTPException(status_code=404, detail="Campaign not found") from e
        raise HTTPException(status_code=500, detail=f"Error fetching campaign: {str(e)}") from e


@router.get("/campaigns/{campaign_id}/deliverables")
async def get_campaign_deliverables(
    campaign_id: str,
    brand: dict = Depends(get_current_brand)
):
    """
    Get all deliverables for a campaign.

    - **campaign_id**: The campaign ID
    """
    supabase = supabase_anon
    brand_id = brand['id']

    try:
        # Verify campaign exists and belongs to this brand
        campaign_res = supabase.table("campaigns") \
            .select("id, deliverables") \
            .eq("id", campaign_id) \
            .eq("brand_id", brand_id) \
            .single() \
            .execute()

        if not campaign_res.data:
            raise HTTPException(status_code=404, detail="Campaign not found")

        campaign = campaign_res.data

        # Get deliverables from table
        deliverables_res = supabase.table("campaign_deliverables") \
            .select("*") \
            .eq("campaign_id", campaign_id) \
            .order("created_at", desc=False) \
            .execute()

        deliverables = deliverables_res.data or []

        # If no deliverables in table, check JSON field and migrate them
        if not deliverables and campaign.get("deliverables"):
            json_deliverables = campaign.get("deliverables", [])
            if isinstance(json_deliverables, list) and len(json_deliverables) > 0:
                # Migrate from JSON to table
                deliverable_records = []
                for deliverable in json_deliverables:
                    if isinstance(deliverable, dict):
                        deliverable_records.append({
                            "campaign_id": campaign_id,
                            "platform": deliverable.get("platform"),
                            "content_type": deliverable.get("content_type"),
                            "quantity": deliverable.get("quantity", 1),
                            "guidance": deliverable.get("guidance"),
                            "required": deliverable.get("required", True)
                        })

                if deliverable_records:
                    migrated_res = supabase.table("campaign_deliverables") \
                        .insert(deliverable_records) \
                        .execute()
                    deliverables = migrated_res.data or []

        return {"deliverables": deliverables}

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error fetching deliverables: {str(e)}"
        ) from e


@router.put("/campaigns/{campaign_id}", response_model=CampaignResponse)
async def update_campaign(
    campaign_id: str,
    campaign: CampaignUpdate,
    brand: dict = Depends(get_current_brand)
):
    """
    Update an existing campaign.

    - **campaign_id**: The campaign ID
    - **campaign**: Updated campaign details
    """
    supabase = supabase_anon

    # Get brand ID from authenticated brand profile
    brand_id = brand['id']

    try:
        # Verify campaign exists and belongs to this brand
        existing = supabase.table("campaigns").select("id, published_at").eq("id", campaign_id).eq("brand_id", brand_id).single().execute()

        if not existing.data:
            raise HTTPException(status_code=404, detail="Campaign not found")

        # Prepare update data (only include non-None fields) using Pydantic v2 API
        update_data = campaign.model_dump(exclude_none=True)

        if not update_data:
            raise HTTPException(status_code=400, detail="No fields to update")

        # Update timestamp
        update_data["updated_at"] = datetime.now(timezone.utc).isoformat()

        # Serialize datetime fields to ISO format
        if "starts_at" in update_data and update_data["starts_at"] is not None:
            if isinstance(update_data["starts_at"], datetime):
                update_data["starts_at"] = update_data["starts_at"].isoformat()
        if "ends_at" in update_data and update_data["ends_at"] is not None:
            if isinstance(update_data["ends_at"], datetime):
                update_data["ends_at"] = update_data["ends_at"].isoformat()

        # If status changes to active and published_at is not set, set it
        if update_data.get("status") == "active" and not existing.data.get("published_at"):
            update_data["published_at"] = datetime.now(timezone.utc).isoformat()

        # Update campaign
        response = supabase.table("campaigns").update(update_data).eq("id", campaign_id).execute()

        if not response.data:
            raise HTTPException(status_code=500, detail="Failed to update campaign")

        return response.data[0]

    except HTTPException:
        raise
    except Exception as e:
        if "PGRST116" in str(e):
            raise HTTPException(status_code=404, detail="Campaign not found") from e
        raise HTTPException(status_code=500, detail=f"Error updating campaign: {str(e)}") from e


@router.delete("/campaigns/{campaign_id}", status_code=204)
async def delete_campaign(
    campaign_id: str,
    brand: dict = Depends(get_current_brand)
):
    """
    Delete a campaign.

    - **campaign_id**: The campaign ID
    """
    supabase = supabase_anon

    # Get brand ID from authenticated brand profile
    brand_id = brand['id']

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
            raise HTTPException(status_code=404, detail="Campaign not found") from e
        raise HTTPException(status_code=500, detail=f"Error deleting campaign: {str(e)}") from e


@router.get("/campaigns/{campaign_id}/find-creators")
async def find_matching_creators(
    campaign_id: str,
    brand: dict = Depends(get_current_brand),
    limit: int = Query(4, ge=1, le=10),
    use_ai: bool = Query(True, description="Use Groq to find and rank creators")
):
    """
    Find matching creators for a campaign using AI (Groq).
    Returns top matching creators with match scores and reasoning.
    """
    from app.core.config import settings
    from groq import Groq
    import json

    supabase = supabase_anon
    brand_id = brand['id']

    try:
        # Fetch campaign and verify ownership
        campaign_resp = supabase.table("campaigns") \
            .select("*") \
            .eq("id", campaign_id) \
            .eq("brand_id", brand_id) \
            .single() \
            .execute()

        if not campaign_resp.data:
            raise HTTPException(status_code=404, detail="Campaign not found")

        campaign = campaign_resp.data

        # Fetch brand details
        brand_resp = supabase.table("brands") \
            .select("*") \
            .eq("id", brand_id) \
            .single() \
            .execute()

        brand_data = brand_resp.data if brand_resp.data else {}

        # Fetch active creators
        creators_resp = supabase.table("creators") \
            .select("*") \
            .eq("is_active", True) \
            .order("total_followers", desc=True) \
            .limit(200) \
            .execute()

        candidates = creators_resp.data or []

        if not candidates:
            return []

        # Initial rule-based filtering and scoring
        def list_overlap(a, b):
            if not a or not b:
                return 0
            return len(set(a or []).intersection(set(b or [])))

        def followers_in_range(creator_followers, range_str):
            if not range_str or not creator_followers:
                return True
            range_str = range_str.lower()
            if "nano" in range_str:
                return creator_followers < 10000
            elif "micro" in range_str:
                return 10000 <= creator_followers < 100000
            elif "mid" in range_str:
                return 100000 <= creator_followers < 1000000
            elif "macro" in range_str or "mega" in range_str:
                return creator_followers >= 1000000
            return True

        scored = []
        campaign_niches = campaign.get("preferred_creator_niches", []) or []
        campaign_platforms = campaign.get("platforms", []) or []

        for creator in candidates:
            score = 0.0
            reasons = []

            # Niche match (30 points)
            creator_niches = [creator.get("primary_niche")] + (creator.get("secondary_niches") or [])
            niche_overlap = list_overlap(campaign_niches, creator_niches)
            if niche_overlap > 0:
                niche_score = min(30.0, niche_overlap * 15.0)
                score += niche_score
                reasons.append(f"Matches {niche_overlap} preferred niche(s)")

            # Platform match (25 points)
            creator_platforms = []
            if creator.get("youtube_handle"): creator_platforms.append("YouTube")
            if creator.get("instagram_handle"): creator_platforms.append("Instagram")
            if creator.get("tiktok_handle"): creator_platforms.append("TikTok")
            if creator.get("twitter_handle"): creator_platforms.append("Twitter")
            platform_overlap = list_overlap(campaign_platforms, creator_platforms)
            if platform_overlap > 0:
                platform_score = min(25.0, platform_overlap * 12.5)
                score += platform_score
                reasons.append(f"Active on {platform_overlap} required platform(s)")

            # Follower range (15 points)
            if followers_in_range(creator.get("total_followers", 0), campaign.get("preferred_creator_followers_range")):
                score += 15.0
                reasons.append("Follower count in desired range")

            # Engagement rate (15 points)
            engagement = creator.get("engagement_rate") or 0
            if engagement > 3.0:
                score += 15.0
                reasons.append("High engagement rate")
            elif engagement > 1.5:
                score += 8.0
                reasons.append("Good engagement rate")

            # Content type alignment (10 points)
            campaign_deliverables = campaign.get("deliverables", []) or []
            content_types_needed = [d.get("content_type") for d in campaign_deliverables if isinstance(d, dict)]
            creator_content_types = creator.get("content_types", []) or []
            content_overlap = list_overlap(content_types_needed, creator_content_types)
            if content_overlap > 0:
                score += min(10.0, content_overlap * 5.0)
                reasons.append("Content type alignment")

            # Experience (5 points)
            years_exp = creator.get("years_of_experience", 0) or 0
            if years_exp >= 3:
                score += 5.0
                reasons.append("Experienced creator")

            if score > 0:
                scored.append((creator, score, ", ".join(reasons) or "Potential match"))

        # Sort by score
        scored.sort(key=lambda x: x[1], reverse=True)

        # Take top candidates for AI ranking
        top_candidates = scored[:max(12, limit * 3)]

        # Use AI to refine ranking and generate better reasons
        if use_ai and settings.groq_api_key and top_candidates:
            try:
                groq_client = Groq(api_key=settings.groq_api_key)

                # Build prompt
                campaign_summary = f"""
Campaign: {campaign.get('title', 'N/A')}
Description: {campaign.get('description', campaign.get('short_description', 'N/A'))}
Platforms: {', '.join(campaign_platforms)}
Preferred Niches: {', '.join(campaign_niches)}
Budget: {campaign.get('budget_min', 0)} - {campaign.get('budget_max', 0)} INR
Follower Range: {campaign.get('preferred_creator_followers_range', 'Any')}
"""

                brand_summary = f"""
Brand: {brand_data.get('company_name', 'N/A')}
Industry: {brand_data.get('industry', 'N/A')}
Brand Values: {', '.join(brand_data.get('brand_values', []) or [])}
"""

                candidates_info = []
                for creator, score, reason in top_candidates:
                    candidates_info.append(f"""
Creator: {creator.get('display_name', 'N/A')}
ID: {creator.get('id')}
Niche: {creator.get('primary_niche', 'N/A')}
Followers: {creator.get('total_followers', 0)}
Engagement: {creator.get('engagement_rate', 0)}%
Platforms: {', '.join(creator_platforms)}
Bio: {creator.get('bio', 'N/A')[:200]}
Current Score: {score}
Current Reason: {reason}
""")

                prompt = f"""You are an expert at matching brands with content creators for marketing campaigns.

{campaign_summary}

{brand_summary}

CANDIDATE CREATORS:
{''.join(candidates_info)}

Analyze which creators are the BEST matches for this campaign. Consider:
1. Niche alignment with campaign requirements
2. Platform presence matching campaign needs
3. Audience fit with brand target audience
4. Content style compatibility
5. Engagement quality
6. Professionalism and experience

For each creator, provide:
- A refined match score (0-100)
- Detailed reasoning explaining why they fit (or don't fit) the campaign
- Specific strengths that make them a good match

Return JSON array with this structure:
[
  {{
    "id": "creator_id_here",
    "match_score": 85,
    "reasoning": "Detailed explanation of why this creator is a good match for the campaign"
  }},
  ...
]

Return ONLY the JSON array, no additional text."""

                completion = groq_client.chat.completions.create(
                    model="meta-llama/llama-4-scout-17b-16e-instruct",
                    messages=[
                        {"role": "system", "content": "Return only valid JSON array."},
                        {"role": "user", "content": prompt}
                    ],
                    temperature=0.5,
                    max_completion_tokens=2000,
                    top_p=1,
                    stream=False,
                )

                content = completion.choices[0].message.content if completion.choices else "[]"
                content = content.strip()
                if content.startswith("```json"):
                    content = content[7:]
                if content.startswith("```"):
                    content = content[3:]
                if content.endswith("```"):
                    content = content[:-3]
                content = content.strip()

                try:
                    ai_rankings = json.loads(content)
                    ai_map = {item.get("id"): (item.get("match_score", 0), item.get("reasoning", "")) for item in ai_rankings if item.get("id")}

                    # Update scores and reasons
                    refined = []
                    for creator, old_score, old_reason in top_candidates:
                        creator_id = creator.get("id")
                        if creator_id in ai_map:
                            new_score, new_reason = ai_map[creator_id]
                            refined.append((creator, float(new_score), new_reason or old_reason))
                        else:
                            refined.append((creator, old_score, old_reason))

                    scored = refined
                    scored.sort(key=lambda x: x[1], reverse=True)
                except Exception:
                    # If AI parsing fails, continue with rule-based scores
                    pass

            except Exception:
                # If AI fails, continue with rule-based ranking
                pass

        # Return top results
        results = []
        for creator, score, reason in scored[:limit]:
            platforms = []
            if creator.get("youtube_handle"): platforms.append("YouTube")
            if creator.get("instagram_handle"): platforms.append("Instagram")
            if creator.get("tiktok_handle"): platforms.append("TikTok")
            if creator.get("twitter_handle"): platforms.append("Twitter")

            results.append({
                "id": creator["id"],
                "display_name": creator.get("display_name", "Unknown"),
                "tagline": creator.get("tagline"),
                "bio": creator.get("bio"),
                "profile_picture_url": creator.get("profile_picture_url"),
                "primary_niche": creator.get("primary_niche"),
                "secondary_niches": creator.get("secondary_niches") or [],
                "total_followers": creator.get("total_followers", 0),
                "engagement_rate": creator.get("engagement_rate"),
                "top_platforms": platforms[:3],
                "match_score": round(score, 2),
                "match_reasoning": reason,
                # Include full creator data for expanded view
                "full_details": creator
            })

        return results

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error finding creators: {str(e)}"
        ) from e


@router.get("/campaigns/{campaign_id}/search-creator")
async def search_creator_by_id_or_name(
    campaign_id: str,
    query: str = Query(..., description="Creator ID (UUID) or display name"),
    brand: dict = Depends(get_current_brand)
):
    """
    Search for a creator by ID or name for sending proposals.
    Returns creator details if found.
    """
    supabase = supabase_anon
    brand_id = brand['id']

    try:
        # Verify campaign belongs to brand
        campaign_resp = supabase.table("campaigns") \
            .select("id") \
            .eq("id", campaign_id) \
            .eq("brand_id", brand_id) \
            .single() \
            .execute()

        if not campaign_resp.data:
            raise HTTPException(status_code=404, detail="Campaign not found")

        # Try to find creator by ID first (UUID format)
        creator = None
        search_query = query.strip()

        # Check if it looks like a UUID
        import re
        uuid_pattern = re.compile(
            r'^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$',
            re.IGNORECASE
        )

        if uuid_pattern.match(search_query):
            # Search by ID
            creator_resp = supabase.table("creators") \
                .select("*") \
                .eq("id", search_query) \
                .eq("is_active", True) \
                .single() \
                .execute()

            if creator_resp.data:
                creator = creator_resp.data

        # If not found by ID, search by name
        if not creator:
            # Search by display name (case-insensitive partial match)
            creators_resp = supabase.table("creators") \
                .select("*") \
                .eq("is_active", True) \
                .ilike("display_name", f"%{search_query}%") \
                .limit(10) \
                .execute()

            creators = creators_resp.data or []

            # Find exact match first, then partial matches
            exact_match = next(
                (c for c in creators if c.get("display_name", "").lower() == search_query.lower()),
                None
            )

            if exact_match:
                creator = exact_match
            elif creators:
                # Return first match if multiple found
                creator = creators[0]
                if len(creators) > 1:
                    # Return list of matches for user to choose
                    return {
                        "found": True,
                        "multiple_matches": True,
                        "creators": [
                            {
                                "id": c["id"],
                                "display_name": c.get("display_name", "Unknown"),
                                "tagline": c.get("tagline"),
                                "profile_picture_url": c.get("profile_picture_url"),
                                "primary_niche": c.get("primary_niche"),
                                "total_followers": c.get("total_followers", 0),
                                "engagement_rate": c.get("engagement_rate"),
                            }
                            for c in creators[:5]  # Limit to 5 matches
                        ]
                    }

        if not creator:
            raise HTTPException(
                status_code=404,
                detail=f"Creator not found with ID or name: {search_query}"
            )

        # Format response similar to find-creators endpoint
        platforms = []
        if creator.get("youtube_handle"): platforms.append("YouTube")
        if creator.get("instagram_handle"): platforms.append("Instagram")
        if creator.get("tiktok_handle"): platforms.append("TikTok")
        if creator.get("twitter_handle"): platforms.append("Twitter")

        return {
            "id": creator["id"],
            "display_name": creator.get("display_name", "Unknown"),
            "tagline": creator.get("tagline"),
            "bio": creator.get("bio"),
            "profile_picture_url": creator.get("profile_picture_url"),
            "primary_niche": creator.get("primary_niche"),
            "secondary_niches": creator.get("secondary_niches") or [],
            "total_followers": creator.get("total_followers", 0),
            "engagement_rate": creator.get("engagement_rate"),
            "top_platforms": platforms[:3],
            "full_details": creator,
            "found": True,
            "multiple_matches": False
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error searching creator: {str(e)}"
        ) from e


# ============================================================================
# CAMPAIGN WALL APPLICATION ROUTES (For Creators)
# ============================================================================

class CampaignApplicationCreate(BaseModel):
    """Schema for creating a campaign application."""
    payment_min: Optional[float] = None
    payment_max: Optional[float] = None
    timeline_days: Optional[int] = None
    timeline_weeks: Optional[int] = None
    description: str = Field(..., min_length=1)


class CampaignApplicationResponse(BaseModel):
    """Schema for campaign application response."""
    id: str
    campaign_id: str
    creator_id: str
    payment_min: Optional[float]
    payment_max: Optional[float]
    timeline_days: Optional[int]
    timeline_weeks: Optional[int]
    description: Optional[str]
    message: Optional[str]
    proposed_amount: Optional[float]
    status: str
    created_at: datetime
    updated_at: datetime
    creator_name: Optional[str] = None
    creator_profile_picture: Optional[str] = None
    campaign_title: Optional[str] = None


# ============================================================================
# CAMPAIGN WALL RECOMMENDATIONS (Moved here to keep all campaign wall routes together)
# ============================================================================

@router.get("/creators/campaign-wall/recommendations", response_model=List[CampaignResponse])
async def get_campaign_recommendations(
    creator: dict = Depends(get_current_creator),
    limit: int = Query(10, ge=1, le=20),
    use_ai: bool = Query(True, description="Use Gemini to recommend campaigns")
):
    """
    Get AI-recommended campaigns for the current creator based on their profile.
    """
    from app.core.config import settings
    import json

    supabase = supabase_anon
    creator_id = creator['id']

    try:
        # Fetch creator profile
        creator_resp = supabase.table("creators") \
            .select("*") \
            .eq("id", creator_id) \
            .eq("is_active", True) \
            .single() \
            .execute()

        if not creator_resp.data:
            raise HTTPException(status_code=404, detail="Creator profile not found")

        creator_data = creator_resp.data

        # Fetch all open campaigns
        campaigns_resp = supabase.table("campaigns") \
            .select("*") \
            .eq("is_open_for_applications", True) \
            .eq("is_on_campaign_wall", True) \
            .eq("status", "active") \
            .order("created_at", desc=True) \
            .limit(100) \
            .execute()

        campaigns = campaigns_resp.data or []

        if not campaigns:
            return []

        # Use AI to rank campaigns if enabled
        if use_ai and settings.gemini_api_key:
            try:
                import google.generativeai as genai
                genai.configure(api_key=settings.gemini_api_key)

                creator_summary = f"""
Creator Profile:
- Name: {creator_data.get('display_name', 'N/A')}
- Primary Niche: {creator_data.get('primary_niche', 'N/A')}
- Secondary Niches: {', '.join(creator_data.get('secondary_niches', []) or [])}
- Total Followers: {creator_data.get('total_followers', 0)}
- Engagement Rate: {creator_data.get('engagement_rate', 0)}%
- Bio: {creator_data.get('bio', 'N/A')[:300]}
- Platforms: {', '.join([p for p in ['YouTube', 'Instagram', 'TikTok', 'Twitter'] if creator_data.get(f'{p.lower()}_handle')])}
- Content Types: {', '.join(creator_data.get('content_types', []) or [])}
"""

                campaigns_info = []
                for idx, campaign in enumerate(campaigns[:50]):  # Limit to 50 for AI processing
                    campaigns_info.append(f"""
Campaign {idx + 1}:
- ID: {campaign.get('id')}
- Title: {campaign.get('title', 'N/A')}
- Description: {campaign.get('description', campaign.get('short_description', 'N/A'))[:200]}
- Platforms: {', '.join(campaign.get('platforms', []) or [])}
- Preferred Niches: {', '.join(campaign.get('preferred_creator_niches', []) or [])}
- Budget: {campaign.get('budget_min', 0)} - {campaign.get('budget_max', 0)} INR
- Follower Range: {campaign.get('preferred_creator_followers_range', 'Any')}
""")

                prompt = f"""You are an expert at matching content creators with marketing campaigns.

{creator_summary}

AVAILABLE CAMPAIGNS:
{''.join(campaigns_info)}

Analyze which campaigns are the BEST matches for this creator. Consider:
1. Niche alignment
2. Platform compatibility
3. Audience fit
4. Budget alignment
5. Content style match

Return a JSON array with campaign IDs ranked by match quality (best first):
[
  {{"id": "campaign_id_1", "match_score": 95, "reasoning": "Why this is a great match"}},
  {{"id": "campaign_id_2", "match_score": 88, "reasoning": "Why this is a good match"}},
  ...
]

Return ONLY the JSON array, no additional text."""

                model = genai.GenerativeModel('gemini-pro')
                response = model.generate_content(prompt)
                content = response.text.strip()

                # Clean JSON response
                if content.startswith("```json"):
                    content = content[7:]
                if content.startswith("```"):
                    content = content[3:]
                if content.endswith("```"):
                    content = content[:-3]
                content = content.strip()

                try:
                    ai_rankings = json.loads(content)
                    ai_map = {item.get("id"): (item.get("match_score", 0), item.get("reasoning", "")) for item in ai_rankings if item.get("id")}

                    # Sort campaigns by AI score
                    ranked_campaigns = []
                    for campaign in campaigns:
                        campaign_id = campaign.get("id")
                        if campaign_id in ai_map:
                            score, reasoning = ai_map[campaign_id]
                            ranked_campaigns.append((campaign, score, reasoning))

                    ranked_campaigns.sort(key=lambda x: x[1], reverse=True)
                    return [camp for camp, _, _ in ranked_campaigns[:limit]]

                except Exception:
                    # If AI parsing fails, return campaigns by date
                    pass

            except Exception:
                # If AI fails, continue with date-based ordering
                pass

        # Return campaigns ordered by creation date
        return campaigns[:limit]

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error getting campaign recommendations: {str(e)}"
        ) from e


@router.post("/campaigns/{campaign_id}/applications", response_model=CampaignApplicationResponse, status_code=201)
async def create_campaign_application(
    campaign_id: str,
    application: CampaignApplicationCreate,
    creator: dict = Depends(get_current_creator)
):
    """
    Create a new application for a campaign.
    """
    supabase = supabase_anon
    creator_id = creator['id']

    try:
        # Verify campaign exists and is open for applications
        campaign_resp = supabase.table("campaigns") \
            .select("*") \
            .eq("id", campaign_id) \
            .eq("is_open_for_applications", True) \
            .eq("is_on_campaign_wall", True) \
            .eq("status", "active") \
            .single() \
            .execute()

        if not campaign_resp.data:
            raise HTTPException(status_code=404, detail="Campaign not found or not open for applications")

        # Check if creator already applied
        existing = supabase.table("campaign_applications") \
            .select("id") \
            .eq("campaign_id", campaign_id) \
            .eq("creator_id", creator_id) \
            .execute()

        if existing.data:
            raise HTTPException(
                status_code=400,
                detail="You have already applied to this campaign"
            )

        # Get creator profile snapshot
        creator_resp = supabase.table("creators") \
            .select("*") \
            .eq("id", creator_id) \
            .single() \
            .execute()

        creator_profile = creator_resp.data if creator_resp.data else {}

        # Create application
        application_data = {
            "campaign_id": campaign_id,
            "creator_id": creator_id,
            "payment_min": application.payment_min,
            "payment_max": application.payment_max,
            "timeline_days": application.timeline_days,
            "timeline_weeks": application.timeline_weeks,
            "description": application.description,
            "message": application.description,  # Use description as message
            "proposed_amount": application.payment_max or application.payment_min,
            "profile_snapshot": creator_profile,
            "status": "applied"
        }

        response = supabase.table("campaign_applications").insert(application_data).execute()

        if not response.data:
            raise HTTPException(status_code=500, detail="Failed to create application")

        # Fetch with creator and campaign info
        app = response.data[0]
        app["creator_name"] = creator_profile.get("display_name")
        app["creator_profile_picture"] = creator_profile.get("profile_picture_url")
        app["campaign_title"] = campaign_resp.data.get("title")

        return app

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error creating application: {str(e)}"
        ) from e


@router.get("/campaigns/{campaign_id}/applications", response_model=List[CampaignApplicationResponse])
async def get_campaign_applications(
    campaign_id: str,
    brand: dict = Depends(get_current_brand),
    status: Optional[str] = Query(None, description="Filter by application status")
):
    """
    Get all applications for a campaign. Only the brand owner can view applications.
    """
    supabase = supabase_anon
    brand_id = brand['id']

    try:
        # Verify campaign belongs to brand
        campaign_resp = supabase.table("campaigns") \
            .select("id, title") \
            .eq("id", campaign_id) \
            .eq("brand_id", brand_id) \
            .single() \
            .execute()

        if not campaign_resp.data:
            raise HTTPException(status_code=404, detail="Campaign not found")

        # Build query
        query = supabase.table("campaign_applications") \
            .select("*, creators!campaign_applications_creator_id_fkey(display_name, profile_picture_url)") \
            .eq("campaign_id", campaign_id) \
            .order("created_at", desc=True)

        if status:
            query = query.eq("status", status)

        response = query.execute()

        applications = response.data or []

        # Format response
        formatted = []
        for app in applications:
            creator_info = app.get("creators", {}) if isinstance(app.get("creators"), dict) else {}
            formatted.append({
                "id": app["id"],
                "campaign_id": app["campaign_id"],
                "creator_id": app["creator_id"],
                "payment_min": app.get("payment_min"),
                "payment_max": app.get("payment_max"),
                "timeline_days": app.get("timeline_days"),
                "timeline_weeks": app.get("timeline_weeks"),
                "description": app.get("description"),
                "message": app.get("message"),
                "proposed_amount": app.get("proposed_amount"),
                "status": app.get("status", "applied"),
                "created_at": app["created_at"],
                "updated_at": app["updated_at"],
                "creator_name": creator_info.get("display_name") if creator_info else None,
                "creator_profile_picture": creator_info.get("profile_picture_url") if creator_info else None,
                "campaign_title": campaign_resp.data.get("title")
            })

        return formatted

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error fetching applications: {str(e)}"
        ) from e


@router.put("/campaigns/{campaign_id}/applications/{application_id}/status")
async def update_application_status(
    campaign_id: str,
    application_id: str,
    new_status: str = Query(..., description="New status: 'reviewing', 'accepted', 'rejected'"),
    brand: dict = Depends(get_current_brand)
):
    """
    Update the status of a campaign application. Only the brand owner can update.
    """
    supabase = supabase_anon
    brand_id = brand['id']

    try:
        # Verify campaign belongs to brand
        campaign_resp = supabase.table("campaigns") \
            .select("id") \
            .eq("id", campaign_id) \
            .eq("brand_id", brand_id) \
            .single() \
            .execute()

        if not campaign_resp.data:
            raise HTTPException(status_code=404, detail="Campaign not found")

        # Verify application exists and belongs to campaign
        app_resp = supabase.table("campaign_applications") \
            .select("id, campaign_id, creator_id, status") \
            .eq("id", application_id) \
            .eq("campaign_id", campaign_id) \
            .single() \
            .execute()

        if not app_resp.data:
            raise HTTPException(status_code=404, detail="Application not found")

        # Validate status
        # The enum should have: 'applied', 'reviewing', 'accepted', 'rejected'
        valid_statuses = ["reviewing", "accepted", "rejected"]
        if new_status not in valid_statuses:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid status. Must be one of: {', '.join(valid_statuses)}"
            )

        # Update status
        update_data = {
            "status": new_status,
            "updated_at": datetime.now(timezone.utc).isoformat()
        }

        # Update the application
        update_response = supabase.table("campaign_applications") \
            .update(update_data) \
            .eq("id", application_id) \
            .execute()

        if not update_response.data:
            raise HTTPException(status_code=500, detail="Failed to update application status")

        # Fetch the updated application with only necessary fields to avoid JSON serialization issues
        # Use a simple select without profile_snapshot or attachments
        try:
            response = supabase.table("campaign_applications") \
                .select("id, campaign_id, creator_id, payment_min, payment_max, timeline_days, timeline_weeks, description, message, proposed_amount, status, created_at, updated_at") \
                .eq("id", application_id) \
                .single() \
                .execute()
        except Exception as e:
            # If select fails, try to get minimal data
            response = supabase.table("campaign_applications") \
                .select("id, campaign_id, creator_id, status, created_at, updated_at") \
                .eq("id", application_id) \
                .single() \
                .execute()

        if not response.data:
            raise HTTPException(status_code=500, detail="Failed to fetch updated application")

        # Fetch creator info separately
        creator_resp = supabase.table("creators") \
            .select("display_name, profile_picture_url") \
            .eq("id", response.data["creator_id"]) \
            .single() \
            .execute()

        creator_info = creator_resp.data if creator_resp.data else {}
        campaign_title_resp = supabase.table("campaigns") \
            .select("title") \
            .eq("id", campaign_id) \
            .single() \
            .execute()

        # Build result manually to ensure clean JSON
        result = {
            "id": response.data.get("id"),
            "campaign_id": response.data.get("campaign_id"),
            "creator_id": response.data.get("creator_id"),
            "payment_min": response.data.get("payment_min"),
            "payment_max": response.data.get("payment_max"),
            "timeline_days": response.data.get("timeline_days"),
            "timeline_weeks": response.data.get("timeline_weeks"),
            "description": response.data.get("description"),
            "message": response.data.get("message"),
            "proposed_amount": response.data.get("proposed_amount"),
            "status": response.data.get("status"),
            "created_at": response.data.get("created_at"),
            "updated_at": response.data.get("updated_at"),
            "creator_name": creator_info.get("display_name"),
            "creator_profile_picture": creator_info.get("profile_picture_url"),
            "campaign_title": campaign_title_resp.data.get("title") if campaign_title_resp.data else None
        }

        return result

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error updating application status: {str(e)}"
        ) from e


@router.post("/campaigns/{campaign_id}/applications/{application_id}/create-proposal")
async def create_proposal_from_application(
    campaign_id: str,
    application_id: str,
    brand: dict = Depends(get_current_brand)
):
    """
    Create a proposal from an accepted application. This creates a proposal with status 'pending' for negotiation.
    """
    supabase = supabase_anon
    brand_id = brand['id']

    try:
        # Verify campaign belongs to brand
        campaign_resp = supabase.table("campaigns") \
            .select("*") \
            .eq("id", campaign_id) \
            .eq("brand_id", brand_id) \
            .single() \
            .execute()

        if not campaign_resp.data:
            raise HTTPException(status_code=404, detail="Campaign not found")

        # Verify application exists, belongs to campaign, and is accepted
        app_resp = supabase.table("campaign_applications") \
            .select("*") \
            .eq("id", application_id) \
            .eq("campaign_id", campaign_id) \
            .eq("status", "accepted") \
            .single() \
            .execute()

        if not app_resp.data:
            raise HTTPException(
                status_code=404,
                detail="Application not found or not accepted"
            )

        application = app_resp.data
        creator_id = application["creator_id"]

        # Check if proposal already exists
        existing_proposal = supabase.table("proposals") \
            .select("id") \
            .eq("campaign_id", campaign_id) \
            .eq("creator_id", creator_id) \
            .eq("brand_id", brand_id) \
            .execute()

        if existing_proposal.data:
            raise HTTPException(
                status_code=400,
                detail="A proposal already exists for this application"
            )

        # Create proposal from application
        proposal_data = {
            "campaign_id": campaign_id,
            "creator_id": creator_id,
            "brand_id": brand_id,
            "subject": f"Proposal for {campaign_resp.data.get('title', 'Campaign')}",
            "message": application.get("description", ""),
            "proposed_amount": application.get("payment_max") or application.get("payment_min"),
            "content_ideas": [],
            "status": "pending"
        }

        proposal_response = supabase.table("proposals").insert(proposal_data).execute()

        if not proposal_response.data:
            raise HTTPException(status_code=500, detail="Failed to create proposal")

        return {
            "proposal": proposal_response.data[0],
            "application_id": application_id,
            "message": "Proposal created successfully. You can now negotiate with the creator."
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error creating proposal from application: {str(e)}"
        ) from e


@router.get("/creators/applications", response_model=List[CampaignApplicationResponse])
async def get_creator_applications(
    creator: dict = Depends(get_current_creator),
    status: Optional[str] = Query(None, description="Filter by application status")
):
    """
    Get all applications submitted by the current creator.
    """
    supabase = supabase_anon
    creator_id = creator['id']

    try:
        query = supabase.table("campaign_applications") \
            .select("*, campaigns!campaign_applications_campaign_id_fkey(id, title, brand_id, brands!campaigns_brand_id_fkey(company_name))") \
            .eq("creator_id", creator_id) \
            .order("created_at", desc=True)

        if status:
            query = query.eq("status", status)

        response = query.execute()

        applications = response.data or []

        # Format response
        formatted = []
        for app in applications:
            campaign_info = app.get("campaigns", {}) if isinstance(app.get("campaigns"), dict) else {}
            brand_info = campaign_info.get("brands", {}) if isinstance(campaign_info.get("brands"), dict) else {}
            formatted.append({
                "id": app["id"],
                "campaign_id": app["campaign_id"],
                "creator_id": app["creator_id"],
                "payment_min": app.get("payment_min"),
                "payment_max": app.get("payment_max"),
                "timeline_days": app.get("timeline_days"),
                "timeline_weeks": app.get("timeline_weeks"),
                "description": app.get("description"),
                "message": app.get("message"),
                "proposed_amount": app.get("proposed_amount"),
                "status": app.get("status", "applied"),
                "created_at": app["created_at"],
                "updated_at": app["updated_at"],
                "creator_name": None,  # Not needed for creator's own applications
                "creator_profile_picture": None,
                "campaign_title": campaign_info.get("title") if campaign_info else None
            })

        return formatted

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error fetching creator applications: {str(e)}"
        ) from e
