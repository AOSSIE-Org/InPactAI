"""
Profile management routes for brands and creators
"""

import httpx
import json
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional, Dict, Any
from app.core.supabase_clients import supabase_anon
from app.core.dependencies import get_current_user, get_current_brand, get_current_creator
from app.core.config import settings

router = APIRouter()
GEMINI_API_KEY = settings.gemini_api_key
GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent"


class ProfileUpdateRequest(BaseModel):
    """Generic profile update request - accepts any fields"""
    data: Dict[str, Any]


def calculate_brand_completion_percentage(brand: dict) -> int:
    """Calculate profile completion percentage for a brand"""
    required_fields = [
        'company_name', 'industry', 'website_url', 'company_description',
        'company_logo_url', 'contact_email', 'contact_phone'
    ]

    important_fields = [
        'company_tagline', 'headquarters_location', 'company_size',
        'target_audience_description', 'brand_values', 'brand_personality',
        'marketing_goals', 'preferred_platforms', 'monthly_marketing_budget'
    ]

    nice_to_have_fields = [
        'company_cover_image_url', 'social_media_links', 'founded_year',
        'brand_voice', 'campaign_types_interested', 'preferred_content_types'
    ]

    completed = 0
    total = len(required_fields) + len(important_fields) + len(nice_to_have_fields)

    # Required fields (weight: 3x)
    for field in required_fields:
        if brand.get(field):
            completed += 3

    # Important fields (weight: 2x)
    for field in important_fields:
        if brand.get(field):
            completed += 2

    # Nice to have fields (weight: 1x)
    for field in nice_to_have_fields:
        if brand.get(field):
            completed += 1

    # Calculate percentage
    max_score = len(required_fields) * 3 + len(important_fields) * 2 + len(nice_to_have_fields)
    percentage = int((completed / max_score) * 100) if max_score > 0 else 0
    return min(100, max(0, percentage))


def calculate_creator_completion_percentage(creator: dict) -> int:
    """Calculate profile completion percentage for a creator"""
    required_fields = [
        'display_name', 'primary_niche', 'profile_picture_url', 'bio'
    ]

    important_fields = [
        'tagline', 'website_url', 'instagram_handle', 'youtube_handle',
        'content_types', 'collaboration_types', 'rate_per_post',
        'years_of_experience', 'posting_frequency'
    ]

    nice_to_have_fields = [
        'cover_image_url', 'secondary_niches', 'content_language',
        'portfolio_links', 'media_kit_url', 'equipment_quality',
        'editing_software', 'preferred_payment_terms'
    ]

    completed = 0
    total = len(required_fields) + len(important_fields) + len(nice_to_have_fields)

    # Required fields (weight: 3x)
    for field in required_fields:
        if creator.get(field):
            completed += 3

    # Important fields (weight: 2x)
    for field in important_fields:
        if creator.get(field):
            completed += 2

    # Nice to have fields (weight: 1x)
    for field in nice_to_have_fields:
        if creator.get(field):
            completed += 1

    # Calculate percentage
    max_score = len(required_fields) * 3 + len(important_fields) * 2 + len(nice_to_have_fields)
    percentage = int((completed / max_score) * 100) if max_score > 0 else 0
    return min(100, max(0, percentage))


@router.get("/brand/profile")
async def get_brand_profile(
    brand: dict = Depends(get_current_brand)
):
    """Get the current brand's profile"""
    try:
        # Calculate completion percentage
        completion = calculate_brand_completion_percentage(brand)

        # Update completion percentage in database if different
        if brand.get('profile_completion_percentage') != completion:
            supabase_anon.table('brands') \
                .update({'profile_completion_percentage': completion}) \
                .eq('id', brand['id']) \
                .execute()
            brand['profile_completion_percentage'] = completion

        return brand
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error fetching brand profile: {str(e)}"
        ) from e


