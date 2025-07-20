from fastapi import APIRouter, HTTPException, Depends, Query
from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from ..db.db import AsyncSessionLocal
from ..models.models import (
    User, Sponsorship, BrandProfile, CampaignMetrics, 
    Contract, CreatorMatch, SponsorshipApplication
)
from ..schemas.schema import (
    BrandProfileCreate, BrandProfileUpdate, BrandProfileResponse,
    CampaignMetricsCreate, CampaignMetricsResponse,
    ContractCreate, ContractUpdate, ContractResponse,
    CreatorMatchResponse, DashboardOverviewResponse,
    CampaignAnalyticsResponse, CreatorMatchAnalyticsResponse,
    SponsorshipApplicationResponse, ApplicationUpdateRequest, ApplicationSummaryResponse,
    PaymentResponse, PaymentStatusUpdate, PaymentAnalyticsResponse,
    CampaignMetricsUpdate
)

import os
from supabase import create_client, Client
from dotenv import load_dotenv
import uuid
from datetime import datetime, timezone
import logging

# Load environment variables
load_dotenv()
url: str = os.getenv("SUPABASE_URL")
key: str = os.getenv("SUPABASE_KEY")
supabase: Client = create_client(url, key)

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Define Router
router = APIRouter(prefix="/api/brand", tags=["Brand Dashboard"])

# Helper Functions
def generate_uuid():
    return str(uuid.uuid4())

def current_timestamp():
    return datetime.now(timezone.utc).isoformat()

# Security Helper Functions
def validate_brand_access(brand_id: str, current_user_id: str):
    """Validate that the current user can access the brand data"""
    if brand_id != current_user_id:
        raise HTTPException(status_code=403, detail="Access denied: You can only access your own data")
    return True

def require_brand_role(user_role: str):
    """Ensure user has brand role"""
    if user_role != "brand":
        raise HTTPException(status_code=403, detail="Access denied: Brand role required")
    return True

def validate_uuid_format(id_value: str, field_name: str = "ID"):
    """Validate UUID format"""
    if not id_value or len(id_value) != 36:
        raise HTTPException(status_code=400, detail=f"Invalid {field_name} format")
    return True

def safe_supabase_query(query_func, error_message: str = "Database operation failed"):
    """Safely execute Supabase queries with proper error handling"""
    try:
        result = query_func()
        return result.data if result.data else []
    except Exception as e:
        logger.error(f"Supabase error in {error_message}: {e}")
        raise HTTPException(status_code=500, detail=error_message)

# Simple in-memory rate limiting (for development)
request_counts = {}

def check_rate_limit(user_id: str, max_requests: int = 100, window_seconds: int = 60):
    """Simple rate limiting check (in production, use Redis)"""
    current_time = datetime.now(timezone.utc)
    key = f"{user_id}:{current_time.minute}"
    
    if key not in request_counts:
        request_counts[key] = 0
    
    request_counts[key] += 1
    
    if request_counts[key] > max_requests:
        raise HTTPException(status_code=429, detail="Rate limit exceeded")
    
    return True

# ============================================================================
# DASHBOARD OVERVIEW ROUTES
# ============================================================================

