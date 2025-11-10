"""
Collaborations management routes for creator users.
"""

from fastapi import APIRouter, HTTPException, Depends, Query
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime, date
import json
from groq import Groq
from app.core.supabase_clients import supabase_anon
from app.core.dependencies import get_current_creator
from app.core.config import settings

router = APIRouter()


class CollaborationResponse(BaseModel):
    """Schema for collaboration response."""
    id: str
    creator1_id: str
    creator2_id: str
    collaboration_type: str
    title: str
    description: Optional[str]
    status: str
    match_score: Optional[float]
    ai_suggestions: Optional[dict]
    start_date: Optional[date]
    end_date: Optional[date]
    planned_deliverables: Optional[dict]
    completed_deliverables: Optional[List[dict]]
    initiator_id: Optional[str]
    proposal_message: Optional[str]
    response_message: Optional[str]
    total_views: int
    total_engagement: int
    audience_growth: Optional[dict]
    creator1_rating: Optional[int]
    creator1_feedback: Optional[str]
    creator2_rating: Optional[int]
    creator2_feedback: Optional[str]
    proposed_at: datetime
    accepted_at: Optional[datetime]
    completed_at: Optional[datetime]


@router.get("/collaborations", response_model=List[CollaborationResponse])
async def get_my_collaborations(
    creator: dict = Depends(get_current_creator),
    status: Optional[str] = Query(None, description="Filter by status"),
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0)
):
    """
    Get all collaborations for the authenticated creator.

    Returns collaborations where the creator is either creator1 or creator2.

    - **status**: Optional filter by collaboration status (proposed, accepted, planning, active, completed, declined, cancelled)
    - **limit**: Maximum number of results (default: 50, max: 100)
    - **offset**: Number of results to skip for pagination
    """
    supabase = supabase_anon
    creator_id = creator['id']

    try:
        # Get collaborations where creator is creator1
        query1 = supabase.table("creator_collaborations").select("*").eq("creator1_id", creator_id)

        # Get collaborations where creator is creator2
        query2 = supabase.table("creator_collaborations").select("*").eq("creator2_id", creator_id)

        # Apply status filter if provided
        if status:
            query1 = query1.eq("status", status)
            query2 = query2.eq("status", status)

        # Execute both queries
        response1 = query1.execute()
        response2 = query2.execute()

        # Combine results
        all_collaborations = (response1.data or []) + (response2.data or [])

        # Remove duplicates (in case of any edge cases)
        seen = set()
        unique_collaborations = []
        for collab in all_collaborations:
            if collab['id'] not in seen:
                seen.add(collab['id'])
                unique_collaborations.append(collab)

        # Sort by proposed_at descending
        unique_collaborations.sort(key=lambda x: x.get('proposed_at', ''), reverse=True)

        # Apply pagination
        paginated = unique_collaborations[offset:offset + limit]

        return paginated

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error fetching collaborations: {str(e)}"
        ) from e


@router.get("/collaborations/{collaboration_id}", response_model=CollaborationResponse)
async def get_collaboration(
    collaboration_id: str,
    creator: dict = Depends(get_current_creator)
):
    """
    Get a single collaboration by ID.

    Only returns the collaboration if the authenticated creator is involved (creator1 or creator2).

    - **collaboration_id**: The collaboration ID
    """
    supabase = supabase_anon
    creator_id = creator['id']

    try:
        # Fetch collaboration
        response = supabase.table("creator_collaborations") \
            .select("*") \
            .eq("id", collaboration_id) \
            .single() \
            .execute()

        if not response.data:
            raise HTTPException(
                status_code=404,
                detail="Collaboration not found"
            )

        collaboration = response.data

        # Verify creator is involved (creator1 or creator2)
        if collaboration.get("creator1_id") != creator_id and collaboration.get("creator2_id") != creator_id:
            raise HTTPException(
                status_code=403,
                detail="You don't have access to this collaboration"
            )

        return collaboration

    except HTTPException:
        raise
    except Exception as e:
        if "PGRST116" in str(e):  # No rows returned
            raise HTTPException(
                status_code=404,
                detail="Collaboration not found or you don't have access to it"
            ) from e
        raise HTTPException(
            status_code=500,
            detail=f"Error fetching collaboration: {str(e)}"
        ) from e