@router.put("/brand/profile")
async def update_brand_profile(
    update_request: ProfileUpdateRequest,
    brand: dict = Depends(get_current_brand)
):
    """Update the current brand's profile"""
    try:
        update_data = update_request.data

        # Remove fields that shouldn't be updated directly
        restricted_fields = ['id', 'user_id', 'created_at', 'is_active']
        for field in restricted_fields:
            update_data.pop(field, None)

        # Add updated_at timestamp
        from datetime import datetime
        update_data['updated_at'] = datetime.utcnow().isoformat()

        # Update in database
        response = supabase_anon.table('brands') \
            .update(update_data) \
            .eq('id', brand['id']) \
            .execute()

        if not response.data:
            raise HTTPException(
                status_code=404,
                detail="Brand profile not found"
            )

        updated_brand = response.data[0] if response.data else brand

        # Recalculate completion percentage
        completion = calculate_brand_completion_percentage(updated_brand)

        # Update completion percentage
        if updated_brand.get('profile_completion_percentage') != completion:
            supabase_anon.table('brands') \
                .update({'profile_completion_percentage': completion}) \
                .eq('id', brand['id']) \
                .execute()
            updated_brand['profile_completion_percentage'] = completion

        return updated_brand
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error updating brand profile: {str(e)}"
        ) from e


@router.get("/creator/profile")
async def get_creator_profile(
    creator: dict = Depends(get_current_creator)
):
    """Get the current creator's profile"""
    try:
        # Calculate completion percentage
        completion = calculate_creator_completion_percentage(creator)

        # Update completion percentage in database if different
        if creator.get('profile_completion_percentage') != completion:
            supabase_anon.table('creators') \
                .update({'profile_completion_percentage': completion}) \
                .eq('id', creator['id']) \
                .execute()
            creator['profile_completion_percentage'] = completion

        return creator
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error fetching creator profile: {str(e)}"
        ) from e


@router.put("/creator/profile")
async def update_creator_profile(
    update_request: ProfileUpdateRequest,
    creator: dict = Depends(get_current_creator)
):
    """Update the current creator's profile"""
    try:
        update_data = update_request.data

        # Remove fields that shouldn't be updated directly
        restricted_fields = ['id', 'user_id', 'created_at', 'is_active']
        for field in restricted_fields:
            update_data.pop(field, None)

        # Add updated_at timestamp
        from datetime import datetime
        update_data['updated_at'] = datetime.utcnow().isoformat()

        # Update in database
        response = supabase_anon.table('creators') \
            .update(update_data) \
            .eq('id', creator['id']) \
            .execute()

        if not response.data:
            raise HTTPException(
                status_code=404,
                detail="Creator profile not found"
            )

        updated_creator = response.data[0] if response.data else creator

        # Recalculate completion percentage
        completion = calculate_creator_completion_percentage(updated_creator)

        # Update completion percentage
        if updated_creator.get('profile_completion_percentage') != completion:
            supabase_anon.table('creators') \
                .update({'profile_completion_percentage': completion}) \
                .eq('id', creator['id']) \
                .execute()
            updated_creator['profile_completion_percentage'] = completion

        return updated_creator
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error updating creator profile: {str(e)}"
        ) from e


class AIFillRequest(BaseModel):
    """Request for AI profile filling"""
    user_input: str
    context: Optional[Dict[str, Any]] = None


