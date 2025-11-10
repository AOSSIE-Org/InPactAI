"""
Creators listing routes for browsing all creators.
"""

from fastapi import APIRouter, HTTPException, Depends, Query
from pydantic import BaseModel
from typing import Optional, List, Tuple
from math import exp
from datetime import datetime
from groq import Groq
from app.core.config import settings
from app.core.supabase_clients import supabase_anon
from app.core.dependencies import get_current_creator

router = APIRouter()


class CreatorBasicResponse(BaseModel):
    """Basic creator info for card display."""
    id: str
    display_name: str
    tagline: Optional[str]
    bio: Optional[str]
    profile_picture_url: Optional[str]
    primary_niche: str
    secondary_niches: Optional[List[str]]
    total_followers: int
    engagement_rate: Optional[float]
    is_verified_creator: bool
    profile_completion_percentage: int


class CreatorFullResponse(BaseModel):
    """Full creator details for expanded view."""
    id: str
    user_id: str
    display_name: str
    tagline: Optional[str]
    bio: Optional[str]
    profile_picture_url: Optional[str]
    cover_image_url: Optional[str]
    website_url: Optional[str]
    youtube_url: Optional[str]
    youtube_handle: Optional[str]
    youtube_subscribers: Optional[int]
    instagram_url: Optional[str]
    instagram_handle: Optional[str]
    instagram_followers: Optional[int]
    tiktok_url: Optional[str]
    tiktok_handle: Optional[str]
    tiktok_followers: Optional[int]
    twitter_url: Optional[str]
    twitter_handle: Optional[str]
    twitter_followers: Optional[int]
    twitch_url: Optional[str]
    twitch_handle: Optional[str]
    twitch_followers: Optional[int]
    linkedin_url: Optional[str]
    facebook_url: Optional[str]
    primary_niche: str
    secondary_niches: Optional[List[str]]
    content_types: Optional[List[str]]
    content_language: Optional[List[str]]
    total_followers: int
    total_reach: Optional[int]
    average_views: Optional[int]
    engagement_rate: Optional[float]
    audience_age_primary: Optional[str]
    audience_gender_split: Optional[dict]
    audience_locations: Optional[dict]
    audience_interests: Optional[List[str]]
    average_engagement_per_post: Optional[int]
    posting_frequency: Optional[str]
    best_performing_content_type: Optional[str]
    years_of_experience: Optional[int]
    content_creation_full_time: bool
    team_size: int
    equipment_quality: Optional[str]
    editing_software: Optional[List[str]]
    collaboration_types: Optional[List[str]]
    preferred_brands_style: Optional[List[str]]
    rate_per_post: Optional[float]
    rate_per_video: Optional[float]
    rate_per_story: Optional[float]
    rate_per_reel: Optional[float]
    rate_negotiable: bool
    accepts_product_only_deals: bool
    minimum_deal_value: Optional[float]
    preferred_payment_terms: Optional[str]
    portfolio_links: Optional[List[str]]
    past_brand_collaborations: Optional[List[str]]
    case_study_links: Optional[List[str]]
    media_kit_url: Optional[str]
    is_verified_creator: bool
    profile_completion_percentage: int
    created_at: Optional[str]
    last_active_at: Optional[str]