@router.get("/collaborations/stats/summary")
async def get_collaborations_stats(
    creator: dict = Depends(get_current_creator)
):
    """
    Get collaboration statistics for the authenticated creator.

    Returns counts of collaborations by status.
    """
    supabase = supabase_anon
    creator_id = creator['id']

    try:
        # Get collaborations where creator is creator1
        response1 = supabase.table("creator_collaborations") \
            .select("status") \
            .eq("creator1_id", creator_id) \
            .execute()

        # Get collaborations where creator is creator2
        response2 = supabase.table("creator_collaborations") \
            .select("status") \
            .eq("creator2_id", creator_id) \
            .execute()

        # Combine results
        collaborations = (response1.data or []) + (response2.data or [])

        # Count by status
        stats = {
            "total": len(collaborations),
            "proposed": 0,
            "accepted": 0,
            "planning": 0,
            "active": 0,
            "completed": 0,
            "declined": 0,
            "cancelled": 0
        }

        for collab in collaborations:
            status = collab.get("status", "proposed")
            if status in stats:
                stats[status] += 1

        return stats

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error fetching collaboration stats: {str(e)}"
        ) from e


class CollaborationIdeasRequest(BaseModel):
    """Request model for generating collaboration ideas."""
    target_creator_id: str


class CollaborationIdea(BaseModel):
    """Schema for a single collaboration idea."""
    title: str
    description: str
    collaboration_type: str
    why_it_works: str


class CollaborationIdeasResponse(BaseModel):
    """Response model for collaboration ideas."""
    ideas: List[CollaborationIdea]


@router.post("/collaborations/generate-ideas", response_model=CollaborationIdeasResponse)
async def generate_collaboration_ideas(
    request: CollaborationIdeasRequest,
    creator: dict = Depends(get_current_creator)
):
    """
    Generate collaboration ideas between the current creator and a target creator using AI.

    - **target_creator_id**: The ID of the creator to collaborate with
    """
    supabase = supabase_anon
    current_creator_id = creator['id']
    target_creator_id = request.target_creator_id

    # Prevent self-collaboration
    if current_creator_id == target_creator_id:
        raise HTTPException(
            status_code=400,
            detail="Cannot generate collaboration ideas with yourself"
        )

    try:
        # Fetch both creator profiles
        current_creator_response = supabase.table("creators") \
            .select("*") \
            .eq("id", current_creator_id) \
            .eq("is_active", True) \
            .single() \
            .execute()

        target_creator_response = supabase.table("creators") \
            .select("*") \
            .eq("id", target_creator_id) \
            .eq("is_active", True) \
            .single() \
            .execute()

        if not current_creator_response.data:
            raise HTTPException(status_code=404, detail="Current creator profile not found")
        if not target_creator_response.data:
            raise HTTPException(status_code=404, detail="Target creator profile not found")

        current_creator = current_creator_response.data
        target_creator = target_creator_response.data

        # Build prompt for Groq AI
        prompt = f"""You are an expert at matching content creators for collaborations. Analyze the following two creator profiles and suggest 5 creative, specific collaboration ideas that would work well between them.

Creator 1 Profile:
- Name: {current_creator.get('display_name', 'Unknown')}
- Tagline: {current_creator.get('tagline', 'N/A')}
- Bio: {current_creator.get('bio', 'N/A')}
- Primary Niche: {current_creator.get('primary_niche', 'N/A')}
- Secondary Niches: {', '.join(current_creator.get('secondary_niches', []) or [])}
- Content Types: {', '.join(current_creator.get('content_types', []) or [])}
- Collaboration Types Open To: {', '.join(current_creator.get('collaboration_types', []) or [])}
- Total Followers: {current_creator.get('total_followers', 0)}
- Engagement Rate: {current_creator.get('engagement_rate', 0)}%

Creator 2 Profile:
- Name: {target_creator.get('display_name', 'Unknown')}
- Tagline: {target_creator.get('tagline', 'N/A')}
- Bio: {target_creator.get('bio', 'N/A')}
- Primary Niche: {target_creator.get('primary_niche', 'N/A')}
- Secondary Niches: {', '.join(target_creator.get('secondary_niches', []) or [])}
- Content Types: {', '.join(target_creator.get('content_types', []) or [])}
- Collaboration Types Open To: {', '.join(target_creator.get('collaboration_types', []) or [])}
- Total Followers: {target_creator.get('total_followers', 0)}
- Engagement Rate: {target_creator.get('engagement_rate', 0)}%

Please provide 5 collaboration ideas. For each idea, provide:
1. A catchy title (max 60 characters)
2. A detailed description (2-3 sentences explaining the collaboration)
3. The collaboration type (e.g., "Video Collaboration", "Cross-Promotion", "Joint Series", "Challenge", "Podcast", etc.)
4. Why it works (1-2 sentences explaining why these creators are a good match for this idea)

Format your response as a JSON array with this exact structure:
[
  {{
    "title": "Idea Title",
    "description": "Detailed description of the collaboration idea",
    "collaboration_type": "Type of collaboration",
    "why_it_works": "Explanation of why this works for these creators"
  }},
  ...
]

Return ONLY the JSON array, no additional text or markdown formatting."""

        # Call Groq API using official SDK
        api_key = settings.groq_api_key
        if not api_key:
            raise HTTPException(status_code=500, detail="GROQ API key not configured")

        groq_client = Groq(api_key=api_key)

        try:
            completion = groq_client.chat.completions.create(
                model="meta-llama/llama-4-scout-17b-16e-instruct",
                messages=[
                    {
                        "role": "system",
                        "content": "You are an expert strategist who crafts detailed, actionable collaboration ideas for content creators. Always respond with valid JSON only.",
                    },
                    {"role": "user", "content": prompt},
                ],
                temperature=0.8,
                max_completion_tokens=1200,
                top_p=1,
                stream=False,
            )

            content = completion.choices[0].message.content if completion.choices else ""

            # Parse JSON from the response
            content = content.strip()
            if content.startswith("```json"):
                content = content[7:]
            if content.startswith("```"):
                content = content[3:]
            if content.endswith("```"):
                content = content[:-3]
            content = content.strip()

            ideas_data = json.loads(content)

            # Validate and convert to our model
            ideas = []
            for idea in ideas_data[:5]:  # Take up to 5 ideas
                ideas.append(CollaborationIdea(
                    title=idea.get("title", "Untitled Collaboration"),
                    description=idea.get("description", ""),
                    collaboration_type=idea.get("collaboration_type", "General Collaboration"),
                    why_it_works=idea.get("why_it_works", "")
                ))

            if not ideas:
                raise HTTPException(
                    status_code=500,
                    detail="Failed to generate collaboration ideas. Please try again."
                )

            return CollaborationIdeasResponse(ideas=ideas)

        except json.JSONDecodeError as e:
            raise HTTPException(
                status_code=500,
                detail=f"Failed to parse AI response: {str(e)}"
            )
        except Exception as e:
            raise HTTPException(
                status_code=502,
                detail=f"GROQ API error: {str(e)}"
            )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error generating collaboration ideas: {str(e)}"
        ) from e