@router.get("/dashboard/overview", response_model=DashboardOverviewResponse)
async def get_dashboard_overview(brand_id: str = Query(..., description="Brand user ID")):
    """
    Get dashboard overview with key metrics for a brand
    """
    # Validate brand_id format
    validate_uuid_format(brand_id, "brand_id")
    
    try:
        # Get brand's campaigns
        campaigns = safe_supabase_query(
            lambda: supabase.table("sponsorships").select("*").eq("brand_id", brand_id).execute(),
            "Failed to fetch campaigns"
        )
        
        # Get brand's profile
        profile_result = supabase.table("brand_profiles").select("*").eq("user_id", brand_id).execute()
        profile = profile_result.data[0] if profile_result.data else None
        
        # Get recent applications (only if campaigns exist)
        applications = []
        if campaigns:
            campaign_ids = [campaign["id"] for campaign in campaigns]
            applications = safe_supabase_query(
                lambda: supabase.table("sponsorship_applications").select("*").in_("sponsorship_id", campaign_ids).execute(),
                "Failed to fetch applications"
            )
        
        # Calculate metrics
        total_campaigns = len(campaigns)
        active_campaigns = len([c for c in campaigns if c.get("status") == "open"])
        
        # Calculate total revenue from completed payments
        payments = safe_supabase_query(
            lambda: supabase.table("sponsorship_payments").select("*").eq("brand_id", brand_id).eq("status", "completed").execute(),
            "Failed to fetch payments"
        )
        total_revenue = sum(float(payment.get("amount", 0)) for payment in payments)
        
        # Get creator matches
        matches = safe_supabase_query(
            lambda: supabase.table("creator_matches").select("*").eq("brand_id", brand_id).execute(),
            "Failed to fetch creator matches"
        )
        total_creators_matched = len(matches)
        
        # Recent activity (last 5 applications)
        recent_activity = applications[:5] if applications else []
        
        return DashboardOverviewResponse(
            total_campaigns=total_campaigns,
            active_campaigns=active_campaigns,
            total_revenue=total_revenue,
            total_creators_matched=total_creators_matched,
            recent_activity=recent_activity
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error in dashboard overview: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

# ============================================================================
# BRAND PROFILE ROUTES
# ============================================================================

@router.post("/profile", response_model=BrandProfileResponse)
async def create_brand_profile(profile: BrandProfileCreate):
    """
    Create a new brand profile
    """
    try:
        profile_id = generate_uuid()
        t = current_timestamp()
        
        response = supabase.table("brand_profiles").insert({
            "id": profile_id,
            "user_id": profile.user_id,
            "company_name": profile.company_name,
            "website": profile.website,
            "industry": profile.industry,
            "contact_person": profile.contact_person,
            "contact_email": profile.contact_email,
            "created_at": t
        }).execute()
        
        if response.data:
            return BrandProfileResponse(**response.data[0])
        else:
            raise HTTPException(status_code=400, detail="Failed to create brand profile")
            
    except Exception as e:
        logger.error(f"Error creating brand profile: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.get("/profile/{user_id}", response_model=BrandProfileResponse)
async def get_brand_profile(user_id: str):
    """
    Get brand profile by user ID
    """
    try:
        result = supabase.table("brand_profiles").select("*").eq("user_id", user_id).execute()
        
        if result.data:
            return BrandProfileResponse(**result.data[0])
        else:
            raise HTTPException(status_code=404, detail="Brand profile not found")
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching brand profile: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.put("/profile/{user_id}", response_model=BrandProfileResponse)
async def update_brand_profile(user_id: str, profile_update: BrandProfileUpdate):
    """
    Update brand profile
    """
    try:
        update_data = profile_update.dict(exclude_unset=True)
        
        response = supabase.table("brand_profiles").update(update_data).eq("user_id", user_id).execute()
        
        if response.data:
            return BrandProfileResponse(**response.data[0])
        else:
            raise HTTPException(status_code=404, detail="Brand profile not found")
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating brand profile: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

# ============================================================================
# CAMPAIGN MANAGEMENT ROUTES
# ============================================================================

@router.get("/campaigns")
async def get_brand_campaigns(brand_id: str = Query(..., description="Brand user ID")):
    """
    Get all campaigns for a brand
    """
    # Validate brand_id format
    validate_uuid_format(brand_id, "brand_id")
    
    campaigns = safe_supabase_query(
        lambda: supabase.table("sponsorships").select("*").eq("brand_id", brand_id).execute(),
        "Failed to fetch brand campaigns"
    )
    
    return campaigns

@router.get("/campaigns/{campaign_id}")
async def get_campaign_details(campaign_id: str, brand_id: str = Query(..., description="Brand user ID")):
    """
    Get specific campaign details
    """
    # Validate IDs format
    validate_uuid_format(campaign_id, "campaign_id")
    validate_uuid_format(brand_id, "brand_id")
    
    try:
        result = supabase.table("sponsorships").select("*").eq("id", campaign_id).eq("brand_id", brand_id).execute()
        
        if result.data:
            return result.data[0]
        else:
            raise HTTPException(status_code=404, detail="Campaign not found")
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching campaign details: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.post("/campaigns")
async def create_campaign(campaign: SponsorshipCreate):
    """
    Create a new campaign
    """
    # Validate brand_id format
    validate_uuid_format(campaign.brand_id, "brand_id")
    
    # Additional business logic validation
    if campaign.budget and campaign.budget < 0:
        raise HTTPException(status_code=400, detail="Budget cannot be negative")
    
    if campaign.engagement_minimum and campaign.engagement_minimum < 0:
        raise HTTPException(status_code=400, detail="Engagement minimum cannot be negative")
    
    try:
        campaign_id = generate_uuid()
        t = current_timestamp()
        
        response = supabase.table("sponsorships").insert({
            "id": campaign_id,
            "brand_id": campaign.brand_id,
            "title": campaign.title,
            "description": campaign.description,
            "required_audience": campaign.required_audience,
            "budget": campaign.budget,
            "engagement_minimum": campaign.engagement_minimum,
            "status": "open",
            "created_at": t
        }).execute()
        
        if response.data:
            return response.data[0]
        else:
            raise HTTPException(status_code=400, detail="Failed to create campaign")
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creating campaign: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.put("/campaigns/{campaign_id}")
async def update_campaign(campaign_id: str, campaign_update: dict, brand_id: str = Query(..., description="Brand user ID")):
    """
    Update campaign details
    """
    try:
        # Verify campaign belongs to brand
        existing = supabase.table("sponsorships").select("*").eq("id", campaign_id).eq("brand_id", brand_id).execute()
        if not existing.data:
            raise HTTPException(status_code=404, detail="Campaign not found")
        
        response = supabase.table("sponsorships").update(campaign_update).eq("id", campaign_id).execute()
        
        if response.data:
            return response.data[0]
        else:
            raise HTTPException(status_code=400, detail="Failed to update campaign")
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating campaign: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.delete("/campaigns/{campaign_id}")
async def delete_campaign(campaign_id: str, brand_id: str = Query(..., description="Brand user ID")):
    """
    Delete a campaign
    """
    try:
        # Verify campaign belongs to brand
        existing = supabase.table("sponsorships").select("*").eq("id", campaign_id).eq("brand_id", brand_id).execute()
        if not existing.data:
            raise HTTPException(status_code=404, detail="Campaign not found")
        
        response = supabase.table("sponsorships").delete().eq("id", campaign_id).execute()
        
        return {"message": "Campaign deleted successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting campaign: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

# ============================================================================
# CREATOR MATCHING ROUTES
# ============================================================================

@router.get("/creators/matches", response_model=List[CreatorMatchResponse])
async def get_creator_matches(brand_id: str = Query(..., description="Brand user ID")):
    """
    Get AI-matched creators for a brand
    """
    # Validate brand_id format
    validate_uuid_format(brand_id, "brand_id")
    
    try:
        result = supabase.table("creator_matches").select("*").eq("brand_id", brand_id).order("match_score", desc=True).execute()
        
        matches = []
        if result.data:
            for match in result.data:
                # Get creator details
                creator_result = supabase.table("users").select("*").eq("id", match["creator_id"]).execute()
                if creator_result.data:
                    creator = creator_result.data[0]
                    match["creator_name"] = creator.get("username", "Unknown")
                    match["creator_role"] = creator.get("role", "creator")
                
                matches.append(CreatorMatchResponse(**match))
        
        return matches
        
    except Exception as e:
        logger.error(f"Error fetching creator matches: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.get("/creators/search")
async def search_creators(
    brand_id: str = Query(..., description="Brand user ID"),
    industry: Optional[str] = Query(None, description="Industry filter"),
    min_engagement: Optional[float] = Query(None, description="Minimum engagement rate"),
    location: Optional[str] = Query(None, description="Location filter")
):
    """
    Search for creators based on criteria
    """
    try:
        # Get all creators
        creators_result = supabase.table("users").select("*").eq("role", "creator").execute()
        creators = creators_result.data if creators_result.data else []
        
        # Get audience insights for filtering
        insights_result = supabase.table("audience_insights").select("*").execute()
        insights = insights_result.data if insights_result.data else []
        
        # Create insights lookup
        insights_lookup = {insight["user_id"]: insight for insight in insights}
        
        # Filter creators based on criteria
        filtered_creators = []
        for creator in creators:
            creator_insights = insights_lookup.get(creator["id"])
            
            # Apply filters
            if min_engagement and creator_insights:
                if creator_insights.get("engagement_rate", 0) < min_engagement:
                    continue
            
            # Add creator with insights
            creator_data = {
                **creator,
                "audience_insights": creator_insights
            }
            filtered_creators.append(creator_data)
        
        return filtered_creators
        
    except Exception as e:
        logger.error(f"Error searching creators: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.get("/creators/{creator_id}/profile")
async def get_creator_profile(creator_id: str, brand_id: str = Query(..., description="Brand user ID")):
    """
    Get detailed creator profile
    """
    try:
        # Get creator details
        creator_result = supabase.table("users").select("*").eq("id", creator_id).eq("role", "creator").execute()
        if not creator_result.data:
            raise HTTPException(status_code=404, detail="Creator not found")
        
        creator = creator_result.data[0]
        
        # Get creator's audience insights
        insights_result = supabase.table("audience_insights").select("*").eq("user_id", creator_id).execute()
        insights = insights_result.data[0] if insights_result.data else None
        
        # Get creator's posts
        posts_result = supabase.table("user_posts").select("*").eq("user_id", creator_id).execute()
        posts = posts_result.data if posts_result.data else []
        
        # Calculate match score (simplified algorithm)
        match_score = 0.85  # Placeholder - would implement actual AI matching
        
        return {
            "creator": creator,
            "audience_insights": insights,
            "posts": posts,
            "match_score": match_score
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching creator profile: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

# ============================================================================
# ANALYTICS ROUTES
# ============================================================================

@router.get("/analytics/performance")
async def get_campaign_performance(brand_id: str = Query(..., description="Brand user ID")):
    """
    Get campaign performance analytics
    """
    try:
        # Get brand's campaigns
        campaigns_result = supabase.table("sponsorships").select("*").eq("brand_id", brand_id).execute()
        campaigns = campaigns_result.data if campaigns_result.data else []
        
        # Get campaign metrics
        metrics_result = supabase.table("campaign_metrics").select("*").execute()
        metrics = metrics_result.data if metrics_result.data else []
        
        # Create metrics lookup
        metrics_lookup = {metric["campaign_id"]: metric for metric in metrics}
        
        # Calculate performance for each campaign
        performance_data = []
        for campaign in campaigns:
            campaign_metrics = metrics_lookup.get(campaign["id"], {})
            
            performance = {
                "campaign_id": campaign["id"],
                "campaign_title": campaign["title"],
                "impressions": campaign_metrics.get("impressions", 0),
                "clicks": campaign_metrics.get("clicks", 0),
                "conversions": campaign_metrics.get("conversions", 0),
                "revenue": float(campaign_metrics.get("revenue", 0)),
                "engagement_rate": campaign_metrics.get("engagement_rate", 0),
                "roi": 0.0  # Calculate ROI based on budget and revenue
            }
            
            # Calculate ROI
            if campaign.get("budget") and performance["revenue"]:
                performance["roi"] = (performance["revenue"] - float(campaign["budget"])) / float(campaign["budget"]) * 100
            
            performance_data.append(performance)
        
        return performance_data
        
    except Exception as e:
        logger.error(f"Error fetching campaign performance: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.get("/analytics/revenue")
async def get_revenue_analytics(brand_id: str = Query(..., description="Brand user ID")):
    """
    Get revenue analytics
    """
    try:
        # Get completed payments
        payments_result = supabase.table("sponsorship_payments").select("*").eq("brand_id", brand_id).eq("status", "completed").execute()
        payments = payments_result.data if payments_result.data else []
        
        # Calculate revenue metrics
        total_revenue = sum(float(payment.get("amount", 0)) for payment in payments)
        avg_payment = total_revenue / len(payments) if payments else 0
        
        # Get pending payments
        pending_result = supabase.table("sponsorship_payments").select("*").eq("brand_id", brand_id).eq("status", "pending").execute()
        pending_payments = pending_result.data if pending_result.data else []
        pending_revenue = sum(float(payment.get("amount", 0)) for payment in pending_payments)
        
        return {
            "total_revenue": total_revenue,
            "average_payment": avg_payment,
            "pending_revenue": pending_revenue,
            "total_payments": len(payments),
            "pending_payments": len(pending_payments)
        }
        
    except Exception as e:
        logger.error(f"Error fetching revenue analytics: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

# ============================================================================
# CONTRACT MANAGEMENT ROUTES
# ============================================================================

@router.get("/contracts")
async def get_brand_contracts(brand_id: str = Query(..., description="Brand user ID")):
    """
    Get all contracts for a brand
    """
    try:
        result = supabase.table("contracts").select("*").eq("brand_id", brand_id).execute()
        return result.data if result.data else []
        
    except Exception as e:
        logger.error(f"Error fetching brand contracts: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.post("/contracts")
async def create_contract(contract: ContractCreate):
    """
    Create a new contract
    """
    try:
        contract_id = generate_uuid()
        t = current_timestamp()
        
        response = supabase.table("contracts").insert({
            "id": contract_id,
            "sponsorship_id": contract.sponsorship_id,
            "creator_id": contract.creator_id,
            "brand_id": contract.brand_id,
            "contract_url": contract.contract_url,
            "status": contract.status,
            "created_at": t
        }).execute()
        
        if response.data:
            return response.data[0]
        else:
            raise HTTPException(status_code=400, detail="Failed to create contract")
            
    except Exception as e:
        logger.error(f"Error creating contract: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.put("/contracts/{contract_id}/status")
async def update_contract_status(
    contract_id: str, 
    status: str = Query(..., description="New contract status"),
    brand_id: str = Query(..., description="Brand user ID")
):
    """
    Update contract status
    """
    try:
        # Verify contract belongs to brand
        existing = supabase.table("contracts").select("*").eq("id", contract_id).eq("brand_id", brand_id).execute()
        if not existing.data:
            raise HTTPException(status_code=404, detail="Contract not found")
        
        response = supabase.table("contracts").update({"status": status}).eq("id", contract_id).execute()
        
        if response.data:
            return response.data[0]
        else:
            raise HTTPException(status_code=400, detail="Failed to update contract status")
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating contract status: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")


# ============================================================================
# APPLICATION MANAGEMENT ROUTES
# ============================================================================

@router.get("/applications", response_model=List[SponsorshipApplicationResponse])
async def get_brand_applications(brand_id: str = Query(..., description="Brand user ID")):
    """
    Get all applications for brand's campaigns
    """
    # Validate brand_id format
    validate_uuid_format(brand_id, "brand_id")
    
    try:
        # Get brand's campaigns first
        campaigns = safe_supabase_query(
            lambda: supabase.table("sponsorships").select("*").eq("brand_id", brand_id).execute(),
            "Failed to fetch campaigns"
        )
        
        if not campaigns:
            return []
        
        # Get applications for these campaigns
        campaign_ids = [campaign["id"] for campaign in campaigns]
        applications = safe_supabase_query(
            lambda: supabase.table("sponsorship_applications").select("*").in_("sponsorship_id", campaign_ids).execute(),
            "Failed to fetch applications"
        )
        
        # Enhance applications with creator and campaign details
        enhanced_applications = []
        for application in applications:
            # Get creator details
            creator_result = supabase.table("users").select("*").eq("id", application["creator_id"]).execute()
            creator = creator_result.data[0] if creator_result.data else None
            
            # Get campaign details
            campaign_result = supabase.table("sponsorships").select("*").eq("id", application["sponsorship_id"]).execute()
            campaign = campaign_result.data[0] if campaign_result.data else None
            
            enhanced_application = {
                **application,
                "creator": creator,
                "campaign": campaign
            }
            enhanced_applications.append(enhanced_application)
        
        return enhanced_applications
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching brand applications: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.get("/applications/{application_id}", response_model=SponsorshipApplicationResponse)
async def get_application_details(application_id: str, brand_id: str = Query(..., description="Brand user ID")):
    """
    Get specific application details
    """
    # Validate IDs format
    validate_uuid_format(application_id, "application_id")
    validate_uuid_format(brand_id, "brand_id")
    
    try:
        # Get application
        application_result = supabase.table("sponsorship_applications").select("*").eq("id", application_id).execute()
        if not application_result.data:
            raise HTTPException(status_code=404, detail="Application not found")
        
        application = application_result.data[0]
        
        # Verify this application belongs to brand's campaign
        campaign_result = supabase.table("sponsorships").select("*").eq("id", application["sponsorship_id"]).eq("brand_id", brand_id).execute()
        if not campaign_result.data:
            raise HTTPException(status_code=403, detail="Access denied: Application not found in your campaigns")
        
        # Get creator details
        creator_result = supabase.table("users").select("*").eq("id", application["creator_id"]).execute()
        creator = creator_result.data[0] if creator_result.data else None
        
        # Get campaign details
        campaign = campaign_result.data[0]
        
        enhanced_application = {
            **application,
            "creator": creator,
            "campaign": campaign
        }
        
        return enhanced_application
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching application details: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.put("/applications/{application_id}")
async def update_application_status(
    application_id: str, 
    update_data: ApplicationUpdateRequest,
    brand_id: str = Query(..., description="Brand user ID")
):
    """
    Update application status (accept/reject)
    """
    # Validate IDs format
    validate_uuid_format(application_id, "application_id")
    validate_uuid_format(brand_id, "brand_id")
    
    try:
        # Verify application belongs to brand's campaign
        application_result = supabase.table("sponsorship_applications").select("*").eq("id", application_id).execute()
        if not application_result.data:
            raise HTTPException(status_code=404, detail="Application not found")
        
        application = application_result.data[0]
        campaign_result = supabase.table("sponsorships").select("*").eq("id", application["sponsorship_id"]).eq("brand_id", brand_id).execute()
        if not campaign_result.data:
            raise HTTPException(status_code=403, detail="Access denied: Application not found in your campaigns")
        
        # Update application status
        update_payload = {"status": update_data.status}
        if update_data.notes:
            update_payload["notes"] = update_data.notes
        
        response = supabase.table("sponsorship_applications").update(update_payload).eq("id", application_id).execute()
        
        if response.data:
            return response.data[0]
        else:
            raise HTTPException(status_code=400, detail="Failed to update application")
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating application status: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.get("/applications/summary", response_model=ApplicationSummaryResponse)
async def get_applications_summary(brand_id: str = Query(..., description="Brand user ID")):
    """
    Get applications summary and statistics
    """
    # Validate brand_id format
    validate_uuid_format(brand_id, "brand_id")
    
    try:
        # Get all applications for brand's campaigns
        applications = await get_brand_applications(brand_id)
        
        # Calculate summary
        total_applications = len(applications)
        pending_applications = len([app for app in applications if app["status"] == "pending"])
        accepted_applications = len([app for app in applications if app["status"] == "accepted"])
        rejected_applications = len([app for app in applications if app["status"] == "rejected"])
        
        # Group by campaign
        applications_by_campaign = {}
        for app in applications:
            campaign_title = app.get("campaign", {}).get("title", "Unknown Campaign")
            applications_by_campaign[campaign_title] = applications_by_campaign.get(campaign_title, 0) + 1
        
        # Recent applications (last 5)
        recent_applications = applications[:5] if applications else []
        
        return ApplicationSummaryResponse(
            total_applications=total_applications,
            pending_applications=pending_applications,
            accepted_applications=accepted_applications,
            rejected_applications=rejected_applications,
            applications_by_campaign=applications_by_campaign,
            recent_applications=recent_applications
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching applications summary: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")


# ============================================================================
# PAYMENT MANAGEMENT ROUTES
# ============================================================================

@router.get("/payments", response_model=List[PaymentResponse])
async def get_brand_payments(brand_id: str = Query(..., description="Brand user ID")):
    """
    Get all payments for brand
    """
    # Validate brand_id format
    validate_uuid_format(brand_id, "brand_id")
    
    try:
        payments = safe_supabase_query(
            lambda: supabase.table("sponsorship_payments").select("*").eq("brand_id", brand_id).execute(),
            "Failed to fetch payments"
        )
        
        # Enhance payments with creator and campaign details
        enhanced_payments = []
        for payment in payments:
            # Get creator details
            creator_result = supabase.table("users").select("*").eq("id", payment["creator_id"]).execute()
            creator = creator_result.data[0] if creator_result.data else None
            
            # Get campaign details
            campaign_result = supabase.table("sponsorships").select("*").eq("id", payment["sponsorship_id"]).execute()
            campaign = campaign_result.data[0] if campaign_result.data else None
            
            enhanced_payment = {
                **payment,
                "creator": creator,
                "campaign": campaign
            }
            enhanced_payments.append(enhanced_payment)
        
        return enhanced_payments
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching brand payments: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.get("/payments/{payment_id}", response_model=PaymentResponse)
async def get_payment_details(payment_id: str, brand_id: str = Query(..., description="Brand user ID")):
    """
    Get specific payment details
    """
    # Validate IDs format
    validate_uuid_format(payment_id, "payment_id")
    validate_uuid_format(brand_id, "brand_id")
    
    try:
        payment_result = supabase.table("sponsorship_payments").select("*").eq("id", payment_id).eq("brand_id", brand_id).execute()
        if not payment_result.data:
            raise HTTPException(status_code=404, detail="Payment not found")
        
        payment = payment_result.data[0]
        
        # Get creator details
        creator_result = supabase.table("users").select("*").eq("id", payment["creator_id"]).execute()
        creator = creator_result.data[0] if creator_result.data else None
        
        # Get campaign details
        campaign_result = supabase.table("sponsorships").select("*").eq("id", payment["sponsorship_id"]).execute()
        campaign = campaign_result.data[0] if campaign_result.data else None
        
        enhanced_payment = {
            **payment,
            "creator": creator,
            "campaign": campaign
        }
        
        return enhanced_payment
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching payment details: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.put("/payments/{payment_id}/status")
async def update_payment_status(
    payment_id: str,
    status_update: PaymentStatusUpdate,
    brand_id: str = Query(..., description="Brand user ID")
):
    """
    Update payment status
    """
    # Validate IDs format
    validate_uuid_format(payment_id, "payment_id")
    validate_uuid_format(brand_id, "brand_id")
    
    try:
        # Verify payment belongs to brand
        payment_result = supabase.table("sponsorship_payments").select("*").eq("id", payment_id).eq("brand_id", brand_id).execute()
        if not payment_result.data:
            raise HTTPException(status_code=404, detail="Payment not found")
        
        # Update payment status
        response = supabase.table("sponsorship_payments").update({"status": status_update.status}).eq("id", payment_id).execute()
        
        if response.data:
            return response.data[0]
        else:
            raise HTTPException(status_code=400, detail="Failed to update payment status")
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating payment status: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.get("/payments/analytics", response_model=PaymentAnalyticsResponse)
async def get_payment_analytics(brand_id: str = Query(..., description="Brand user ID")):
    """
    Get payment analytics
    """
    # Validate brand_id format
    validate_uuid_format(brand_id, "brand_id")
    
    try:
        payments = await get_brand_payments(brand_id)
        
        # Calculate analytics
        total_payments = len(payments)
        completed_payments = len([p for p in payments if p["status"] == "completed"])
        pending_payments = len([p for p in payments if p["status"] == "pending"])
        total_amount = sum(float(p["amount"]) for p in payments if p["status"] == "completed")
        average_payment = total_amount / completed_payments if completed_payments > 0 else 0
        
        # Group by month (simplified)
        payments_by_month = {}
        for payment in payments:
            if payment["status"] == "completed":
                month = payment["transaction_date"][:7] if payment["transaction_date"] else "unknown"
                payments_by_month[month] = payments_by_month.get(month, 0) + float(payment["amount"])
        
        return PaymentAnalyticsResponse(
            total_payments=total_payments,
            completed_payments=completed_payments,
            pending_payments=pending_payments,
            total_amount=total_amount,
            average_payment=average_payment,
            payments_by_month=payments_by_month
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching payment analytics: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")


# ============================================================================
# CAMPAIGN METRICS MANAGEMENT ROUTES
# ============================================================================

@router.post("/campaigns/{campaign_id}/metrics")
async def add_campaign_metrics(
    campaign_id: str,
    metrics: CampaignMetricsUpdate,
    brand_id: str = Query(..., description="Brand user ID")
):
    """
    Add metrics to a campaign
    """
    # Validate IDs format
    validate_uuid_format(campaign_id, "campaign_id")
    validate_uuid_format(brand_id, "brand_id")
    
    try:
        # Verify campaign belongs to brand
        campaign_result = supabase.table("sponsorships").select("*").eq("id", campaign_id).eq("brand_id", brand_id).execute()
        if not campaign_result.data:
            raise HTTPException(status_code=404, detail="Campaign not found")
        
        # Create metrics record
        metrics_id = generate_uuid()
        t = current_timestamp()
        
        metrics_data = {
            "id": metrics_id,
            "campaign_id": campaign_id,
            "impressions": metrics.impressions,
            "clicks": metrics.clicks,
            "conversions": metrics.conversions,
            "revenue": metrics.revenue,
            "engagement_rate": metrics.engagement_rate,
            "recorded_at": t
        }
        
        response = supabase.table("campaign_metrics").insert(metrics_data).execute()
        
        if response.data:
            return response.data[0]
        else:
            raise HTTPException(status_code=400, detail="Failed to add campaign metrics")
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error adding campaign metrics: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.get("/campaigns/{campaign_id}/metrics")
async def get_campaign_metrics(campaign_id: str, brand_id: str = Query(..., description="Brand user ID")):
    """
    Get metrics for a specific campaign
    """
    # Validate IDs format
    validate_uuid_format(campaign_id, "campaign_id")
    validate_uuid_format(brand_id, "brand_id")
    
    try:
        # Verify campaign belongs to brand
        campaign_result = supabase.table("sponsorships").select("*").eq("id", campaign_id).eq("brand_id", brand_id).execute()
        if not campaign_result.data:
            raise HTTPException(status_code=404, detail="Campaign not found")
        
        # Get campaign metrics
        metrics = safe_supabase_query(
            lambda: supabase.table("campaign_metrics").select("*").eq("campaign_id", campaign_id).execute(),
            "Failed to fetch campaign metrics"
        )
        
        return metrics
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching campaign metrics: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.put("/campaigns/{campaign_id}/metrics/{metrics_id}")
async def update_campaign_metrics(
    campaign_id: str,
    metrics_id: str,
    metrics_update: CampaignMetricsUpdate,
    brand_id: str = Query(..., description="Brand user ID")
):
    """
    Update campaign metrics
    """
    # Validate IDs format
    validate_uuid_format(campaign_id, "campaign_id")
    validate_uuid_format(metrics_id, "metrics_id")
    validate_uuid_format(brand_id, "brand_id")
    
    try:
        # Verify campaign belongs to brand
        campaign_result = supabase.table("sponsorships").select("*").eq("id", campaign_id).eq("brand_id", brand_id).execute()
        if not campaign_result.data:
            raise HTTPException(status_code=404, detail="Campaign not found")
        
        # Update metrics
        update_data = metrics_update.dict(exclude_unset=True)
        response = supabase.table("campaign_metrics").update(update_data).eq("id", metrics_id).eq("campaign_id", campaign_id).execute()
        
        if response.data:
            return response.data[0]
        else:
            raise HTTPException(status_code=404, detail="Metrics not found")
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating campaign metrics: {e}")
        raise HTTPException(status_code=500, detail="Internal server error") 