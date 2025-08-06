from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional, List, Dict
from datetime import datetime
import os
from dotenv import load_dotenv

from ..services.pricing_service import PricingService

load_dotenv()

router = APIRouter(prefix="/api/pricing", tags=["pricing"])

# Pydantic models
class PricingRequest(BaseModel):
    creator_followers: int
    creator_engagement_rate: float
    content_type: str
    campaign_type: str
    platform: str
    duration_weeks: int
    exclusivity_level: str = "none"
    creator_id: Optional[str] = None
    brand_id: Optional[str] = None

class PricingFeedback(BaseModel):
    contract_id: str
    recommended_price: float
    actual_price: float
    satisfaction_score: int  # 1-10
    roi_achieved: float  # Percentage
    repeat_business: bool
    feedback_notes: Optional[str] = None

class PricingRecommendation(BaseModel):
    recommended_price: float
    confidence_score: float
    reasoning: str
    similar_contracts_used: List[Dict]
    market_factors: Dict

# Initialize pricing service
def get_pricing_service():
    return PricingService()

@router.post("/recommendation", response_model=PricingRecommendation)
async def get_pricing_recommendation(
    request: PricingRequest,
    pricing_service: PricingService = Depends(get_pricing_service)
):
    """
    Get AI-powered pricing recommendation based on similar contracts
    """
    try:
        # Validate input parameters
        if request.creator_followers <= 0:
            raise HTTPException(status_code=400, detail="Creator followers must be positive")
        
        if request.creator_engagement_rate < 0 or request.creator_engagement_rate > 100:
            raise HTTPException(status_code=400, detail="Engagement rate must be between 0 and 100")
        
        if request.duration_weeks <= 0:
            raise HTTPException(status_code=400, detail="Duration must be positive")
        
        # Find similar contracts
        similar_contracts = pricing_service.find_similar_contracts(
            creator_followers=request.creator_followers,
            creator_engagement_rate=request.creator_engagement_rate,
            content_type=request.content_type,
            campaign_type=request.campaign_type,
            platform=request.platform,
            duration_weeks=request.duration_weeks,
            exclusivity_level=request.exclusivity_level
        )
        
        # Generate price recommendation
        recommendation = pricing_service.generate_price_recommendation(
            similar_contracts=similar_contracts,
            creator_followers=request.creator_followers,
            creator_engagement_rate=request.creator_engagement_rate,
            content_type=request.content_type,
            campaign_type=request.campaign_type,
            platform=request.platform,
            duration_weeks=request.duration_weeks,
            exclusivity_level=request.exclusivity_level
        )
        
        return recommendation
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating pricing recommendation: {str(e)}")