@router.get("/creators", response_model=List[CreatorBasicResponse])
async def list_creators(
    creator: dict = Depends(get_current_creator),
    search: Optional[str] = Query(None, description="Search by name, niche, or bio"),
    niche: Optional[str] = Query(None, description="Filter by primary niche"),
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0)
):
    """
    List all creators (excluding the current authenticated creator).

    - **search**: Search in display_name, tagline, bio, primary_niche, secondary_niches
    - **niche**: Filter by primary niche
    - **limit**: Maximum number of results (default: 50, max: 100)
    - **offset**: Number of results to skip for pagination
    """
    supabase = supabase_anon
    current_creator_id = creator['id']

    try:
        # Build query - exclude current creator and only show active creators
        query = supabase.table("creators").select("*").eq("is_active", True).neq("id", current_creator_id)

        # Apply niche filter if provided
        if niche:
            query = query.eq("primary_niche", niche)

        # Apply pagination and ordering
        # Note: We fetch more results if search is provided, then filter in Python
        fetch_limit = (limit * 3) if search else limit  # Fetch more for search filtering
        query = query.order("total_followers", desc=True).range(offset, offset + fetch_limit - 1)

        response = query.execute()

        creators = response.data if response.data else []

        # Apply search filtering if provided
        if search:
            search_term = search.lower()
            filtered_creators = []
            for c in creators:
                # Check if search term matches any field
                matches = (
                    (c.get("display_name", "").lower().find(search_term) >= 0) or
                    (c.get("tagline", "").lower().find(search_term) >= 0 if c.get("tagline") else False) or
                    (c.get("bio", "").lower().find(search_term) >= 0 if c.get("bio") else False) or
                    (c.get("primary_niche", "").lower().find(search_term) >= 0) or
                    any(search_term in (niche or "").lower() for niche in (c.get("secondary_niches") or []))
                )
                if matches:
                    filtered_creators.append(c)
            # Apply limit after filtering
            creators = filtered_creators[:limit]

        return creators

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error fetching creators: {str(e)}"
        ) from e


class CreatorRecommendation(BaseModel):
    id: str
    display_name: str
    profile_picture_url: Optional[str]
    primary_niche: Optional[str]
    total_followers: Optional[int]
    engagement_rate: Optional[float]
    top_platforms: Optional[List[str]] = None
    match_score: float
    reason: str


