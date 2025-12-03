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


# ========== Collaboration Proposal & Management ==========

class ProposeCollaborationRequest(BaseModel):
    """Request model for proposing a collaboration."""
    target_creator_id: str
    collaboration_type: str
    title: str
    description: Optional[str] = None
    proposal_message: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    planned_deliverables: Optional[dict] = None


@router.post("/collaborations/propose", response_model=CollaborationResponse)
async def propose_collaboration(
    request: ProposeCollaborationRequest,
    creator: dict = Depends(get_current_creator)
):
    """
    Propose a collaboration to another creator.
    """
    supabase = supabase_anon
    current_creator_id = creator['id']
    target_creator_id = request.target_creator_id

    # Prevent self-collaboration
    if current_creator_id == target_creator_id:
        raise HTTPException(
            status_code=400,
            detail="Cannot propose collaboration to yourself"
        )

    try:
        # Verify target creator exists
        target_response = supabase.table("creators") \
            .select("id") \
            .eq("id", target_creator_id) \
            .eq("is_active", True) \
            .single() \
            .execute()

        if not target_response.data:
            raise HTTPException(status_code=404, detail="Target creator not found")

        # Determine creator1 and creator2 (always use lower UUID first for consistency)
        creator_ids = sorted([current_creator_id, target_creator_id])
        creator1_id = creator_ids[0]
        creator2_id = creator_ids[1]

        # Check if collaboration already exists
        existing = supabase.table("creator_collaborations") \
            .select("id") \
            .eq("creator1_id", creator1_id) \
            .eq("creator2_id", creator2_id) \
            .eq("title", request.title) \
            .execute()

        if existing.data:
            raise HTTPException(
                status_code=400,
                detail="A collaboration with this title already exists between you and this creator"
            )

        # Create collaboration
        collaboration_data = {
            "creator1_id": creator1_id,
            "creator2_id": creator2_id,
            "collaboration_type": request.collaboration_type,
            "title": request.title,
            "description": request.description,
            "status": "proposed",
            "initiator_id": current_creator_id,
            "proposal_message": request.proposal_message,
            "start_date": request.start_date.isoformat() if request.start_date else None,
            "end_date": request.end_date.isoformat() if request.end_date else None,
            "planned_deliverables": request.planned_deliverables or {}
        }

        response = supabase.table("creator_collaborations") \
            .insert(collaboration_data) \
            .execute()

        if not response.data:
            raise HTTPException(status_code=500, detail="Failed to create collaboration proposal")

        return response.data[0]

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error proposing collaboration: {str(e)}"
        ) from e


class AcceptDeclineRequest(BaseModel):
    """Request model for accepting or declining a collaboration."""
    response_message: Optional[str] = None


@router.post("/collaborations/{collaboration_id}/accept", response_model=CollaborationResponse)
async def accept_collaboration(
    collaboration_id: str,
    request: AcceptDeclineRequest,
    creator: dict = Depends(get_current_creator)
):
    """
    Accept a collaboration proposal.
    """
    supabase = supabase_anon
    creator_id = creator['id']

    try:
        # Fetch collaboration
        collab_response = supabase.table("creator_collaborations") \
            .select("*") \
            .eq("id", collaboration_id) \
            .single() \
            .execute()

        if not collab_response.data:
            raise HTTPException(status_code=404, detail="Collaboration not found")

        collaboration = collab_response.data

        # Verify creator is the recipient (not the initiator)
        if collaboration.get("initiator_id") == creator_id:
            raise HTTPException(
                status_code=400,
                detail="You cannot accept your own proposal"
            )

        # Verify creator is involved
        if collaboration.get("creator1_id") != creator_id and collaboration.get("creator2_id") != creator_id:
            raise HTTPException(
                status_code=403,
                detail="You don't have access to this collaboration"
            )

        # Verify status is 'proposed'
        if collaboration.get("status") != "proposed":
            raise HTTPException(
                status_code=400,
                detail=f"Cannot accept collaboration with status: {collaboration.get('status')}"
            )

        # Update collaboration
        update_data = {
            "status": "accepted",
            "accepted_at": datetime.now().isoformat(),
            "response_message": request.response_message
        }

        response = supabase.table("creator_collaborations") \
            .update(update_data) \
            .eq("id", collaboration_id) \
            .execute()

        if not response.data:
            raise HTTPException(status_code=500, detail="Failed to accept collaboration")

        return response.data[0]

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error accepting collaboration: {str(e)}"
        ) from e


