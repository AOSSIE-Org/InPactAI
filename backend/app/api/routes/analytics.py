"""
Campaign Performance Analytics & ROI Tracking routes.
Supports brands defining metrics, creators submitting data, AI screenshot extraction, and feedback.
"""
from fastapi import APIRouter, HTTPException, Depends, UploadFile, File, Query
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime, timezone
from uuid import UUID
import base64
import httpx
from app.core.supabase_clients import supabase_anon
from app.core.dependencies import get_current_brand, get_current_creator, get_current_user
from app.core.config import settings

router = APIRouter()

# Gemini Vision API for screenshot extraction
GEMINI_API_KEY = settings.gemini_api_key
GEMINI_VISION_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent"


# ==================== Pydantic Models ====================

class MetricCreate(BaseModel):
    """Schema for creating a metric for a deliverable"""
    campaign_deliverable_id: str
    name: str
    display_name: Optional[str] = None
    target_value: Optional[float] = None
    is_custom: bool = False


class MetricUpdate(BaseModel):
    """Schema for updating a metric"""
    display_name: Optional[str] = None
    target_value: Optional[float] = None


class MetricResponse(BaseModel):
    """Schema for metric response"""
    id: str
    campaign_deliverable_id: str
    name: str
    display_name: Optional[str]
    target_value: Optional[float]
    is_custom: bool
    created_at: datetime


class MetricValueSubmit(BaseModel):
    """Schema for submitting a metric value"""
    value: float
    demographics: Optional[Dict[str, Any]] = None
    screenshot_url: Optional[str] = None
    ai_extracted_data: Optional[Dict[str, Any]] = None


class MetricUpdateResponse(BaseModel):
    """Schema for metric update response"""
    id: str
    campaign_deliverable_metric_id: str
    value: float
    demographics: Optional[Dict[str, Any]]
    screenshot_url: Optional[str]
    ai_extracted_data: Optional[Dict[str, Any]]
    submitted_by: str
    submitted_at: datetime


class FeedbackCreate(BaseModel):
    """Schema for creating feedback on a metric update"""
    feedback_text: str


class CreatorCommentCreate(BaseModel):
    """Schema for creator comments on metrics"""
    comment_text: str
    metric_update_id: Optional[str] = None


class FeedbackResponse(BaseModel):
    """Schema for feedback response"""
    id: str
    metric_update_id: str
    brand_id: str
    feedback_text: str
    created_at: datetime


class UpdateRequestCreate(BaseModel):
    """Schema for requesting a metric update"""
    campaign_deliverable_metric_id: Optional[str] = None  # None = request all metrics
    creator_id: str


class UpdateRequestResponse(BaseModel):
    """Schema for update request response"""
    id: str
    campaign_deliverable_metric_id: Optional[str]
    brand_id: str
    creator_id: str
    requested_at: datetime
    status: str


class AnalyticsDashboardResponse(BaseModel):
    """Schema for analytics dashboard data"""
    campaign_id: str
    campaign_title: str
    platforms: List[Dict[str, Any]]
    total_deliverables: int
    total_metrics: int
    metrics_with_updates: int
    overall_progress: float


# ==================== Helper Functions ====================

async def extract_metrics_from_image(image_base64: str) -> Dict[str, Any]:
    """
    Use Gemini Vision API to extract metrics from a screenshot.
    Returns structured data with extracted metric values.
    """
    if not GEMINI_API_KEY:
        raise HTTPException(
            status_code=500,
            detail="Gemini API is not configured. Please set GEMINI_API_KEY in environment."
        )

    prompt = """
    Analyze this social media analytics screenshot and extract all visible metrics.
    Look for numbers related to:
    - Impressions/Reach
    - Views
    - Likes/Reactions
    - Comments
    - Shares/Reposts
    - Saves
    - Engagement Rate
    - Click-through Rate (CTR)
    - Conversions
    - Any other performance metrics visible

    Return a JSON object with the metric names as keys and their numeric values.
    Only include metrics that are clearly visible in the screenshot.
    Format: {"impressions": 12345, "likes": 567, "comments": 89, ...}
    """

    payload = {
        "contents": [{
            "role": "user",
            "parts": [
                {"text": prompt},
                {
                    "inline_data": {
                        "mime_type": "image/jpeg",
                        "data": image_base64
                    }
                }
            ]
        }]
    }

    headers = {"Content-Type": "application/json"}
    params = {"key": GEMINI_API_KEY}

    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                GEMINI_VISION_API_URL,
                json=payload,
                headers=headers,
                params=params
            )
            response.raise_for_status()
            result = response.json()

            # Extract text from Gemini response
            if result.get("candidates") and result["candidates"][0].get("content"):
                text = result["candidates"][0]["content"]["parts"][0].get("text", "")
                # Try to parse JSON from the response
                import json
                import re
                # Extract JSON from markdown code blocks if present
                json_match = re.search(r'```(?:json)?\s*(\{.*?\})\s*```', text, re.DOTALL)
                if json_match:
                    text = json_match.group(1)
                else:
                    # Try to find JSON object in the text
                    json_match = re.search(r'\{.*\}', text, re.DOTALL)
                    if json_match:
                        text = json_match.group(0)

                try:
                    extracted_data = json.loads(text)
                    return extracted_data
                except json.JSONDecodeError:
                    # If JSON parsing fails, return the raw text
                    return {"raw_text": text, "parsed": False}
            return {"error": "No data extracted"}
    except httpx.RequestError as e:
        raise HTTPException(status_code=502, detail=f"Gemini API error: {str(e)}")
    except httpx.HTTPStatusError as e:
        raise HTTPException(status_code=502, detail=f"Gemini API error: {str(e)}")


# ==================== Brand Endpoints ====================

@router.post("/analytics/metrics", response_model=MetricResponse, status_code=201)
async def create_metric(
    metric: MetricCreate,
    brand: dict = Depends(get_current_brand)
):
    """Create a metric for a campaign deliverable"""
    try:
        # Verify deliverable belongs to brand's campaign
        deliverable_res = supabase_anon.table("campaign_deliverables") \
            .select("campaign_id") \
            .eq("id", metric.campaign_deliverable_id) \
            .execute()

        if not deliverable_res.data:
            raise HTTPException(status_code=404, detail="Deliverable not found")

        campaign_id = deliverable_res.data[0]["campaign_id"]
        campaign_res = supabase_anon.table("campaigns") \
            .select("brand_id") \
            .eq("id", campaign_id) \
            .execute()

        if not campaign_res.data or campaign_res.data[0]["brand_id"] != brand["id"]:
            raise HTTPException(status_code=403, detail="Not authorized to create metrics for this deliverable")

        # Create metric
        metric_data = {
            "campaign_deliverable_id": metric.campaign_deliverable_id,
            "name": metric.name,
            "display_name": metric.display_name or metric.name,
            "target_value": metric.target_value,
            "is_custom": metric.is_custom
        }

        result = supabase_anon.table("campaign_deliverable_metrics") \
            .insert(metric_data) \
            .execute()

        if not result.data:
            raise HTTPException(status_code=500, detail="Failed to create metric")

        return MetricResponse(**result.data[0])
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating metric: {str(e)}")