@router.get("/creators/recommendations", response_model=List[CreatorRecommendation])
async def get_creator_recommendations(
    creator: dict = Depends(get_current_creator),
    limit: int = Query(4, ge=1, le=10),
    use_ai: bool = Query(True, description="Use Groq to rerank top candidates")
):
    """
    Recommend top creators to collaborate with the current creator.
    Combines rules-based scoring with optional Groq reranking for reasons and fine-tuning.
    """
    supabase = supabase_anon
    current_creator_id = creator["id"]

    try:
        # Fetch current creator full profile
        current_resp = supabase.table("creators") \
            .select("*") \
            .eq("id", current_creator_id) \
            .single() \
            .execute()
        if not current_resp.data:
            raise HTTPException(status_code=404, detail="Current creator not found")
        me = current_resp.data

        # Fetch candidate creators (active, not self)
        candidates_resp = supabase.table("creators") \
            .select("*") \
            .eq("is_active", True) \
            .neq("id", current_creator_id) \
            .order("total_followers", desc=True) \
            .limit(200) \
            .execute()
        candidates = candidates_resp.data or []

        if not candidates:
            return []

        # Utility helpers
        def list_overlap(a: Optional[List[str]], b: Optional[List[str]]) -> int:
            sa = set((a or []))
            sb = set((b or []))
            return len(sa.intersection(sb))

        def followers_proximity(a: Optional[int], b: Optional[int]) -> float:
            if not a or not b or a <= 0 or b <= 0:
                return 0.5
            ratio = max(a, b) / max(1, min(a, b))
            # Sigmoid-like decay with ratio; closer to 1 → closer to 1.0 score
            return max(0.0, min(1.0, 1 / (1 + (ratio - 1))))

        def normalize_percent(x: Optional[float]) -> float:
            if x is None:
                return 0.0
            return max(0.0, min(1.0, x / 10.0))  # treat 10% as "good" baseline

        def recency_score(last_active_at: Optional[str]) -> float:
            if not last_active_at:
                return 0.5
            try:
                dt = datetime.fromisoformat(last_active_at.replace("Z", "+00:00"))
                days = max(0.0, (datetime.now(dt.tzinfo) - dt).days)
                # Decay after 30 days
                return max(0.0, min(1.0, 1 / (1 + days / 30.0)))
            except Exception:
                return 0.5

        me_niche = me.get("primary_niche")
        me_secondary = me.get("secondary_niches") or []
        me_types = me.get("content_types") or []
        me_collab = me.get("collaboration_types") or []
        me_langs = me.get("content_language") or []
        me_followers = me.get("total_followers") or 0

        # Score candidates
        scored: List[Tuple[dict, float, str]] = []
        for c in candidates:
            reason_bits = []
            score = 0.0

            # Niche similarity (25)
            niche_pts = 0.0
            if c.get("primary_niche") == me_niche:
                niche_pts += 0.7
                reason_bits.append("same primary niche")
            sec_overlap = list_overlap(me_secondary, c.get("secondary_niches"))
            if sec_overlap > 0:
                niche_pts += min(0.3, 0.15 * sec_overlap)
                reason_bits.append("overlap in secondary niches")
            score += niche_pts * 25

            # Content types (15)
            type_overlap = list_overlap(me_types, c.get("content_types"))
            if type_overlap > 0:
                score += min(1.0, type_overlap / 3.0) * 15
                reason_bits.append("compatible content types")

            # Openness alignment (10)
            collab_overlap = list_overlap(me_collab, c.get("collaboration_types"))
            if collab_overlap > 0:
                score += min(1.0, collab_overlap / 2.0) * 10
                reason_bits.append("open to similar collaboration types")

            # Audience proximity (15)
            prox = followers_proximity(me_followers, c.get("total_followers"))
            score += prox * 15
            if prox > 0.7:
                reason_bits.append("similar audience scale")

            # Engagement quality (15)
            eng = normalize_percent(c.get("engagement_rate"))
            score += eng * 10
            avg_views = c.get("average_views") or 0
            # Normalize avg_views relative to total_followers if available
            if c.get("total_followers"):
                view_ratio = min(1.0, (avg_views / max(1, c["total_followers"])) * 5)
                score += view_ratio * 5
            if eng > 0.6:
                reason_bits.append("strong engagement")

            # Recency/consistency (8)
            score += recency_score(c.get("last_active_at")) * 8

            # Experience/professionalism (6)
            exp = c.get("years_of_experience") or 0
            exp_norm = min(1.0, exp / 5.0)
            has_kit = 1.0 if c.get("media_kit_url") else 0.0
            score += (0.7 * exp_norm + 0.3 * has_kit) * 6

            # Geo/language fit (6)
            lang_overlap = list_overlap(me_langs, c.get("content_language"))
            score += min(1.0, lang_overlap / 2.0) * 6
            if lang_overlap > 0:
                reason_bits.append("language fit")

            reason = ", ".join(reason_bits) or "high potential match"
            scored.append((c, score, reason))

        # Sort by score
        scored.sort(key=lambda x: x[1], reverse=True)

        # Diversity: limit to 2 per niche in the top picks
        picks: List[Tuple[dict, float, str]] = []
        niche_counts = {}
        for c, s, r in scored:
            niche = c.get("primary_niche") or "other"
            if niche_counts.get(niche, 0) >= 2 and len(picks) >= 2:
                continue
            picks.append((c, s, r))
            niche_counts[niche] = niche_counts.get(niche, 0) + 1
            if len(picks) >= max(12, limit * 3):
                break

        # Optional Groq reranking to refine reasons and ordering
        if use_ai and settings.groq_api_key:
            try:
                groq = Groq(api_key=settings.groq_api_key)
                def compact_profile(p: dict) -> dict:
                    return {
                        "id": p.get("id"),
                        "name": p.get("display_name"),
                        "primary_niche": p.get("primary_niche"),
                        "secondary_niches": p.get("secondary_niches") or [],
                        "content_types": p.get("content_types") or [],
                        "collaboration_types": p.get("collaboration_types") or [],
                        "total_followers": p.get("total_followers") or 0,
                        "engagement_rate": p.get("engagement_rate") or 0,
                        "average_views": p.get("average_views") or 0,
                        "languages": p.get("content_language") or [],
                    }
                payload = {
                    "me": compact_profile(me),
                    "candidates": [
                        {
                            "candidate": compact_profile(c),
                            "rule_score": s,
                            "rule_reason": r
                        } for c, s, r in picks
                    ]
                }
                prompt = (
                    "You are ranking creators for collaboration potential. "
                    "Rerank candidates considering niche fit, content compatibility, audience synergy, "
                    "and complementary strengths. Return JSON array of top items with fields: "
                    "[{id, reason, adjustment (number between -10 and +10)}]. "
                    "Keep reasons concise and actionable. Only return JSON."
                    f"\nINPUT JSON:\n{payload}"
                )
                completion = groq.chat.completions.create(
                    model="meta-llama/llama-4-scout-17b-16e-instruct",
                    messages=[
                        {"role": "system", "content": "Return only JSON."},
                        {"role": "user", "content": prompt},
                    ],
                    temperature=0.5,
                    max_completion_tokens=800,
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
                ai_items = []
                try:
                    ai_items = json.loads(content)
                except Exception:
                    ai_items = []

                # Build map from id to adjustment and reason
                adj = {item.get("id"): (float(item.get("adjustment", 0)), item.get("reason", "")) for item in ai_items if item.get("id")}
                new_list = []
                for c, s, r in picks:
                    cid = c.get("id")
                    if cid in adj:
                        add, rr = adj[cid]
                        new_list.append((c, s + add, rr or r))
                    else:
                        new_list.append((c, s, r))
                picks = new_list
                picks.sort(key=lambda x: x[1], reverse=True)
            except Exception:
                # If AI rerank fails, continue with rules-based ranking
                pass

        # Finalize top 'limit'
        final = picks[:limit]
        results: List[CreatorRecommendation] = []
        for c, s, r in final:
            platforms = []
            if c.get("youtube_handle"): platforms.append("YouTube")
            if c.get("instagram_handle"): platforms.append("Instagram")
            if c.get("tiktok_handle"): platforms.append("TikTok")
            if c.get("twitter_handle"): platforms.append("Twitter")
            results.append(CreatorRecommendation(
                id=c["id"],
                display_name=c.get("display_name", "Unknown"),
                profile_picture_url=c.get("profile_picture_url"),
                primary_niche=c.get("primary_niche"),
                total_followers=c.get("total_followers"),
                engagement_rate=c.get("engagement_rate"),
                top_platforms=platforms[:3] or None,
                match_score=round(s, 2),
                reason=r
            ))
        return results

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error generating recommendations: {str(e)}"
        ) from e