@router.post("/collaborations/{collaboration_id}/decline", response_model=CollaborationResponse)
async def decline_collaboration(
    collaboration_id: str,
    request: AcceptDeclineRequest,
    creator: dict = Depends(get_current_creator)
):
    """
    Decline a collaboration proposal.
    """
    supabase = supabase_anon
    creator_id = creator['id']

    try:
        # Fetch collaboration
        collab_response = supabase.table("creator_collaborations") \
            .select("*") \
            .eq("id", collaboration_id) \
            .single() \
            .execute()

        if not collab_response.data:
            raise HTTPException(status_code=404, detail="Collaboration not found")

        collaboration = collab_response.data

        # Verify creator is the recipient (not the initiator)
        if collaboration.get("initiator_id") == creator_id:
            raise HTTPException(
                status_code=400,
                detail="You cannot decline your own proposal"
            )

        # Verify creator is involved
        if collaboration.get("creator1_id") != creator_id and collaboration.get("creator2_id") != creator_id:
            raise HTTPException(
                status_code=403,
                detail="You don't have access to this collaboration"
            )

        # Verify status is 'proposed'
        if collaboration.get("status") != "proposed":
            raise HTTPException(
                status_code=400,
                detail=f"Cannot decline collaboration with status: {collaboration.get('status')}"
            )

        # Update collaboration
        update_data = {
            "status": "declined",
            "response_message": request.response_message
        }

        response = supabase.table("creator_collaborations") \
            .update(update_data) \
            .eq("id", collaboration_id) \
            .execute()

        if not response.data:
            raise HTTPException(status_code=500, detail="Failed to decline collaboration")

        return response.data[0]

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error declining collaboration: {str(e)}"
        ) from e


# ========== Collaboration Workspace ==========

class CollaborationWorkspaceResponse(BaseModel):
    """Response model for collaboration workspace."""
    collaboration: CollaborationResponse
    deliverables: List[dict]
    messages: List[dict]
    assets: List[dict]
    feedback: List[dict]
    other_creator: dict


@router.get("/collaborations/{collaboration_id}/workspace", response_model=CollaborationWorkspaceResponse)
async def get_collaboration_workspace(
    collaboration_id: str,
    creator: dict = Depends(get_current_creator)
):
    """
    Get full collaboration workspace including deliverables, messages, and assets.
    """
    supabase = supabase_anon
    creator_id = creator['id']

    try:
        # Fetch collaboration
        collab_response = supabase.table("creator_collaborations") \
            .select("*") \
            .eq("id", collaboration_id) \
            .single() \
            .execute()

        if not collab_response.data:
            raise HTTPException(status_code=404, detail="Collaboration not found")

        collaboration = collab_response.data

        # Verify creator is involved
        if collaboration.get("creator1_id") != creator_id and collaboration.get("creator2_id") != creator_id:
            raise HTTPException(
                status_code=403,
                detail="You don't have access to this collaboration"
            )

        # Get other creator info
        other_creator_id = collaboration.get("creator2_id") if collaboration.get("creator1_id") == creator_id else collaboration.get("creator1_id")
        other_creator_response = supabase.table("creators") \
            .select("id, display_name, profile_picture_url, primary_niche") \
            .eq("id", other_creator_id) \
            .single() \
            .execute()

        other_creator = other_creator_response.data if other_creator_response.data else {}

        # Get deliverables
        deliverables_response = supabase.table("collaboration_deliverables") \
            .select("*") \
            .eq("collaboration_id", collaboration_id) \
            .order("created_at", desc=False) \
            .execute()

        deliverables = deliverables_response.data or []

        # Get messages
        messages_response = supabase.table("collaboration_messages") \
            .select("*") \
            .eq("collaboration_id", collaboration_id) \
            .order("created_at", desc=False) \
            .execute()

        messages = messages_response.data or []

        # Get assets
        assets_response = supabase.table("collaboration_assets") \
            .select("*") \
            .eq("collaboration_id", collaboration_id) \
            .order("created_at", desc=True) \
            .execute()

        assets = assets_response.data or []

        # Get feedback
        feedback_response = supabase.table("collaboration_feedback") \
            .select("*") \
            .eq("collaboration_id", collaboration_id) \
            .execute()

        feedback = feedback_response.data or []

        return CollaborationWorkspaceResponse(
            collaboration=collaboration,
            deliverables=deliverables,
            messages=messages,
            assets=assets,
            feedback=feedback,
            other_creator=other_creator
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error fetching workspace: {str(e)}"
        ) from e