@router.get("/analytics/metrics/{metric_id}", response_model=MetricResponse)
async def get_metric(
    metric_id: str,
    brand: dict = Depends(get_current_brand)
):
    """Get a metric by ID"""
    try:
        result = supabase_anon.table("campaign_deliverable_metrics") \
            .select("*, campaign_deliverables(campaign_id)") \
            .eq("id", metric_id) \
            .execute()

        if not result.data:
            raise HTTPException(status_code=404, detail="Metric not found")

        metric = result.data[0]
        campaign_id = metric["campaign_deliverables"]["campaign_id"]
        campaign_res = supabase_anon.table("campaigns") \
            .select("brand_id") \
            .eq("id", campaign_id) \
            .execute()

        if not campaign_res.data or campaign_res.data[0]["brand_id"] != brand["id"]:
            raise HTTPException(status_code=403, detail="Not authorized")

        return MetricResponse(**metric)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching metric: {str(e)}")


@router.put("/analytics/metrics/{metric_id}", response_model=MetricResponse)
async def update_metric(
    metric_id: str,
    metric_update: MetricUpdate,
    brand: dict = Depends(get_current_brand)
):
    """Update a metric"""
    try:
        # Verify ownership
        existing = supabase_anon.table("campaign_deliverable_metrics") \
            .select("*, campaign_deliverables!inner(campaign_id, campaigns!inner(brand_id))") \
            .eq("id", metric_id) \
            .execute()

        if not existing.data:
            raise HTTPException(status_code=404, detail="Metric not found")

        if existing.data[0]["campaign_deliverables"]["campaigns"]["brand_id"] != brand["id"]:
            raise HTTPException(status_code=403, detail="Not authorized")

        # Update metric
        update_data = {}
        if metric_update.display_name is not None:
            update_data["display_name"] = metric_update.display_name
        if metric_update.target_value is not None:
            update_data["target_value"] = metric_update.target_value

        result = supabase_anon.table("campaign_deliverable_metrics") \
            .update(update_data) \
            .eq("id", metric_id) \
            .execute()

        if not result.data:
            raise HTTPException(status_code=500, detail="Failed to update metric")

        return MetricResponse(**result.data[0])
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error updating metric: {str(e)}")


@router.delete("/analytics/metrics/{metric_id}", status_code=204)
async def delete_metric(
    metric_id: str,
    brand: dict = Depends(get_current_brand)
):
    """Delete a metric"""
    try:
        # Verify ownership
        existing = supabase_anon.table("campaign_deliverable_metrics") \
            .select("*, campaign_deliverables(campaign_id)") \
            .eq("id", metric_id) \
            .execute()

        if not existing.data:
            raise HTTPException(status_code=404, detail="Metric not found")

        campaign_id = existing.data[0]["campaign_deliverables"]["campaign_id"]
        campaign_res = supabase_anon.table("campaigns") \
            .select("brand_id") \
            .eq("id", campaign_id) \
            .execute()

        if not campaign_res.data or campaign_res.data[0]["brand_id"] != brand["id"]:
            raise HTTPException(status_code=403, detail="Not authorized")

        supabase_anon.table("campaign_deliverable_metrics") \
            .delete() \
            .eq("id", metric_id) \
            .execute()

        return None
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error deleting metric: {str(e)}")