@router.get("/creators/{creator_id}", response_model=CreatorFullResponse)
async def get_creator_details(
    creator_id: str,
    creator: dict = Depends(get_current_creator)
):
    """
    Get full details of a specific creator.

    - **creator_id**: The creator ID
    """
    supabase = supabase_anon

    try:
        # Fetch creator details
        response = supabase.table("creators") \
            .select("*") \
            .eq("id", creator_id) \
            .eq("is_active", True) \
            .single() \
            .execute()

        if not response.data:
            raise HTTPException(
                status_code=404,
                detail="Creator not found"
            )

        return response.data

    except HTTPException:
        raise
    except Exception as e:
        if "PGRST116" in str(e):  # No rows returned
            raise HTTPException(
                status_code=404,
                detail="Creator not found"
            ) from e
        raise HTTPException(
            status_code=500,
            detail=f"Error fetching creator: {str(e)}"
        ) from e


@router.get("/creators/niches/list")
async def list_niches(
    creator: dict = Depends(get_current_creator)
):
    """
    Get list of all unique primary niches for filtering.
    """
    supabase = supabase_anon

    try:
        # Get all unique primary niches
        response = supabase.table("creators") \
            .select("primary_niche") \
            .eq("is_active", True) \
            .execute()

        creators = response.data if response.data else []

        # Extract unique niches
        niches = sorted(set(c.get("primary_niche") for c in creators if c.get("primary_niche")))

        return {"niches": niches}

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error fetching niches: {str(e)}"
        ) from e