# ========== Deliverables Management ==========

class CreateDeliverableRequest(BaseModel):
    """Request model for creating a deliverable."""
    description: str
    due_date: Optional[date] = None


@router.post("/collaborations/{collaboration_id}/deliverables", response_model=dict)
async def create_deliverable(
    collaboration_id: str,
    request: CreateDeliverableRequest,
    creator: dict = Depends(get_current_creator)
):
    """
    Create a new deliverable for a collaboration.
    """
    supabase = supabase_anon
    creator_id = creator['id']

    try:
        # Verify collaboration access
        collab_response = supabase.table("creator_collaborations") \
            .select("creator1_id, creator2_id, status") \
            .eq("id", collaboration_id) \
            .single() \
            .execute()

        if not collab_response.data:
            raise HTTPException(status_code=404, detail="Collaboration not found")

        collaboration = collab_response.data

        if collaboration.get("creator1_id") != creator_id and collaboration.get("creator2_id") != creator_id:
            raise HTTPException(status_code=403, detail="You don't have access to this collaboration")

        if collaboration.get("status") not in ["accepted", "planning", "active"]:
            raise HTTPException(
                status_code=400,
                detail="Can only add deliverables to accepted, planning, or active collaborations"
            )

        # Create deliverable
        deliverable_data = {
            "collaboration_id": collaboration_id,
            "description": request.description,
            "due_date": request.due_date.isoformat() if request.due_date else None,
            "status": "pending"
        }

        response = supabase.table("collaboration_deliverables") \
            .insert(deliverable_data) \
            .execute()

        if not response.data:
            raise HTTPException(status_code=500, detail="Failed to create deliverable")

        return response.data[0]

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error creating deliverable: {str(e)}"
        ) from e


class UpdateDeliverableRequest(BaseModel):
    """Request model for updating a deliverable."""
    description: Optional[str] = None
    due_date: Optional[date] = None
    status: Optional[str] = None
    submission_url: Optional[str] = None


@router.patch("/collaborations/{collaboration_id}/deliverables/{deliverable_id}", response_model=dict)
async def update_deliverable(
    collaboration_id: str,
    deliverable_id: str,
    request: UpdateDeliverableRequest,
    creator: dict = Depends(get_current_creator)
):
    """
    Update a deliverable.
    """
    supabase = supabase_anon
    creator_id = creator['id']

    try:
        # Verify collaboration access
        collab_response = supabase.table("creator_collaborations") \
            .select("creator1_id, creator2_id") \
            .eq("id", collaboration_id) \
            .single() \
            .execute()

        if not collab_response.data:
            raise HTTPException(status_code=404, detail="Collaboration not found")

        collaboration = collab_response.data

        if collaboration.get("creator1_id") != creator_id and collaboration.get("creator2_id") != creator_id:
            raise HTTPException(status_code=403, detail="You don't have access to this collaboration")

        # Verify deliverable exists and belongs to collaboration
        deliverable_response = supabase.table("collaboration_deliverables") \
            .select("*") \
            .eq("id", deliverable_id) \
            .eq("collaboration_id", collaboration_id) \
            .single() \
            .execute()

        if not deliverable_response.data:
            raise HTTPException(status_code=404, detail="Deliverable not found")

        # Build update data
        update_data = {}
        if request.description is not None:
            update_data["description"] = request.description
        if request.due_date is not None:
            update_data["due_date"] = request.due_date.isoformat()
        if request.status is not None:
            update_data["status"] = request.status
        if request.submission_url is not None:
            update_data["submission_url"] = request.submission_url

        response = supabase.table("collaboration_deliverables") \
            .update(update_data) \
            .eq("id", deliverable_id) \
            .execute()

        if not response.data:
            raise HTTPException(status_code=500, detail="Failed to update deliverable")

        return response.data[0]

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error updating deliverable: {str(e)}"
        ) from e