@router.get("/analytics/campaigns/{campaign_id}/dashboard", response_model=AnalyticsDashboardResponse)
async def get_analytics_dashboard(
    campaign_id: str,
    brand: dict = Depends(get_current_brand)
):
    """Get analytics dashboard data for a campaign"""
    try:
        # Verify campaign ownership
        campaign_res = supabase_anon.table("campaigns") \
            .select("id, title, brand_id, platforms") \
            .eq("id", campaign_id) \
            .eq("brand_id", brand["id"]) \
            .execute()

        if not campaign_res.data:
            raise HTTPException(status_code=404, detail="Campaign not found")

        campaign = campaign_res.data[0]

        # Get deliverables from campaign_deliverables table
        deliverables_res = supabase_anon.table("campaign_deliverables") \
            .select("id, platform, content_type") \
            .eq("campaign_id", campaign_id) \
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
                    migrated_res = supabase_anon.table("campaign_deliverables") \
                        .insert(deliverable_records) \
                        .execute()
                    deliverables = migrated_res.data or []

        # Get metrics for each deliverable
        deliverable_ids = [d["id"] for d in deliverables]
        if deliverable_ids:
            metrics_res = supabase_anon.table("campaign_deliverable_metrics") \
                .select("id, campaign_deliverable_id, name, display_name, target_value") \
                .in_("campaign_deliverable_id", deliverable_ids) \
                .execute()
            metrics = metrics_res.data or []
        else:
            metrics = []

        # Get updates count
        metric_ids = [m["id"] for m in metrics]
        if metric_ids:
            updates_res = supabase_anon.table("campaign_deliverable_metric_updates") \
                .select("campaign_deliverable_metric_id") \
                .in_("campaign_deliverable_metric_id", metric_ids) \
                .execute()
            updates = updates_res.data or []
        else:
            updates = []
        metrics_with_updates = len(set(u["campaign_deliverable_metric_id"] for u in updates))

        # Calculate overall progress
        overall_progress = (metrics_with_updates / len(metrics)) * 100 if metrics else 0

        # Group by platform
        platform_data = {}
        for deliverable in deliverables:
            platform = deliverable.get("platform", "Unknown")
            if platform not in platform_data:
                platform_data[platform] = {
                    "platform": platform,
                    "deliverables": [],
                    "metrics": []
                }
            platform_data[platform]["deliverables"].append(deliverable)

        for metric in metrics:
            deliverable_id = metric["campaign_deliverable_id"]
            deliverable = next((d for d in deliverables if d["id"] == deliverable_id), None)
            if deliverable:
                platform = deliverable.get("platform", "Unknown")
                if platform in platform_data:
                    platform_data[platform]["metrics"].append(metric)

        return AnalyticsDashboardResponse(
            campaign_id=campaign_id,
            campaign_title=campaign["title"],
            platforms=list(platform_data.values()),
            total_deliverables=len(deliverables),
            total_metrics=len(metrics),
            metrics_with_updates=metrics_with_updates,
            overall_progress=round(overall_progress, 2)
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching dashboard: {str(e)}")


@router.get("/analytics/brand/all-deliverables")
async def get_all_brand_deliverables(
    brand: dict = Depends(get_current_brand)
):
    """Get all deliverables across all campaigns for a brand with their metrics"""
    try:
        brand_id = brand["id"]

        # Get all campaigns for this brand
        campaigns_res = supabase_anon.table("campaigns") \
            .select("id, title, status") \
            .eq("brand_id", brand_id) \
            .execute()

        campaigns = campaigns_res.data or []
        campaign_ids = [c["id"] for c in campaigns]

        if not campaign_ids:
            return {
                "deliverables": [],
                "campaigns": []
            }

        # Get all deliverables for these campaigns
        deliverables_res = supabase_anon.table("campaign_deliverables") \
            .select("id, campaign_id, platform, content_type, quantity, guidance, required, created_at") \
            .in_("campaign_id", campaign_ids) \
            .order("created_at", desc=True) \
            .execute()

        deliverables = deliverables_res.data or []

        # Get metrics for each deliverable
        deliverable_ids = [d["id"] for d in deliverables]
        if deliverable_ids:
            metrics_res = supabase_anon.table("campaign_deliverable_metrics") \
                .select("*") \
                .in_("campaign_deliverable_id", deliverable_ids) \
                .execute()
            metrics = metrics_res.data or []
        else:
            metrics = []

        # Get latest updates for each metric
        metric_ids = [m["id"] for m in metrics]
        if metric_ids:
            updates_res = supabase_anon.table("campaign_deliverable_metric_updates") \
                .select("*") \
                .in_("campaign_deliverable_metric_id", metric_ids) \
                .order("submitted_at", desc=True) \
                .execute()
            updates = updates_res.data or []
        else:
            updates = []

        # Get latest feedback for each update
        update_ids = [u["id"] for u in updates]
        if update_ids:
            feedback_res = supabase_anon.table("campaign_deliverable_metric_feedback") \
                .select("*") \
                .in_("metric_update_id", update_ids) \
                .order("created_at", desc=True) \
                .execute()
            feedback_list = feedback_res.data or []
        else:
            feedback_list = []

        # Organize data: group updates by metric_id, get latest
        updates_by_metric = {}
        for update in updates:
            metric_id = update["campaign_deliverable_metric_id"]
            if metric_id not in updates_by_metric:
                updates_by_metric[metric_id] = update

        # Group feedback by update_id, get latest
        feedback_by_update = {}
        for feedback in feedback_list:
            update_id = feedback["metric_update_id"]
            if update_id not in feedback_by_update:
                feedback_by_update[update_id] = feedback

        # Attach latest update and feedback to each metric
        for metric in metrics:
            metric_id = metric["id"]
            if metric_id in updates_by_metric:
                metric["latest_update"] = updates_by_metric[metric_id]
                update_id = updates_by_metric[metric_id]["id"]
                if update_id in feedback_by_update:
                    metric["latest_feedback"] = feedback_by_update[update_id]
            else:
                metric["latest_update"] = None
                metric["latest_feedback"] = None

        # Attach metrics to deliverables
        metrics_by_deliverable = {}
        for metric in metrics:
            deliverable_id = metric["campaign_deliverable_id"]
            if deliverable_id not in metrics_by_deliverable:
                metrics_by_deliverable[deliverable_id] = []
            metrics_by_deliverable[deliverable_id].append(metric)

        # Get creators for each campaign through contracts
        creators_by_campaign = {}
        for campaign_id in campaign_ids:
            contracts_res = supabase_anon.table("contracts") \
                .select("creator_id, proposals(campaign_id, creators(id, display_name))") \
                .eq("brand_id", brand_id) \
                .execute()

            creators = []
            for contract in contracts_res.data or []:
                if contract.get("proposals"):
                    proposals = contract["proposals"] if isinstance(contract["proposals"], list) else [contract["proposals"]]
                    for proposal in proposals:
                        if proposal.get("campaign_id") == campaign_id and proposal.get("creators"):
                            creator = proposal["creators"]
                            if isinstance(creator, dict):
                                creators.append({
                                    "id": creator.get("id"),
                                    "display_name": creator.get("display_name", "Unknown Creator")
                                })
            creators_by_campaign[campaign_id] = creators

        # Attach campaign info, metrics, and creators to deliverables
        campaigns_by_id = {c["id"]: c for c in campaigns}
        for deliverable in deliverables:
            campaign_id = deliverable["campaign_id"]
            deliverable["campaign"] = campaigns_by_id.get(campaign_id, {})
            deliverable["metrics"] = metrics_by_deliverable.get(deliverable["id"], [])
            deliverable["campaign"]["creators"] = creators_by_campaign.get(campaign_id, [])

        return {
            "deliverables": deliverables,
            "campaigns": campaigns,
            "total_deliverables": len(deliverables),
            "total_metrics": len(metrics),
            "metrics_with_updates": len(updates_by_metric)
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching deliverables: {str(e)}")


@router.get("/analytics/deliverables/{deliverable_id}/metrics")
async def get_deliverable_metrics(
    deliverable_id: str,
    brand: dict = Depends(get_current_brand)
):
    """Get all metrics for a deliverable with their latest updates"""
    try:
        # Verify ownership
        deliverable_res = supabase_anon.table("campaign_deliverables") \
            .select("id, campaign_id") \
            .eq("id", deliverable_id) \
            .execute()

        if not deliverable_res.data:
            raise HTTPException(status_code=404, detail="Deliverable not found")

        campaign_id = deliverable_res.data[0]["campaign_id"]
        campaign_res = supabase_anon.table("campaigns") \
            .select("brand_id") \
            .eq("id", campaign_id) \
            .execute()

        if not campaign_res.data or campaign_res.data[0]["brand_id"] != brand["id"]:
            raise HTTPException(status_code=403, detail="Not authorized")

        # Get metrics
        metrics_res = supabase_anon.table("campaign_deliverable_metrics") \
            .select("*") \
            .eq("campaign_deliverable_id", deliverable_id) \
            .execute()

        metrics = metrics_res.data or []

        # Get latest updates for each metric
        for metric in metrics:
            updates_res = supabase_anon.table("campaign_deliverable_metric_updates") \
                .select("*") \
                .eq("campaign_deliverable_metric_id", metric["id"]) \
                .order("submitted_at", desc=True) \
                .limit(1) \
                .execute()

            metric["latest_update"] = updates_res.data[0] if updates_res.data else None

            # Get feedback for latest update
            if metric["latest_update"]:
                feedback_res = supabase_anon.table("campaign_deliverable_metric_feedback") \
                    .select("*") \
                    .eq("metric_update_id", metric["latest_update"]["id"]) \
                    .order("created_at", desc=True) \
                    .limit(1) \
                    .execute()

                metric["latest_feedback"] = feedback_res.data[0] if feedback_res.data else None

        return {"metrics": metrics}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching metrics: {str(e)}")


@router.post("/analytics/metric-updates/{update_id}/feedback", response_model=FeedbackResponse, status_code=201)
async def create_feedback(
    update_id: str,
    feedback: FeedbackCreate,
    brand: dict = Depends(get_current_brand)
):
    """Create feedback on a metric update"""
    try:
        # Verify update exists and belongs to brand's campaign
        update_res = supabase_anon.table("campaign_deliverable_metric_updates") \
            .select("id, campaign_deliverable_metrics(campaign_deliverable_id)") \
            .eq("id", update_id) \
            .execute()

        if not update_res.data:
            raise HTTPException(status_code=404, detail="Metric update not found")

        deliverable_id = update_res.data[0]["campaign_deliverable_metrics"]["campaign_deliverable_id"]
        deliverable_res = supabase_anon.table("campaign_deliverables") \
            .select("campaign_id") \
            .eq("id", deliverable_id) \
            .execute()

        if not deliverable_res.data:
            raise HTTPException(status_code=404, detail="Deliverable not found")

        campaign_id = deliverable_res.data[0]["campaign_id"]
        campaign_res = supabase_anon.table("campaigns") \
            .select("brand_id") \
            .eq("id", campaign_id) \
            .execute()

        if not campaign_res.data or campaign_res.data[0]["brand_id"] != brand["id"]:
            raise HTTPException(status_code=403, detail="Not authorized")

        # Create feedback
        feedback_data = {
            "metric_update_id": update_id,
            "brand_id": brand["id"],
            "feedback_text": feedback.feedback_text
        }

        result = supabase_anon.table("campaign_deliverable_metric_feedback") \
            .insert(feedback_data) \
            .execute()

        if not result.data:
            raise HTTPException(status_code=500, detail="Failed to create feedback")

        return FeedbackResponse(**result.data[0])
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating feedback: {str(e)}")


@router.post("/analytics/update-requests", response_model=UpdateRequestResponse, status_code=201)
async def create_update_request(
    request: UpdateRequestCreate,
    brand: dict = Depends(get_current_brand)
):
    """Request a metric update from a creator"""
    try:
        # If specific metric, verify ownership
        if request.campaign_deliverable_metric_id:
            metric_res = supabase_anon.table("campaign_deliverable_metrics") \
                .select("*, campaign_deliverables(campaign_id)") \
                .eq("id", request.campaign_deliverable_metric_id) \
                .execute()

            if not metric_res.data:
                raise HTTPException(status_code=404, detail="Metric not found")

            campaign_id = metric_res.data[0]["campaign_deliverables"]["campaign_id"]
            campaign_res = supabase_anon.table("campaigns") \
                .select("brand_id") \
                .eq("id", campaign_id) \
                .execute()

            if not campaign_res.data or campaign_res.data[0]["brand_id"] != brand["id"]:
                raise HTTPException(status_code=403, detail="Not authorized")

        # Create update request
        request_data = {
            "campaign_deliverable_metric_id": request.campaign_deliverable_metric_id,
            "brand_id": brand["id"],
            "creator_id": request.creator_id,
            "status": "pending"
        }

        result = supabase_anon.table("campaign_deliverable_metric_update_requests") \
            .insert(request_data) \
            .execute()

        if not result.data:
            raise HTTPException(status_code=500, detail="Failed to create update request")

        return UpdateRequestResponse(**result.data[0])
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating update request: {str(e)}")


# ==================== Creator Endpoints ====================

@router.get("/analytics/creator/campaigns")
async def get_creator_campaigns(
    creator: dict = Depends(get_current_creator)
):
    """Get all campaigns that the creator is involved in with progress, value, status, and brand info"""
    try:
        creator_id = creator["id"]

        # Get campaigns from contracts (through proposals)
        contracts_res = supabase_anon.table("contracts") \
            .select("id, status, terms, proposals(campaign_id, campaigns(*, brands(company_name, id)))") \
            .eq("creator_id", creator_id) \
            .execute()

        campaign_ids = set()
        campaigns_data = []
        contract_by_campaign = {}

        # Extract campaigns from contracts
        for contract in contracts_res.data or []:
            if contract.get("proposals"):
                proposals = contract["proposals"] if isinstance(contract["proposals"], list) else [contract["proposals"]]
                for proposal in proposals:
                    if proposal.get("campaigns") and proposal.get("campaign_id"):
                        campaign_id = proposal["campaign_id"]
                        if campaign_id not in campaign_ids:
                            campaign_ids.add(campaign_id)
                            campaign_data = proposal["campaigns"].copy()

                            # Add brand info
                            if campaign_data.get("brands"):
                                campaign_data["brand_name"] = campaign_data["brands"].get("company_name", "Unknown Brand")
                                campaign_data["brand_id"] = campaign_data["brands"].get("id")

                            # Add contract info
                            contract_terms = contract.get("terms", {})
                            if isinstance(contract_terms, dict):
                                campaign_data["value"] = contract_terms.get("amount") or contract_terms.get("proposed_amount") or 0
                            else:
                                campaign_data["value"] = 0

                            campaign_data["contract_id"] = contract["id"]
                            campaign_data["contract_status"] = contract.get("status", "unknown")

                            contract_by_campaign[campaign_id] = contract["id"]
                            campaigns_data.append(campaign_data)

        # Also get campaigns from deals
        deals_res = supabase_anon.table("deals") \
            .select("campaign_id, agreed_amount, campaigns(*, brands(company_name, id))") \
            .eq("creator_id", creator_id) \
            .execute()

        for deal in deals_res.data or []:
            if deal.get("campaigns") and deal.get("campaign_id"):
                campaign_id = deal["campaign_id"]
                if campaign_id not in campaign_ids:
                    campaign_ids.add(campaign_id)
                    campaign_data = deal["campaigns"].copy()

                    if campaign_data.get("brands"):
                        campaign_data["brand_name"] = campaign_data["brands"].get("company_name", "Unknown Brand")
                        campaign_data["brand_id"] = campaign_data["brands"].get("id")

                    campaign_data["value"] = deal.get("agreed_amount", 0) or 0
                    campaigns_data.append(campaign_data)

        # Calculate progress for each campaign
        for campaign in campaigns_data:
            campaign_id = campaign.get("id")
            if not campaign_id:
                campaign["progress"] = 0
                continue

            # Get contract deliverables for this campaign
            contract_id = contract_by_campaign.get(campaign_id)
            if contract_id:
                # Get deliverables from contract_deliverables
                contract_deliverables_res = supabase_anon.table("contract_deliverables") \
                    .select("id, status, campaign_deliverable_id") \
                    .eq("contract_id", contract_id) \
                    .execute()

                contract_deliverables = contract_deliverables_res.data or []
                total_deliverables = len(contract_deliverables)

                if total_deliverables == 0:
                    campaign["progress"] = 0
                else:
                    # Count completed deliverables
                    completed = sum(1 for d in contract_deliverables if d.get("status") == "completed")
                    campaign["progress"] = round((completed / total_deliverables) * 100, 1)
            else:
                campaign["progress"] = 0

        return {"campaigns": campaigns_data}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching campaigns: {str(e)}")


@router.get("/analytics/creator/campaigns/{campaign_id}")
async def get_creator_campaign_details(
    campaign_id: str,
    creator: dict = Depends(get_current_creator)
):
    """Get campaign details with deliverables grouped by platform"""
    try:
        creator_id = creator["id"]

        # Verify creator has access to this campaign through a contract
        contracts_res = supabase_anon.table("contracts") \
            .select("id, status, terms, proposals(campaign_id)") \
            .eq("creator_id", creator_id) \
            .execute()

        contract_id = None
        has_access = False
        for contract in contracts_res.data or []:
            if contract.get("proposals"):
                proposals = contract["proposals"] if isinstance(contract["proposals"], list) else [contract["proposals"]]
                for proposal in proposals:
                    if proposal.get("campaign_id") == campaign_id:
                        contract_id = contract["id"]
                        has_access = True
                        break

        if not has_access:
            raise HTTPException(status_code=403, detail="You don't have access to this campaign")

        # Get campaign details
        campaign_res = supabase_anon.table("campaigns") \
            .select("*, brands(company_name, id)") \
            .eq("id", campaign_id) \
            .single() \
            .execute()

        if not campaign_res.data:
            raise HTTPException(status_code=404, detail="Campaign not found")

        campaign = campaign_res.data.copy()
        if campaign.get("brands"):
            campaign["brand_name"] = campaign["brands"].get("company_name", "Unknown Brand")
            campaign["brand_id"] = campaign["brands"].get("id")

        # Get contract deliverables
        contract_deliverables_res = supabase_anon.table("contract_deliverables") \
            .select("*, campaign_deliverables(platform, content_type, quantity, guidance)") \
            .eq("contract_id", contract_id) \
            .execute()

        contract_deliverables = contract_deliverables_res.data or []

        # Group deliverables by platform
        platforms = {}
        for contract_deliv in contract_deliverables:
            camp_deliv = contract_deliv.get("campaign_deliverables", {})
            platform = camp_deliv.get("platform", "Unknown")

            if platform not in platforms:
                platforms[platform] = {
                    "platform": platform,
                    "deliverables": [],
                    "total": 0,
                    "completed": 0
                }

            # Calculate progress for this deliverable
            status = contract_deliv.get("status", "pending")
            if status == "completed":
                platforms[platform]["completed"] += 1

            platforms[platform]["total"] += 1

            deliverable_data = {
                "id": contract_deliv["id"],
                "contract_deliverable_id": contract_deliv["id"],
                "campaign_deliverable_id": contract_deliv.get("campaign_deliverable_id"),
                "description": contract_deliv.get("description"),
                "status": status,
                "due_date": contract_deliv.get("due_date"),
                "platform": platform,
                "content_type": camp_deliv.get("content_type"),
                "quantity": camp_deliv.get("quantity", 1),
                "guidance": camp_deliv.get("guidance"),
            }

            platforms[platform]["deliverables"].append(deliverable_data)

        # Calculate platform progress
        for platform_data in platforms.values():
            if platform_data["total"] > 0:
                platform_data["progress"] = round((platform_data["completed"] / platform_data["total"]) * 100, 1)
            else:
                platform_data["progress"] = 0

        campaign["platforms"] = list(platforms.values())
        campaign["contract_id"] = contract_id

        return campaign
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching campaign details: {str(e)}")


@router.get("/analytics/creator/campaigns/{campaign_id}/platform/{platform}/deliverables")
async def get_platform_deliverables(
    campaign_id: str,
    platform: str,
    creator: dict = Depends(get_current_creator)
):
    """Get deliverables for a specific platform"""
    try:
        creator_id = creator["id"]

        # Verify access
        contracts_res = supabase_anon.table("contracts") \
            .select("id, proposals(campaign_id)") \
            .eq("creator_id", creator_id) \
            .execute()

        contract_id = None
        for contract in contracts_res.data or []:
            if contract.get("proposals"):
                proposals = contract["proposals"] if isinstance(contract["proposals"], list) else [contract["proposals"]]
                for proposal in proposals:
                    if proposal.get("campaign_id") == campaign_id:
                        contract_id = contract["id"]
                        break

        if not contract_id:
            raise HTTPException(status_code=403, detail="You don't have access to this campaign")

        # Get deliverables for this platform
        contract_deliverables_res = supabase_anon.table("contract_deliverables") \
            .select("*, campaign_deliverables(platform, content_type, quantity, guidance)") \
            .eq("contract_id", contract_id) \
            .execute()

        deliverables = []
        for contract_deliv in contract_deliverables_res.data or []:
            camp_deliv = contract_deliv.get("campaign_deliverables", {})
            if camp_deliv.get("platform") == platform:
                deliverable_data = {
                    "id": contract_deliv["id"],
                    "contract_deliverable_id": contract_deliv["id"],
                    "campaign_deliverable_id": contract_deliv.get("campaign_deliverable_id"),
                    "description": contract_deliv.get("description"),
                    "status": contract_deliv.get("status", "pending"),
                    "due_date": contract_deliv.get("due_date"),
                    "platform": platform,
                    "content_type": camp_deliv.get("content_type"),
                    "quantity": camp_deliv.get("quantity", 1),
                    "guidance": camp_deliv.get("guidance"),
                }
                deliverables.append(deliverable_data)

        return {"deliverables": deliverables, "platform": platform}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching platform deliverables: {str(e)}")


@router.get("/analytics/creator/deliverables/{deliverable_id}/metrics")
async def get_deliverable_metrics(
    deliverable_id: str,
    creator: dict = Depends(get_current_creator)
):
    """Get metrics for a contract deliverable"""
    try:
        creator_id = creator["id"]

        # Get contract deliverable
        contract_deliv_res = supabase_anon.table("contract_deliverables") \
            .select("*, contracts(creator_id, proposals(campaign_id))") \
            .eq("id", deliverable_id) \
            .single() \
            .execute()

        if not contract_deliv_res.data:
            raise HTTPException(status_code=404, detail="Deliverable not found")

        contract_deliv = contract_deliv_res.data
        contract = contract_deliv.get("contracts", {})

        # Verify creator has access
        if isinstance(contract, list) and len(contract) > 0:
            contract = contract[0]

        if contract.get("creator_id") != creator_id:
            raise HTTPException(status_code=403, detail="You don't have access to this deliverable")

        campaign_deliverable_id = contract_deliv.get("campaign_deliverable_id")
        if not campaign_deliverable_id:
            return {"metrics": []}

        # Get metrics for the campaign deliverable
        metrics_res = supabase_anon.table("campaign_deliverable_metrics") \
            .select("*") \
            .eq("campaign_deliverable_id", campaign_deliverable_id) \
            .execute()

        metrics = metrics_res.data or []

        # Get latest updates and feedback for each metric
        for metric in metrics:
            # Get latest update
            updates_res = supabase_anon.table("campaign_deliverable_metric_updates") \
                .select("*") \
                .eq("campaign_deliverable_metric_id", metric["id"]) \
                .order("submitted_at", desc=True) \
                .limit(1) \
                .execute()

            metric["latest_update"] = updates_res.data[0] if updates_res.data else None

            # Get all feedback for this metric (through updates)
            if metric["latest_update"]:
                feedback_res = supabase_anon.table("campaign_deliverable_metric_feedback") \
                    .select("*, brands(company_name)") \
                    .eq("metric_update_id", metric["latest_update"]["id"]) \
                    .order("created_at", desc=True) \
                    .execute()

                metric["feedback"] = feedback_res.data or []
            else:
                metric["feedback"] = []

        return {"metrics": metrics, "deliverable": contract_deliv}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching metrics: {str(e)}")


@router.post("/analytics/creator/metrics/{metric_id}/comment")
async def create_creator_comment(
    metric_id: str,
    comment: CreatorCommentCreate,
    creator: dict = Depends(get_current_creator),
    user: dict = Depends(get_current_user)
):
    """Creator adds a comment/response to a metric"""
    try:
        creator_id = creator["id"]

        # Verify metric exists and creator has access
        metric_res = supabase_anon.table("campaign_deliverable_metrics") \
            .select("*, campaign_deliverables(campaign_id)") \
            .eq("id", metric_id) \
            .execute()

        if not metric_res.data:
            raise HTTPException(status_code=404, detail="Metric not found")

        metric = metric_res.data[0]
        campaign_id = metric["campaign_deliverables"]["campaign_id"]

        # Verify creator has access through contract
        contracts_res = supabase_anon.table("contracts") \
            .select("id, proposals(campaign_id)") \
            .eq("creator_id", creator_id) \
            .execute()

        has_access = False
        for contract in contracts_res.data or []:
            if contract.get("proposals"):
                proposals = contract["proposals"] if isinstance(contract["proposals"], list) else [contract["proposals"]]
                for proposal in proposals:
                    if proposal.get("campaign_id") == campaign_id:
                        has_access = True
                        break

        if not has_access:
            raise HTTPException(status_code=403, detail="You don't have access to this metric")

        # Get or create metric update for this comment
        metric_update_id = comment.metric_update_id
        if not metric_update_id:
            # Get latest update or create a placeholder
            updates_res = supabase_anon.table("campaign_deliverable_metric_updates") \
                .select("id") \
                .eq("campaign_deliverable_metric_id", metric_id) \
                .order("submitted_at", desc=True) \
                .limit(1) \
                .execute()

            if updates_res.data:
                metric_update_id = updates_res.data[0]["id"]
            else:
                # Create a placeholder update for the comment
                update_data = {
                    "campaign_deliverable_metric_id": metric_id,
                    "value": 0,  # Placeholder
                    "submitted_by": user["id"]
                }
                update_res = supabase_anon.table("campaign_deliverable_metric_updates") \
                    .insert(update_data) \
                    .execute()
                if update_res.data:
                    metric_update_id = update_res.data[0]["id"]
                else:
                    raise HTTPException(status_code=500, detail="Failed to create metric update for comment")

        # Store creator comment in the metric update's demographics field
        # This allows us to track creator comments without modifying the feedback table schema
        if metric_update_id:
            update_res = supabase_anon.table("campaign_deliverable_metric_updates") \
                .select("demographics") \
                .eq("id", metric_update_id) \
                .single() \
                .execute()

            current_demographics = update_res.data.get("demographics", {}) if update_res.data else {}
            if not isinstance(current_demographics, dict):
                current_demographics = {}

            if "creator_comments" not in current_demographics:
                current_demographics["creator_comments"] = []

            current_demographics["creator_comments"].append({
                "text": comment.comment_text,
                "created_by": creator_id,
                "created_at": datetime.now(timezone.utc).isoformat()
            })

            supabase_anon.table("campaign_deliverable_metric_updates") \
                .update({"demographics": current_demographics}) \
                .eq("id", metric_update_id) \
                .execute()

        return {
            "success": True,
            "message": "Comment added successfully",
            "metric_update_id": metric_update_id
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error adding comment: {str(e)}")


@router.post("/analytics/metrics/{metric_id}/submit", response_model=MetricUpdateResponse, status_code=201)
async def submit_metric_value(
    metric_id: str,
    submission: MetricValueSubmit,
    creator: dict = Depends(get_current_creator),
    user: dict = Depends(get_current_user)
):
    """Submit a metric value (manual entry)"""
    try:
        # Verify metric exists
        metric_res = supabase_anon.table("campaign_deliverable_metrics") \
            .select("id") \
            .eq("id", metric_id) \
            .execute()

        if not metric_res.data:
            raise HTTPException(status_code=404, detail="Metric not found")

        # Create update
        update_data = {
            "campaign_deliverable_metric_id": metric_id,
            "value": submission.value,
            "demographics": submission.demographics,
            "screenshot_url": submission.screenshot_url,
            "ai_extracted_data": submission.ai_extracted_data,
            "submitted_by": user["id"]
        }

        result = supabase_anon.table("campaign_deliverable_metric_updates") \
            .insert(update_data) \
            .execute()

        if not result.data:
            raise HTTPException(status_code=500, detail="Failed to submit metric value")

        # Mark pending requests as completed
        supabase_anon.table("campaign_deliverable_metric_update_requests") \
            .update({"status": "completed"}) \
            .eq("campaign_deliverable_metric_id", metric_id) \
            .eq("creator_id", creator["id"]) \
            .eq("status", "pending") \
            .execute()

        # Create audit log
        audit_data = {
            "campaign_deliverable_metric_id": metric_id,
            "new_value": submission.value,
            "changed_by": user["id"],
            "change_reason": "Creator submitted metric value"
        }

        supabase_anon.table("campaign_deliverable_metric_audit") \
            .insert(audit_data) \
            .execute()

        return MetricUpdateResponse(**result.data[0])
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error submitting metric value: {str(e)}")


@router.post("/analytics/metrics/{metric_id}/extract-from-screenshot")
async def extract_metrics_from_screenshot(
    metric_id: str,
    file: UploadFile = File(...),
    creator: dict = Depends(get_current_creator)
):
    """Extract metrics from uploaded screenshot using AI"""
    try:
        # Verify metric exists
        metric_res = supabase_anon.table("campaign_deliverable_metrics") \
            .select("id, name") \
            .eq("id", metric_id) \
            .execute()

        if not metric_res.data:
            raise HTTPException(status_code=404, detail="Metric not found")

        # Read and encode image
        image_bytes = await file.read()
        image_base64 = base64.b64encode(image_bytes).decode('utf-8')

        # Extract metrics using AI
        extracted_data = await extract_metrics_from_image(image_base64)

        return {
            "extracted_data": extracted_data,
            "metric_name": metric_res.data[0]["name"],
            "suggested_value": extracted_data.get(metric_res.data[0]["name"]) or extracted_data.get("value")
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error extracting metrics: {str(e)}")


@router.get("/analytics/creator/pending-requests")
async def get_pending_update_requests(
    creator: dict = Depends(get_current_creator)
):
    """Get all pending update requests for a creator"""
    try:
        requests_res = supabase_anon.table("campaign_deliverable_metric_update_requests") \
            .select("*, campaign_deliverable_metrics(name, display_name, campaign_deliverable_id)") \
            .eq("creator_id", creator["id"]) \
            .eq("status", "pending") \
            .execute()

        # Enrich with deliverable and campaign info
        for req in requests_res.data or []:
            if req.get("campaign_deliverable_metrics"):
                deliverable_id = req["campaign_deliverable_metrics"]["campaign_deliverable_id"]
                deliverable_res = supabase_anon.table("campaign_deliverables") \
                    .select("platform, content_type, campaign_id") \
                    .eq("id", deliverable_id) \
                    .execute()
                if deliverable_res.data:
                    req["campaign_deliverable_metrics"]["campaign_deliverables"] = deliverable_res.data[0]
                    campaign_id = deliverable_res.data[0]["campaign_id"]
                    campaign_res = supabase_anon.table("campaigns") \
                        .select("title") \
                        .eq("id", campaign_id) \
                        .execute()
                    if campaign_res.data:
                        req["campaign_deliverable_metrics"]["campaign_deliverables"]["campaigns"] = campaign_res.data[0]

        return {"requests": requests_res.data or []}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching requests: {str(e)}")


@router.get("/analytics/metrics/{metric_id}/history")
async def get_metric_history(
    metric_id: str,
    user: dict = Depends(get_current_user)
):
    """Get audit history for a metric"""
    try:
        # Verify metric exists
        metric_res = supabase_anon.table("campaign_deliverable_metrics") \
            .select("*, campaign_deliverables(campaign_id)") \
            .eq("id", metric_id) \
            .execute()

        if not metric_res.data:
            raise HTTPException(status_code=404, detail="Metric not found")

        # Get audit logs
        audit_res = supabase_anon.table("campaign_deliverable_metric_audit") \
            .select("*, profiles(name)") \
            .eq("campaign_deliverable_metric_id", metric_id) \
            .order("changed_at", desc=True) \
            .execute()

        # Get all updates
        updates_res = supabase_anon.table("campaign_deliverable_metric_updates") \
            .select("*, profiles(name)") \
            .eq("campaign_deliverable_metric_id", metric_id) \
            .order("submitted_at", desc=True) \
            .execute()

        return {
            "audit_logs": audit_res.data or [],
            "updates": updates_res.data or []
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching history: {str(e)}")


@router.get("/analytics/brand/dashboard-stats")
async def get_brand_dashboard_stats(
    brand: dict = Depends(get_current_brand)
):
    """Get comprehensive dashboard statistics for a brand"""
    try:
        brand_id = brand["id"]

        # Get all campaigns
        campaigns_res = supabase_anon.table("campaigns") \
            .select("id, title, status, created_at, budget_min, budget_max") \
            .eq("brand_id", brand_id) \
            .execute()

        campaigns = campaigns_res.data or []

        # Calculate campaign stats
        total_campaigns = len(campaigns)
        active_campaigns = sum(1 for c in campaigns if c.get("status") == "active")
        draft_campaigns = sum(1 for c in campaigns if c.get("status") == "draft")
        completed_campaigns = sum(1 for c in campaigns if c.get("status") == "completed")

        # Calculate total budget
        total_budget = 0
        for campaign in campaigns:
            budget_max = campaign.get("budget_max") or 0
            budget_min = campaign.get("budget_min") or 0
            if budget_max > 0:
                total_budget += budget_max
            elif budget_min > 0:
                total_budget += budget_min

        # Get contracts and proposals
        contracts_res = supabase_anon.table("contracts") \
            .select("id, status, terms, proposals(campaign_id)") \
            .eq("brand_id", brand_id) \
            .execute()

        contracts = contracts_res.data or []
        total_contracts = len(contracts)
        active_contracts = sum(1 for c in contracts if c.get("status") == "active")

        # Get proposals through campaigns
        proposals_res = supabase_anon.table("proposals") \
            .select("id, status, campaign_id, campaigns!inner(brand_id)") \
            .eq("campaigns.brand_id", brand_id) \
            .execute()

        proposals = proposals_res.data or []
        total_proposals = len(proposals)
        accepted_proposals = sum(1 for p in proposals if p.get("status") == "accepted")
        pending_proposals = sum(1 for p in proposals if p.get("status") == "pending")

        # Get deliverables
        campaign_ids = [c["id"] for c in campaigns]
        if campaign_ids:
            deliverables_res = supabase_anon.table("campaign_deliverables") \
                .select("id, platform, campaign_id") \
                .in_("campaign_id", campaign_ids) \
                .execute()
            deliverables = deliverables_res.data or []
        else:
            deliverables = []

        total_deliverables = len(deliverables)

        # Get metrics and updates
        deliverable_ids = [d["id"] for d in deliverables]
        if deliverable_ids:
            metrics_res = supabase_anon.table("campaign_deliverable_metrics") \
                .select("id, campaign_deliverable_id") \
                .in_("campaign_deliverable_id", deliverable_ids) \
                .execute()
            metrics = metrics_res.data or []

            metric_ids = [m["id"] for m in metrics]
            if metric_ids:
                updates_res = supabase_anon.table("campaign_deliverable_metric_updates") \
                    .select("id, value, submitted_at, campaign_deliverable_metric_id") \
                    .in_("campaign_deliverable_metric_id", metric_ids) \
                    .order("submitted_at", desc=True) \
                    .execute()
                updates = updates_res.data or []
            else:
                updates = []
        else:
            metrics = []
            updates = []

        total_metrics = len(metrics)
        metrics_with_updates = len(set(u["campaign_deliverable_metric_id"] for u in updates))

        # Calculate engagement metrics
        total_engagement = sum(float(u.get("value", 0)) for u in updates)
        avg_engagement = total_engagement / len(updates) if updates else 0

        # Platform distribution
        platform_counts = {}
        for deliverable in deliverables:
            platform = deliverable.get("platform", "Unknown")
            platform_counts[platform] = platform_counts.get(platform, 0) + 1

        # Campaign status distribution
        status_distribution = {}
        for campaign in campaigns:
            status = campaign.get("status", "draft")
            status_distribution[status] = status_distribution.get(status, 0) + 1

        # Monthly campaign creation trend (last 6 months)
        from datetime import timedelta
        now = datetime.now(timezone.utc)
        monthly_campaigns = {}
        for i in range(6):
            month_start = (now - timedelta(days=30*i)).replace(day=1, hour=0, minute=0, second=0, microsecond=0)
            month_key = month_start.strftime("%Y-%m")
            monthly_campaigns[month_key] = 0

        for campaign in campaigns:
            created_at = campaign.get("created_at")
            if created_at:
                try:
                    if isinstance(created_at, str):
                        created_dt = datetime.fromisoformat(created_at.replace('Z', '+00:00'))
                    else:
                        created_dt = created_at
                    month_key = created_dt.strftime("%Y-%m")
                    if month_key in monthly_campaigns:
                        monthly_campaigns[month_key] += 1
                except:
                    pass

        # Monthly engagement trend
        monthly_engagement = {}
        for i in range(6):
            month_start = (now - timedelta(days=30*i)).replace(day=1, hour=0, minute=0, second=0, microsecond=0)
            month_key = month_start.strftime("%Y-%m")
            monthly_engagement[month_key] = 0

        for update in updates:
            submitted_at = update.get("submitted_at")
            if submitted_at:
                try:
                    if isinstance(submitted_at, str):
                        submitted_dt = datetime.fromisoformat(submitted_at.replace('Z', '+00:00'))
                    else:
                        submitted_dt = submitted_at
                    month_key = submitted_dt.strftime("%Y-%m")
                    if month_key in monthly_engagement:
                        monthly_engagement[month_key] += float(update.get("value", 0))
                except:
                    pass

        return {
            "overview": {
                "total_campaigns": total_campaigns,
                "active_campaigns": active_campaigns,
                "draft_campaigns": draft_campaigns,
                "completed_campaigns": completed_campaigns,
                "total_contracts": total_contracts,
                "active_contracts": active_contracts,
                "total_proposals": total_proposals,
                "accepted_proposals": accepted_proposals,
                "pending_proposals": pending_proposals,
                "total_deliverables": total_deliverables,
                "total_metrics": total_metrics,
                "metrics_with_updates": metrics_with_updates,
                "total_budget": round(total_budget, 2),
                "total_engagement": round(total_engagement, 2),
                "avg_engagement": round(avg_engagement, 2)
            },
            "platform_distribution": platform_counts,
            "status_distribution": status_distribution,
            "monthly_campaigns": monthly_campaigns,
            "monthly_engagement": monthly_engagement
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching dashboard stats: {str(e)}")


@router.get("/analytics/creator/dashboard-stats")
async def get_creator_dashboard_stats(
    creator: dict = Depends(get_current_creator)
):
    """Get comprehensive dashboard statistics for a creator"""
    try:
        creator_id = creator["id"]

        # Get campaigns from contracts
        contracts_res = supabase_anon.table("contracts") \
            .select("id, status, terms, proposals(campaign_id, campaigns(*))") \
            .eq("creator_id", creator_id) \
            .execute()

        campaign_ids = set()
        campaigns_data = []
        total_earnings = 0

        for contract in contracts_res.data or []:
            if contract.get("proposals"):
                proposals = contract["proposals"] if isinstance(contract["proposals"], list) else [contract["proposals"]]
                for proposal in proposals:
                    if proposal.get("campaigns") and proposal.get("campaign_id"):
                        campaign_id = proposal["campaign_id"]
                        if campaign_id not in campaign_ids:
                            campaign_ids.add(campaign_id)
                            campaign_data = proposal["campaigns"].copy()
                            campaigns_data.append(campaign_data)

                            # Calculate earnings from contract
                            contract_terms = contract.get("terms", {})
                            if isinstance(contract_terms, dict):
                                amount = contract_terms.get("amount") or contract_terms.get("proposed_amount") or 0
                                total_earnings += float(amount) if amount else 0

        # Also get from deals
        deals_res = supabase_anon.table("deals") \
            .select("campaign_id, agreed_amount, campaigns(*)") \
            .eq("creator_id", creator_id) \
            .execute()

        for deal in deals_res.data or []:
            if deal.get("campaigns") and deal.get("campaign_id"):
                campaign_id = deal["campaign_id"]
                if campaign_id not in campaign_ids:
                    campaign_ids.add(campaign_id)
                    campaign_data = deal["campaigns"].copy()
                    campaigns_data.append(campaign_data)
                    total_earnings += float(deal.get("agreed_amount", 0) or 0)

        total_campaigns = len(campaigns_data)
        active_campaigns = sum(1 for c in campaigns_data if c.get("status") == "active")
        completed_campaigns = sum(1 for c in campaigns_data if c.get("status") == "completed")

        # Get contract deliverables
        contract_ids = [c["id"] for c in contracts_res.data or []]
        if contract_ids:
            deliverables_res = supabase_anon.table("contract_deliverables") \
                .select("id, status, campaign_deliverable_id") \
                .in_("contract_id", contract_ids) \
                .execute()
            deliverables = deliverables_res.data or []
        else:
            deliverables = []

        total_deliverables = len(deliverables)
        completed_deliverables = sum(1 for d in deliverables if d.get("status") == "completed")
        pending_deliverables = sum(1 for d in deliverables if d.get("status") == "pending")

        # Get proposals
        proposals_res = supabase_anon.table("proposals") \
            .select("id, status, campaign_id") \
            .eq("creator_id", creator_id) \
            .execute()

        proposals = proposals_res.data or []
        total_proposals = len(proposals)
        accepted_proposals = sum(1 for p in proposals if p.get("status") == "accepted")
        pending_proposals = sum(1 for p in proposals if p.get("status") == "pending")
        rejected_proposals = sum(1 for p in proposals if p.get("status") == "rejected")

        # Get metrics and updates
        deliverable_ids = [d.get("campaign_deliverable_id") for d in deliverables if d.get("campaign_deliverable_id")]
        if deliverable_ids:
            metrics_res = supabase_anon.table("campaign_deliverable_metrics") \
                .select("id, campaign_deliverable_id") \
                .in_("campaign_deliverable_id", deliverable_ids) \
                .execute()
            metrics = metrics_res.data or []

            metric_ids = [m["id"] for m in metrics]
            if metric_ids:
                updates_res = supabase_anon.table("campaign_deliverable_metric_updates") \
                    .select("id, value, submitted_at, campaign_deliverable_metric_id") \
                    .eq("submitted_by", creator_id) \
                    .in_("campaign_deliverable_metric_id", metric_ids) \
                    .order("submitted_at", desc=True) \
                    .execute()
                updates = updates_res.data or []
            else:
                updates = []
        else:
            metrics = []
            updates = []

        total_metrics = len(metrics)
        metrics_submitted = len(set(u["campaign_deliverable_metric_id"] for u in updates))

        # Calculate engagement metrics
        total_engagement = sum(float(u.get("value", 0)) for u in updates)
        avg_engagement = total_engagement / len(updates) if updates else 0

        # Platform distribution from deliverables
        platform_counts = {}
        if deliverable_ids:
            campaign_deliverables_res = supabase_anon.table("campaign_deliverables") \
                .select("id, platform") \
                .in_("id", deliverable_ids) \
                .execute()
            for deliv in campaign_deliverables_res.data or []:
                platform = deliv.get("platform", "Unknown")
                platform_counts[platform] = platform_counts.get(platform, 0) + 1

        # Campaign status distribution
        status_distribution = {}
        for campaign in campaigns_data:
            status = campaign.get("status", "draft")
            status_distribution[status] = status_distribution.get(status, 0) + 1

        # Monthly earnings trend (last 6 months)
        from datetime import timedelta
        now = datetime.now(timezone.utc)
        monthly_earnings = {}
        for i in range(6):
            month_start = (now - timedelta(days=30*i)).replace(day=1, hour=0, minute=0, second=0, microsecond=0)
            month_key = month_start.strftime("%Y-%m")
            monthly_earnings[month_key] = 0

        # Calculate monthly earnings from contracts
        for contract in contracts_res.data or []:
            created_at = contract.get("created_at")
            if created_at:
                try:
                    if isinstance(created_at, str):
                        created_dt = datetime.fromisoformat(created_at.replace('Z', '+00:00'))
                    else:
                        created_dt = created_at
                    month_key = created_dt.strftime("%Y-%m")
                    if month_key in monthly_earnings:
                        contract_terms = contract.get("terms", {})
                        if isinstance(contract_terms, dict):
                            amount = contract_terms.get("amount") or contract_terms.get("proposed_amount") or 0
                            monthly_earnings[month_key] += float(amount) if amount else 0
                except:
                    pass

        # Monthly engagement trend
        monthly_engagement = {}
        for i in range(6):
            month_start = (now - timedelta(days=30*i)).replace(day=1, hour=0, minute=0, second=0, microsecond=0)
            month_key = month_start.strftime("%Y-%m")
            monthly_engagement[month_key] = 0

        for update in updates:
            submitted_at = update.get("submitted_at")
            if submitted_at:
                try:
                    if isinstance(submitted_at, str):
                        submitted_dt = datetime.fromisoformat(submitted_at.replace('Z', '+00:00'))
                    else:
                        submitted_dt = submitted_at
                    month_key = submitted_dt.strftime("%Y-%m")
                    if month_key in monthly_engagement:
                        monthly_engagement[month_key] += float(update.get("value", 0))
                except:
                    pass

        # Deliverable status distribution
        deliverable_status = {}
        for deliverable in deliverables:
            status = deliverable.get("status", "pending")
            deliverable_status[status] = deliverable_status.get(status, 0) + 1

        return {
            "overview": {
                "total_campaigns": total_campaigns,
                "active_campaigns": active_campaigns,
                "completed_campaigns": completed_campaigns,
                "total_proposals": total_proposals,
                "accepted_proposals": accepted_proposals,
                "pending_proposals": pending_proposals,
                "rejected_proposals": rejected_proposals,
                "total_deliverables": total_deliverables,
                "completed_deliverables": completed_deliverables,
                "pending_deliverables": pending_deliverables,
                "total_metrics": total_metrics,
                "metrics_submitted": metrics_submitted,
                "total_earnings": round(total_earnings, 2),
                "total_engagement": round(total_engagement, 2),
                "avg_engagement": round(avg_engagement, 2)
            },
            "platform_distribution": platform_counts,
            "status_distribution": status_distribution,
            "deliverable_status": deliverable_status,
            "monthly_earnings": monthly_earnings,
            "monthly_engagement": monthly_engagement
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching dashboard stats: {str(e)}")