@router.post("/brand/profile/ai-fill")
async def ai_fill_brand_profile(
    request: AIFillRequest,
    brand: dict = Depends(get_current_brand)
):
    """Use AI to fill brand profile based on user input"""
    if not GEMINI_API_KEY:
        raise HTTPException(
            status_code=500,
            detail="Gemini API is not configured"
        )

    try:
        # Build prompt for Gemini
        prompt = f"""You are an expert at extracting structured data from natural language. Your task is to analyze user input and extract ALL relevant brand profile information.

Current brand profile (for context - only fill fields that are empty or null):
{json.dumps(brand, indent=2, default=str)}

User provided information:
{request.user_input}

Extract and return a JSON object with ALL fields that can be confidently determined from the user input. Use these exact field names and data types:

STRING fields:
- company_name, company_tagline, company_description, company_logo_url, company_cover_image_url
- industry, company_size, headquarters_location, company_type, website_url
- contact_email, contact_phone, campaign_frequency, payment_terms
- target_audience_description, brand_voice, product_price_range, product_catalog_url

NUMBER fields (use numbers, not strings):
- founded_year (integer), monthly_marketing_budget (numeric), influencer_budget_percentage (float 0-100)
- budget_per_campaign_min (numeric), budget_per_campaign_max (numeric), typical_deal_size (numeric)
- affiliate_commission_rate (float 0-100), minimum_followers_required (integer)
- minimum_engagement_rate (float 0-100), exclusivity_duration_months (integer)
- past_campaigns_count (integer), average_campaign_roi (float)
- total_deals_posted (integer), total_deals_completed (integer), total_spent (numeric)
- average_deal_rating (float), matching_score_base (float)

BOOLEAN fields (use true/false):
- offers_product_only_deals, offers_affiliate_programs, exclusivity_required
- seasonal_products, business_verified, payment_verified, tax_id_verified
- is_active, is_featured, is_verified_brand

ARRAY fields (use JSON arrays of strings):
- sub_industry, target_audience_age_groups, target_audience_gender, target_audience_locations
- target_audience_interests, target_audience_income_level, brand_values, brand_personality
- marketing_goals, campaign_types_interested, preferred_content_types, preferred_platforms
- preferred_creator_niches, preferred_creator_size, preferred_creator_locations
- content_dos, content_donts, brand_safety_requirements, competitor_brands
- successful_partnerships, products_services, product_categories, search_keywords

JSON OBJECT fields (use proper JSON objects):
- social_media_links: {{"platform": "url", ...}}
- brand_colors: {{"primary": "#hex", "secondary": "#hex", ...}}

IMPORTANT RULES:
1. Extract ALL fields that can be inferred from the input, not just obvious ones
2. For arrays, extract multiple values if mentioned (e.g., "tech and finance" → ["tech", "finance"])
3. For numbers, extract numeric values (e.g., "$50,000" → 50000, "5%" → 5.0)
4. For booleans, infer from context (e.g., "we offer affiliate programs" → true)
5. Only include fields that have clear values - omit uncertain fields
6. Return ONLY valid JSON, no markdown, no explanations

Return the JSON object now:"""

        payload = {
            "contents": [
                {
                    "role": "user",
                    "parts": [{"text": prompt}]
                }
            ],
            "generationConfig": {
                "temperature": 0.1,
                "topK": 40,
                "topP": 0.95,
                "maxOutputTokens": 8192,
                "responseMimeType": "application/json"
            }
        }
        headers = {"Content-Type": "application/json"}
        params = {"key": GEMINI_API_KEY}

        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(
                GEMINI_API_URL,
                json=payload,
                headers=headers,
                params=params
            )
            response.raise_for_status()
            result = response.json()

        # Extract text from Gemini response
        text_content = ""
        if result.get("candidates") and len(result["candidates"]) > 0:
            parts = result["candidates"][0].get("content", {}).get("parts", [])
            if parts:
                # Check if response is already JSON (when responseMimeType is set)
                if "text" in parts[0]:
                    text_content = parts[0].get("text", "")
                else:
                    # Fallback for other response formats
                    text_content = json.dumps(parts[0])

        # Parse JSON from response
        try:
            # Remove markdown code blocks if present
            if text_content.startswith("```"):
                # Find the closing ```
                parts = text_content.split("```")
                if len(parts) >= 3:
                    text_content = parts[1]
                    if text_content.startswith("json"):
                        text_content = text_content[4:]
                else:
                    text_content = text_content[3:]
            text_content = text_content.strip()

            # Try to find JSON object in the response
            if not text_content.startswith("{"):
                # Try to extract JSON from the text
                start_idx = text_content.find("{")
                end_idx = text_content.rfind("}")
                if start_idx != -1 and end_idx != -1 and end_idx > start_idx:
                    text_content = text_content[start_idx:end_idx+1]

            extracted_data = json.loads(text_content)

            # Merge with existing profile (don't overwrite existing non-null values)
            update_data = {}
            for key, value in extracted_data.items():
                # Skip null, empty strings, and empty arrays/objects
                if value is None:
                    continue
                if isinstance(value, str) and value.strip() == "":
                    continue
                if isinstance(value, list) and len(value) == 0:
                    continue
                if isinstance(value, dict) and len(value) == 0:
                    continue

                # Check if field exists and has a value in current profile
                current_value = brand.get(key)
                should_update = False

                if current_value is None or current_value == "":
                    should_update = True
                elif isinstance(current_value, list) and len(current_value) == 0:
                    should_update = True
                elif isinstance(current_value, dict) and len(current_value) == 0:
                    should_update = True
                elif isinstance(current_value, bool) and not current_value and isinstance(value, bool) and value:
                    # Allow updating false booleans to true
                    should_update = True

                if should_update:
                    update_data[key] = value

            if not update_data:
                return {"message": "No new data could be extracted", "data": {}}

            return {"message": f"Profile data extracted successfully. {len(update_data)} fields updated.", "data": update_data}
        except json.JSONDecodeError as e:
            raise HTTPException(
                status_code=500,
                detail=f"Failed to parse AI response as JSON: {str(e)}. Response: {text_content[:200]}"
            )
    except httpx.RequestError as e:
        raise HTTPException(
            status_code=502,
            detail=f"Gemini API error: {str(e)}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error generating profile data: {str(e)}"
        ) from e