@router.post("/feedback")
async def submit_pricing_feedback(
    feedback: PricingFeedback,
    pricing_service: PricingService = Depends(get_pricing_service)
):
    """
    Submit feedback on pricing recommendation accuracy
    """
    try:
        # Validate feedback
        if feedback.satisfaction_score < 1 or feedback.satisfaction_score > 10:
            raise HTTPException(status_code=400, detail="Satisfaction score must be between 1 and 10")
        
        if feedback.roi_achieved < 0 or feedback.roi_achieved > 1000:
            raise HTTPException(status_code=400, detail="ROI achieved must be between 0 and 1000")
        
        # Learn from the outcome
        success = pricing_service.learn_from_outcome(
            contract_id=feedback.contract_id,
            recommended_price=feedback.recommended_price,
            actual_price=feedback.actual_price,
            satisfaction_score=feedback.satisfaction_score,
            roi_achieved=feedback.roi_achieved,
            repeat_business=feedback.repeat_business
        )
        
        if not success:
            raise HTTPException(status_code=500, detail="Failed to process feedback")
        
        return {
            "message": "Feedback submitted successfully",
            "contract_id": feedback.contract_id,
            "accuracy_score": pricing_service._calculate_accuracy_score(
                feedback.recommended_price, 
                feedback.actual_price
            )
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error submitting feedback: {str(e)}")

@router.get("/similar-contracts")
async def get_similar_contracts(
    creator_followers: int,
    creator_engagement_rate: float,
    content_type: str,
    platform: str,
    campaign_type: str = "product_launch",
    duration_weeks: int = 4,
    exclusivity_level: str = "none",
    limit: int = 10,
    pricing_service: PricingService = Depends(get_pricing_service)
):
    """
    Get similar contracts for analysis
    """
    try:
        similar_contracts = pricing_service.find_similar_contracts(
            creator_followers=creator_followers,
            creator_engagement_rate=creator_engagement_rate,
            content_type=content_type,
            campaign_type=campaign_type,
            platform=platform,
            duration_weeks=duration_weeks,
            exclusivity_level=exclusivity_level,
            limit=limit
        )
        
        return {
            "similar_contracts": similar_contracts,
            "count": len(similar_contracts),
            "query_params": {
                "creator_followers": creator_followers,
                "creator_engagement_rate": creator_engagement_rate,
                "content_type": content_type,
                "campaign_type": campaign_type,
                "platform": platform,
                "duration_weeks": duration_weeks,
                "exclusivity_level": exclusivity_level
            }
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error finding similar contracts: {str(e)}")

@router.get("/market-analysis")
async def get_market_analysis(
    content_type: str,
    platform: str,
    pricing_service: PricingService = Depends(get_pricing_service)
):
    """
    Get market analysis for specific content type and platform
    """
    try:
        # Get all contracts for the specified content type and platform
        supabase_url = os.getenv("SUPABASE_URL")
        supabase_key = os.getenv("SUPABASE_KEY")
        
        if not supabase_url or not supabase_key:
            raise HTTPException(status_code=500, detail="Database configuration error")
        
        from supabase import create_client
        supabase = create_client(supabase_url, supabase_key)
        
        response = supabase.table("contracts").select(
            "total_budget, creator_followers, creator_engagement_rate, content_type, platform"
        ).eq("content_type", content_type).eq("platform", platform).not_.is_("total_budget", "null").execute()
        
        contracts = response.data
        
        if not contracts:
            return {
                "content_type": content_type,
                "platform": platform,
                "message": "No data available for this combination",
                "analysis": {}
            }
        
        # Calculate market statistics
        prices = [c.get("total_budget", 0) for c in contracts if c.get("total_budget")]
        followers = [c.get("creator_followers", 0) for c in contracts if c.get("creator_followers")]
        engagement_rates = [c.get("creator_engagement_rate", 0) for c in contracts if c.get("creator_engagement_rate")]
        
        analysis = {
            "total_contracts": len(contracts),
            "price_stats": {
                "average": sum(prices) / len(prices) if prices else 0,
                "median": sorted(prices)[len(prices)//2] if prices else 0,
                "min": min(prices) if prices else 0,
                "max": max(prices) if prices else 0
            },
            "follower_stats": {
                "average": sum(followers) / len(followers) if followers else 0,
                "median": sorted(followers)[len(followers)//2] if followers else 0,
                "min": min(followers) if followers else 0,
                "max": max(followers) if followers else 0
            },
            "engagement_stats": {
                "average": sum(engagement_rates) / len(engagement_rates) if engagement_rates else 0,
                "median": sorted(engagement_rates)[len(engagement_rates)//2] if engagement_rates else 0,
                "min": min(engagement_rates) if engagement_rates else 0,
                "max": max(engagement_rates) if engagement_rates else 0
            }
        }
        
        return {
            "content_type": content_type,
            "platform": platform,
            "analysis": analysis
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error analyzing market data: {str(e)}")

@router.get("/test-db")
async def test_database_connection():
    """
    Test database connection and basic query
    """
    try:
        supabase_url = os.getenv("SUPABASE_URL")
        supabase_key = os.getenv("SUPABASE_KEY")
        
        if not supabase_url or not supabase_key:
            raise HTTPException(status_code=500, detail="Database configuration error")
        
        from supabase import create_client
        supabase = create_client(supabase_url, supabase_key)
        
        # Simple query to test connection
        response = supabase.table("contracts").select("id, content_type, platform").limit(5).execute()
        
        return {
            "message": "Database connection successful",
            "contracts_found": len(response.data),
            "sample_data": response.data[:2] if response.data else []
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database connection failed: {str(e)}")

@router.get("/learning-stats")
async def get_learning_statistics(
    pricing_service: PricingService = Depends(get_pricing_service)
):
    """
    Get statistics about the learning system performance
    """
    try:
        supabase_url = os.getenv("SUPABASE_URL")
        supabase_key = os.getenv("SUPABASE_KEY")
        
        if not supabase_url or not supabase_key:
            raise HTTPException(status_code=500, detail="Database configuration error")
        
        from supabase import create_client
        supabase = create_client(supabase_url, supabase_key)
        
        # Get feedback statistics
        feedback_response = supabase.table("pricing_feedback").select("*").execute()
        feedback_data = feedback_response.data
        
        # Get contract outcome statistics
        contracts_response = supabase.table("contracts").select(
            "brand_satisfaction_score, roi_achieved, repeat_business"
        ).not_.is_("brand_satisfaction_score", "null").execute()
        contracts_data = contracts_response.data
        
        stats = {
            "total_feedback_submissions": len(feedback_data),
            "total_contracts_with_outcomes": len(contracts_data),
            "average_accuracy_score": 0,
            "average_satisfaction_score": 0,
            "average_roi_achieved": 0,
            "repeat_business_rate": 0
        }
        
        if feedback_data:
            accuracy_scores = [f.get("price_accuracy_score", 0) for f in feedback_data]
            stats["average_accuracy_score"] = sum(accuracy_scores) / len(accuracy_scores)
        
        if contracts_data:
            satisfaction_scores = [c.get("brand_satisfaction_score", 0) for c in contracts_data if c.get("brand_satisfaction_score")]
            roi_values = [c.get("roi_achieved", 0) for c in contracts_data if c.get("roi_achieved")]
            repeat_business = [c.get("repeat_business", False) for c in contracts_data if c.get("repeat_business") is not None]
            
            if satisfaction_scores:
                stats["average_satisfaction_score"] = sum(satisfaction_scores) / len(satisfaction_scores)
            if roi_values:
                stats["average_roi_achieved"] = sum(roi_values) / len(roi_values)
            if repeat_business:
                stats["repeat_business_rate"] = sum(repeat_business) / len(repeat_business)
        
        return {
            "learning_statistics": stats,
            "system_performance": {
                "data_points": len(feedback_data) + len(contracts_data),
                "learning_active": len(feedback_data) > 0
            }
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting learning statistics: {str(e)}") 