# ========== Messages ==========

class SendMessageRequest(BaseModel):
    """Request model for sending a message."""
    message: str


@router.post("/collaborations/{collaboration_id}/messages", response_model=dict)
async def send_message(
    collaboration_id: str,
    request: SendMessageRequest,
    creator: dict = Depends(get_current_creator)
):
    """
    Send a message in a collaboration.
    """
    supabase = supabase_anon
    creator_id = creator['id']

    try:
        # Verify collaboration access
        collab_response = supabase.table("creator_collaborations") \
            .select("creator1_id, creator2_id, status") \
            .eq("id", collaboration_id) \
            .single() \
            .execute()

        if not collab_response.data:
            raise HTTPException(status_code=404, detail="Collaboration not found")

        collaboration = collab_response.data

        if collaboration.get("creator1_id") != creator_id and collaboration.get("creator2_id") != creator_id:
            raise HTTPException(status_code=403, detail="You don't have access to this collaboration")

        if collaboration.get("status") in ["declined", "cancelled"]:
            raise HTTPException(
                status_code=400,
                detail="Cannot send messages to declined or cancelled collaborations"
            )

        # Create message
        message_data = {
            "collaboration_id": collaboration_id,
            "sender_id": creator_id,
            "message": request.message
        }

        response = supabase.table("collaboration_messages") \
            .insert(message_data) \
            .execute()

        if not response.data:
            raise HTTPException(status_code=500, detail="Failed to send message")

        return response.data[0]

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error sending message: {str(e)}"
        ) from e


# ========== Assets ==========

class UploadAssetRequest(BaseModel):
    """Request model for uploading an asset."""
    url: str
    type: Optional[str] = None


@router.post("/collaborations/{collaboration_id}/assets", response_model=dict)
async def upload_asset(
    collaboration_id: str,
    request: UploadAssetRequest,
    creator: dict = Depends(get_current_creator)
):
    """
    Upload/share an asset (file URL) in a collaboration.
    """
    supabase = supabase_anon
    creator_id = creator['id']

    try:
        # Verify collaboration access
        collab_response = supabase.table("creator_collaborations") \
            .select("creator1_id, creator2_id, status") \
            .eq("id", collaboration_id) \
            .single() \
            .execute()

        if not collab_response.data:
            raise HTTPException(status_code=404, detail="Collaboration not found")

        collaboration = collab_response.data

        if collaboration.get("creator1_id") != creator_id and collaboration.get("creator2_id") != creator_id:
            raise HTTPException(status_code=403, detail="You don't have access to this collaboration")

        if collaboration.get("status") in ["declined", "cancelled"]:
            raise HTTPException(
                status_code=400,
                detail="Cannot upload assets to declined or cancelled collaborations"
            )

        # Create asset
        asset_data = {
            "collaboration_id": collaboration_id,
            "uploaded_by": creator_id,
            "url": request.url,
            "type": request.type
        }

        response = supabase.table("collaboration_assets") \
            .insert(asset_data) \
            .execute()

        if not response.data:
            raise HTTPException(status_code=500, detail="Failed to upload asset")

        return response.data[0]

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error uploading asset: {str(e)}"
        ) from e


# ========== Completion & Feedback ==========

class CompleteCollaborationRequest(BaseModel):
    """Request model for completing a collaboration."""
    pass  # No additional fields needed