class RecommendCreatorRequest(BaseModel):
    """Request model for recommending best creator for a collaboration idea."""
    collaboration_idea: str
    candidate_creator_ids: List[str]


class CreatorRecommendation(BaseModel):
    """Schema for a creator recommendation."""
    creator_id: str
    display_name: str
    profile_picture_url: Optional[str]
    primary_niche: str
    match_score: float
    reasoning: str


class RecommendCreatorResponse(BaseModel):
    """Response model for creator recommendation."""
    recommended_creator: CreatorRecommendation
    alternatives: List[CreatorRecommendation]


@router.post("/collaborations/recommend-creator", response_model=RecommendCreatorResponse)
async def recommend_creator_for_idea(
    request: RecommendCreatorRequest,
    creator: dict = Depends(get_current_creator)
):
    """
    Recommend the best creator from a list of candidates for a specific collaboration idea.

    - **collaboration_idea**: Description of the collaboration idea/content
    - **candidate_creator_ids**: List of creator IDs to choose from
    """
    supabase = supabase_anon
    current_creator_id = creator['id']

    if not request.candidate_creator_ids:
        raise HTTPException(
            status_code=400,
            detail="At least one candidate creator ID is required"
        )

    try:
        # Fetch current creator profile
        current_creator_response = supabase.table("creators") \
            .select("*") \
            .eq("id", current_creator_id) \
            .eq("is_active", True) \
            .single() \
            .execute()

        if not current_creator_response.data:
            raise HTTPException(status_code=404, detail="Current creator profile not found")

        current_creator = current_creator_response.data

        # Fetch all candidate creator profiles
        candidate_creators = []
        for candidate_id in request.candidate_creator_ids:
            if candidate_id == current_creator_id:
                continue  # Skip self
            response = supabase.table("creators") \
                .select("*") \
                .eq("id", candidate_id) \
                .eq("is_active", True) \
                .single() \
                .execute()
            if response.data:
                candidate_creators.append(response.data)

        if not candidate_creators:
            raise HTTPException(
                status_code=404,
                detail="No valid candidate creators found"
            )

        # Build prompt for Groq AI
        candidates_info = []
        for idx, cand in enumerate(candidate_creators):
            candidates_info.append(f"""
Candidate {idx + 1} (ID: {cand.get('id', 'unknown')}):
- Name: {cand.get('display_name', 'Unknown')}
- Tagline: {cand.get('tagline', 'N/A')}
- Bio: {cand.get('bio', 'N/A')}
- Primary Niche: {cand.get('primary_niche', 'N/A')}
- Secondary Niches: {', '.join(cand.get('secondary_niches', []) or [])}
- Content Types: {', '.join(cand.get('content_types', []) or [])}
- Collaboration Types Open To: {', '.join(cand.get('collaboration_types', []) or [])}
- Total Followers: {cand.get('total_followers', 0)}
- Engagement Rate: {cand.get('engagement_rate', 0)}%
- Years of Experience: {cand.get('years_of_experience', 'N/A')}
""")

        prompt = f"""You are an expert at matching content creators for collaborations. A creator wants to collaborate on the following idea:

COLLABORATION IDEA:
{request.collaboration_idea}

CURRENT CREATOR PROFILE:
- Name: {current_creator.get('display_name', 'Unknown')}
- Tagline: {current_creator.get('tagline', 'N/A')}
- Bio: {current_creator.get('bio', 'N/A')}
- Primary Niche: {current_creator.get('primary_niche', 'N/A')}
- Secondary Niches: {', '.join(current_creator.get('secondary_niches', []) or [])}
- Content Types: {', '.join(current_creator.get('content_types', []) or [])}
- Collaboration Types Open To: {', '.join(current_creator.get('collaboration_types', []) or [])}

CANDIDATE CREATORS:
{''.join(candidates_info)}

Analyze which candidate creator would be the BEST match for this collaboration idea. Consider:
1. Niche compatibility
2. Content type alignment
3. Audience synergy
4. Collaboration type preferences
5. How well the idea fits each candidate's style and strengths

Rank all candidates from best to worst match. For each candidate, provide:
- A match score (0-100)
- Detailed reasoning explaining why they are or aren't a good fit

Format your response as JSON with this exact structure:
{{
  "recommendations": [
    {{
      "creator_id": "candidate_id_here",
      "match_score": 85,
      "reasoning": "Detailed explanation of why this creator is a good/bad match for the idea"
    }},
    ...
  ]
}}

Return ONLY the JSON object, no additional text or markdown formatting."""

        # Call Groq API
        api_key = settings.groq_api_key
        if not api_key:
            raise HTTPException(status_code=500, detail="GROQ API key not configured")

        from groq import Groq
        groq_client = Groq(api_key=api_key)

        try:
            completion = groq_client.chat.completions.create(
                model="meta-llama/llama-4-scout-17b-16e-instruct",
                messages=[
                    {
                        "role": "system",
                        "content": "You are an expert strategist who analyzes creator collaborations. Always respond with valid JSON only.",
                    },
                    {"role": "user", "content": prompt},
                ],
                temperature=0.7,
                max_completion_tokens=1500,
                top_p=1,
                stream=False,
            )

            content = completion.choices[0].message.content.strip()

            # Clean JSON response
            if content.startswith("```json"):
                content = content[7:]
            if content.startswith("```"):
                content = content[3:]
            if content.endswith("```"):
                content = content[:-3]
            content = content.strip()

            result_data = json.loads(content)
            recommendations = result_data.get("recommendations", [])

            if not recommendations:
                raise HTTPException(
                    status_code=500,
                    detail="Failed to get recommendations from AI"
                )

            # Map recommendations to creator data
            creator_map = {cand['id']: cand for cand in candidate_creators}
            ranked_creators = []

            for rec in recommendations:
                creator_id = rec.get("creator_id")
                if creator_id in creator_map:
                    creator_data = creator_map[creator_id]
                    ranked_creators.append(CreatorRecommendation(
                        creator_id=creator_id,
                        display_name=creator_data.get('display_name', 'Unknown'),
                        profile_picture_url=creator_data.get('profile_picture_url'),
                        primary_niche=creator_data.get('primary_niche', ''),
                        match_score=float(rec.get("match_score", 0)),
                        reasoning=rec.get("reasoning", "")
                    ))

            if not ranked_creators:
                raise HTTPException(
                    status_code=500,
                    detail="Failed to process recommendations"
                )

            # Return best match and alternatives
            recommended = ranked_creators[0]
            alternatives = ranked_creators[1:] if len(ranked_creators) > 1 else []

            return RecommendCreatorResponse(
                recommended_creator=recommended,
                alternatives=alternatives
            )

        except json.JSONDecodeError as e:
            raise HTTPException(
                status_code=500,
                detail=f"Failed to parse AI response: {str(e)}"
            )
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Error getting recommendation: {str(e)}"
            )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error recommending creator: {str(e)}"
        ) from e