@router.post("/creator/profile/ai-fill")
async def ai_fill_creator_profile(
    request: AIFillRequest,
    creator: dict = Depends(get_current_creator)
):
    """Use AI to fill creator profile based on user input"""
    if not GEMINI_API_KEY:
        raise HTTPException(
            status_code=500,
            detail="Gemini API is not configured"
        )

    try:
        # Build prompt for Gemini
        prompt = f"""You are an expert at extracting structured data from natural language. Your task is to analyze user input and extract ALL relevant creator profile information.

Current creator profile (for context - only fill fields that are empty or null):
{json.dumps(creator, indent=2, default=str)}

User provided information:
{request.user_input}

Extract and return a JSON object with ALL fields that can be confidently determined from the user input. Use these exact field names and data types:

STRING fields:
- display_name, tagline, bio, profile_picture_url, cover_image_url, website_url
- youtube_url, youtube_handle, instagram_url, instagram_handle, tiktok_url, tiktok_handle
- twitter_url, twitter_handle, twitch_url, twitch_handle, linkedin_url, facebook_url
- audience_age_primary, posting_frequency, best_performing_content_type, equipment_quality
- preferred_payment_terms, media_kit_url

NUMBER fields (use numbers, not strings):
- youtube_subscribers (integer), instagram_followers (integer), tiktok_followers (integer)
- twitter_followers (integer), twitch_followers (integer)
- total_followers (integer), total_reach (integer), average_views (integer)
- engagement_rate (float 0-100), average_engagement_per_post (integer)
- years_of_experience (integer), team_size (integer)
- rate_per_post (numeric), rate_per_video (numeric), rate_per_story (numeric), rate_per_reel (numeric)
- minimum_deal_value (numeric), matching_score_base (float)

BOOLEAN fields (use true/false):
- content_creation_full_time, rate_negotiable, accepts_product_only_deals
- email_verified, phone_verified, identity_verified
- is_active, is_featured, is_verified_creator

ARRAY fields (use JSON arrays of strings):
- secondary_niches, content_types, content_language, audience_age_secondary
- audience_interests, editing_software, collaboration_types
- preferred_brands_style, not_interested_in, portfolio_links
- past_brand_collaborations, case_study_links, search_keywords

JSON OBJECT fields (use proper JSON objects):
- audience_gender_split: {{"male": 45, "female": 50, "other": 5}} (percentages)
- audience_locations: {{"country": "percentage", ...}} or {{"city": "percentage", ...}}
- peak_posting_times: {{"monday": ["09:00", "18:00"], ...}} or {{"day": "time", ...}}
- social_platforms: {{"platform": {{"handle": "...", "followers": 12345}}, ...}}

IMPORTANT RULES:
1. Extract ALL fields that can be inferred from the input, not just obvious ones
2. For arrays, extract multiple values if mentioned (e.g., "lifestyle and tech" → ["lifestyle", "tech"])
3. For numbers, extract numeric values (e.g., "$500 per post" → 500, "5 years" → 5)
4. For booleans, infer from context (e.g., "I do this full-time" → true)
5. For social media, extract handles, URLs, and follower counts if mentioned
6. For audience data, structure as JSON objects with appropriate keys
7. Only include fields that have clear values - omit uncertain fields
8. Return ONLY valid JSON, no markdown, no explanations

Return the JSON object now:"""

        payload = {
            "contents": [
                {
                    "role": "user",
                    "parts": [{"text": prompt}]
                }
            ],
            "generationConfig": {
                "temperature": 0.1,
                "topK": 40,
                "topP": 0.95,
                "maxOutputTokens": 8192,
                "responseMimeType": "application/json"
            }
        }
        headers = {"Content-Type": "application/json"}
        params = {"key": GEMINI_API_KEY}

        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(
                GEMINI_API_URL,
                json=payload,
                headers=headers,
                params=params
            )
            response.raise_for_status()
            result = response.json()

        # Extract text from Gemini response
        text_content = ""
        if result.get("candidates") and len(result["candidates"]) > 0:
            parts = result["candidates"][0].get("content", {}).get("parts", [])
            if parts:
                # Check if response is already JSON (when responseMimeType is set)
                if "text" in parts[0]:
                    text_content = parts[0].get("text", "")
                else:
                    # Fallback for other response formats
                    text_content = json.dumps(parts[0])

        # Parse JSON from response
        try:
            # Remove markdown code blocks if present
            if text_content.startswith("```"):
                # Find the closing ```
                parts = text_content.split("```")
                if len(parts) >= 3:
                    text_content = parts[1]
                    if text_content.startswith("json"):
                        text_content = text_content[4:]
                else:
                    text_content = text_content[3:]
            text_content = text_content.strip()

            # Try to find JSON object in the response
            if not text_content.startswith("{"):
                # Try to extract JSON from the text
                start_idx = text_content.find("{")
                end_idx = text_content.rfind("}")
                if start_idx != -1 and end_idx != -1 and end_idx > start_idx:
                    text_content = text_content[start_idx:end_idx+1]

            extracted_data = json.loads(text_content)

            # Merge with existing profile (don't overwrite existing non-null values)
            update_data = {}
            for key, value in extracted_data.items():
                # Skip null, empty strings, and empty arrays/objects
                if value is None:
                    continue
                if isinstance(value, str) and value.strip() == "":
                    continue
                if isinstance(value, list) and len(value) == 0:
                    continue
                if isinstance(value, dict) and len(value) == 0:
                    continue

                # Check if field exists and has a value in current profile
                current_value = creator.get(key)
                should_update = False

                if current_value is None or current_value == "":
                    should_update = True
                elif isinstance(current_value, list) and len(current_value) == 0:
                    should_update = True
                elif isinstance(current_value, dict) and len(current_value) == 0:
                    should_update = True
                elif isinstance(current_value, bool) and not current_value and isinstance(value, bool) and value:
                    # Allow updating false booleans to true
                    should_update = True

                if should_update:
                    update_data[key] = value

            if not update_data:
                return {"message": "No new data could be extracted", "data": {}}

            return {"message": f"Profile data extracted successfully. {len(update_data)} fields updated.", "data": update_data}
        except json.JSONDecodeError as e:
            raise HTTPException(
                status_code=500,
                detail=f"Failed to parse AI response as JSON: {str(e)}. Response: {text_content[:200]}"
            )
    except httpx.RequestError as e:
        raise HTTPException(
            status_code=502,
            detail=f"Gemini API error: {str(e)}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error generating profile data: {str(e)}"
        ) from e