@router.post("/collaborations/{collaboration_id}/complete", response_model=CollaborationResponse)
async def complete_collaboration(
    collaboration_id: str,
    request: CompleteCollaborationRequest,
    creator: dict = Depends(get_current_creator)
):
    """
    Mark a collaboration as complete. Both creators must mark it complete.
    """
    supabase = supabase_anon
    creator_id = creator['id']

    try:
        # Fetch collaboration
        collab_response = supabase.table("creator_collaborations") \
            .select("*") \
            .eq("id", collaboration_id) \
            .single() \
            .execute()

        if not collab_response.data:
            raise HTTPException(status_code=404, detail="Collaboration not found")

        collaboration = collab_response.data

        # Verify creator is involved
        if collaboration.get("creator1_id") != creator_id and collaboration.get("creator2_id") != creator_id:
            raise HTTPException(status_code=403, detail="You don't have access to this collaboration")

        # Verify status allows completion
        if collaboration.get("status") not in ["accepted", "planning", "active"]:
            raise HTTPException(
                status_code=400,
                detail=f"Cannot complete collaboration with status: {collaboration.get('status')}"
            )

        # Check if all deliverables are completed
        deliverables_response = supabase.table("collaboration_deliverables") \
            .select("id, status") \
            .eq("collaboration_id", collaboration_id) \
            .execute()

        deliverables = deliverables_response.data or []
        if deliverables:
            incomplete = [d for d in deliverables if d.get("status") != "completed"]
            if incomplete:
                raise HTTPException(
                    status_code=400,
                    detail="All deliverables must be completed before marking collaboration as complete"
                )

        # Update collaboration status
        update_data = {
            "status": "completed",
            "completed_at": datetime.now().isoformat()
        }

        response = supabase.table("creator_collaborations") \
            .update(update_data) \
            .eq("id", collaboration_id) \
            .execute()

        if not response.data:
            raise HTTPException(status_code=500, detail="Failed to complete collaboration")

        return response.data[0]

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error completing collaboration: {str(e)}"
        ) from e


class SubmitFeedbackRequest(BaseModel):
    """Request model for submitting feedback."""
    rating: int = Field(..., ge=1, le=5)
    feedback: Optional[str] = None


@router.post("/collaborations/{collaboration_id}/feedback", response_model=dict)
async def submit_feedback(
    collaboration_id: str,
    request: SubmitFeedbackRequest,
    creator: dict = Depends(get_current_creator)
):
    """
    Submit feedback and rating for a completed collaboration.
    """
    supabase = supabase_anon
    creator_id = creator['id']

    try:
        # Fetch collaboration
        collab_response = supabase.table("creator_collaborations") \
            .select("*") \
            .eq("id", collaboration_id) \
            .single() \
            .execute()

        if not collab_response.data:
            raise HTTPException(status_code=404, detail="Collaboration not found")

        collaboration = collab_response.data

        # Verify creator is involved
        if collaboration.get("creator1_id") != creator_id and collaboration.get("creator2_id") != creator_id:
            raise HTTPException(status_code=403, detail="You don't have access to this collaboration")

        # Verify collaboration is completed
        if collaboration.get("status") != "completed":
            raise HTTPException(
                status_code=400,
                detail="Can only submit feedback for completed collaborations"
            )

        # Determine the other creator (the one receiving feedback)
        other_creator_id = collaboration.get("creator2_id") if collaboration.get("creator1_id") == creator_id else collaboration.get("creator1_id")

        # Check if feedback already exists
        existing_feedback = supabase.table("collaboration_feedback") \
            .select("id") \
            .eq("collaboration_id", collaboration_id) \
            .eq("from_creator_id", creator_id) \
            .eq("to_creator_id", other_creator_id) \
            .execute()

        feedback_data = {
            "collaboration_id": collaboration_id,
            "from_creator_id": creator_id,
            "to_creator_id": other_creator_id,
            "rating": request.rating,
            "feedback": request.feedback
        }

        if existing_feedback.data and len(existing_feedback.data) > 0:
            # Update existing feedback
            response = supabase.table("collaboration_feedback") \
                .update(feedback_data) \
                .eq("id", existing_feedback.data[0]["id"]) \
                .execute()
        else:
            # Create new feedback
            response = supabase.table("collaboration_feedback") \
                .insert(feedback_data) \
                .execute()

        if not response.data:
            raise HTTPException(status_code=500, detail="Failed to submit feedback")

        return response.data[0] if isinstance(response.data, list) else response.data

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error submitting feedback: {str(e)}"
        ) from e

