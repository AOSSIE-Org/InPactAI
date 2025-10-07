"""
ROI Analytics API Routes

Provides endpoints for ROI calculations, trend analysis, and target comparisons.
"""

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
from decimal import Decimal
from pydantic import BaseModel

from app.db.db import get_db
from app.models.models import User, Sponsorship
from app.services.roi_service import ROIService, ROIMetrics, ROITrend, ROITarget


router = APIRouter(prefix="/api/roi", tags=["roi-analytics"])


# Request/Response Models
class ROIMetricsResponse(BaseModel):
    campaign_id: str
    total_spend: float
    total_revenue: float
    roi_percentage: float
    cost_per_acquisition: float
    conversions: int
    impressions: int
    reach: int
    engagement_rate: float
    click_through_rate: float
    period_start: str
    period_end: str


class ROITrendResponse(BaseModel):
    period: str
    roi_percentage: float
    spend: float
    revenue: float
    conversions: int
    date: str


class ROITargetResponse(BaseModel):
    target_roi: float
    actual_roi: float
    target_cpa: Optional[float]
    actual_cpa: float
    target_met: bool
    variance_percentage: float


class CampaignROISummaryResponse(BaseModel):
    campaign_id: str
    campaign_title: str
    roi_metrics: ROIMetricsResponse


class PortfolioROIResponse(BaseModel):
    brand_id: str
    portfolio_metrics: ROIMetricsResponse
    campaign_count: int
    top_performing_campaigns: List[CampaignROISummaryResponse]


# Helper function to get current user (placeholder - replace with actual auth)
def get_current_user(db: Session = Depends(get_db)) -> User:
    # TODO: Replace with actual authentication logic
    # For now, return a dummy user for testing
    user = db.query(User).first()
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user


def verify_campaign_access(campaign_id: str, user_id: str, db: Session) -> bool:
    """Verify that user has access to the campaign"""
    campaign = db.query(Sponsorship).filter(Sponsorship.id == campaign_id).first()
    if not campaign:
        # Signal not found distinctly so endpoints can return 404
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Campaign not found")
    
    # Check if user is the brand owner
    if campaign.brand_id == user_id:
        return True
    
    # Check if user has applied to this sponsorship (creator access)
    from app.models.models import SponsorshipApplication
    application = db.query(SponsorshipApplication).filter(
        SponsorshipApplication.sponsorship_id == campaign_id,
        SponsorshipApplication.creator_id == user_id
    ).first()
    
    return application is not None


def convert_roi_metrics_to_response(roi_metrics: ROIMetrics) -> ROIMetricsResponse:
    """Convert ROIMetrics dataclass to response model"""
    return ROIMetricsResponse(
        campaign_id=roi_metrics.campaign_id,
        total_spend=float(roi_metrics.total_spend),
        total_revenue=float(roi_metrics.total_revenue),
        roi_percentage=float(roi_metrics.roi_percentage),
        cost_per_acquisition=float(roi_metrics.cost_per_acquisition),
        conversions=roi_metrics.conversions,
        impressions=roi_metrics.impressions,
        reach=roi_metrics.reach,
        engagement_rate=float(roi_metrics.engagement_rate),
        click_through_rate=float(roi_metrics.click_through_rate),
        period_start=roi_metrics.period_start.isoformat(),
        period_end=roi_metrics.period_end.isoformat()
    )


@router.get("/campaigns/{campaign_id}", response_model=ROIMetricsResponse)
async def get_campaign_roi(
    campaign_id: str,
    days: int = Query(30, ge=1, le=365, description="Number of days to analyze"),
    use_cache: bool = Query(True, description="Whether to use cache for faster response"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get ROI metrics for a specific campaign with caching support"""
    try:
        # Verify user has access to this campaign
        verify_campaign_access(campaign_id, current_user.id, db)
        
        # Calculate date range
        end_date = datetime.now()
        start_date = end_date - timedelta(days=days)
        
        # Get ROI metrics with caching
        roi_service = ROIService(db)
        roi_metrics = await roi_service.calculate_campaign_roi_async(
            campaign_id, start_date, end_date, use_cache
        )
        
        if not roi_metrics:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No ROI data available for this campaign"
            )
        
        return convert_roi_metrics_to_response(roi_metrics)
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to calculate campaign ROI: {str(e)}"
        )


@router.get("/campaigns/{campaign_id}/trends", response_model=List[ROITrendResponse])
async def get_campaign_roi_trends(
    campaign_id: str,
    period_type: str = Query("daily", pattern="^(daily|weekly|monthly)$", description="Period type for trend analysis"),
    num_periods: int = Query(30, ge=1, le=365, description="Number of periods to analyze"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get ROI trends for a campaign over time"""
    try:
        # Verify user has access to this campaign
        verify_campaign_access(campaign_id, current_user.id, db)
        
        # Get ROI trends
        roi_service = ROIService(db)
        trends = roi_service.calculate_roi_trends(campaign_id, period_type, num_periods)
        
        return [
            ROITrendResponse(
                period=trend.period,
                roi_percentage=float(trend.roi_percentage),
                spend=float(trend.spend),
                revenue=float(trend.revenue),
                conversions=trend.conversions,
                date=trend.date.isoformat()
            )
            for trend in trends
        ]
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to calculate ROI trends: {str(e)}"
        )


@router.get("/campaigns/{campaign_id}/targets", response_model=ROITargetResponse)
async def compare_campaign_roi_to_targets(
    campaign_id: str,
    target_roi: float = Query(..., description="Target ROI percentage"),
    target_cpa: Optional[float] = Query(None, description="Target cost per acquisition"),
    days: int = Query(30, ge=1, le=365, description="Number of days to analyze"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Compare campaign ROI performance to targets"""
    try:
        # Verify user has access to this campaign
        if not verify_campaign_access(campaign_id, current_user.id, db):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied to this campaign"
            )
        
        # Calculate date range
        end_date = datetime.now()
        start_date = end_date - timedelta(days=days)
        
        # Compare to targets
        roi_service = ROIService(db)
        target_comparison = roi_service.compare_roi_to_targets(
            campaign_id,
            Decimal(str(target_roi)),
            Decimal(str(target_cpa)) if target_cpa else None,
            start_date,
            end_date
        )
        
        if not target_comparison:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No ROI data available for target comparison"
            )
        
        return ROITargetResponse(
            target_roi=float(target_comparison.target_roi),
            actual_roi=float(target_comparison.actual_roi),
            target_cpa=float(target_comparison.target_cpa) if target_comparison.target_cpa else None,
            actual_cpa=float(target_comparison.actual_cpa),
            target_met=target_comparison.target_met,
            variance_percentage=float(target_comparison.variance_percentage)
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to compare ROI to targets: {str(e)}"
        )


@router.get("/campaigns/summary", response_model=Dict[str, ROIMetricsResponse])
async def get_campaigns_roi_summary(
    campaign_ids: List[str] = Query(..., description="List of campaign IDs to analyze"),
    days: int = Query(30, ge=1, le=365, description="Number of days to analyze"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get ROI summary for multiple campaigns"""
    try:
        # Verify user has access to all campaigns
        for campaign_id in campaign_ids:
            verify_campaign_access(campaign_id, current_user.id, db)
        
        # Calculate date range
        end_date = datetime.now()
        start_date = end_date - timedelta(days=days)
        
        # Get ROI summary
        roi_service = ROIService(db)
        summary = roi_service.get_campaign_roi_summary(campaign_ids, start_date, end_date)
        
        return {
            campaign_id: convert_roi_metrics_to_response(roi_metrics)
            for campaign_id, roi_metrics in summary.items()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get campaigns ROI summary: {str(e)}"
        )


@router.get("/portfolio/{brand_id}", response_model=PortfolioROIResponse)
async def get_brand_portfolio_roi(
    brand_id: str,
    days: int = Query(30, ge=1, le=365, description="Number of days to analyze"),
    include_top_campaigns: int = Query(5, ge=1, le=20, description="Number of top campaigns to include"),
    use_cache: bool = Query(True, description="Whether to use cache for faster response"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get portfolio ROI for all campaigns of a brand with caching support"""
    try:
        # Verify user is the brand owner or has appropriate access
        if current_user.id != brand_id and current_user.role != 'admin':
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied to this brand's portfolio"
            )
        
        # Calculate date range
        end_date = datetime.now()
        start_date = end_date - timedelta(days=days)
        
        # Get portfolio ROI with caching
        roi_service = ROIService(db)
        portfolio_metrics = await roi_service.calculate_portfolio_roi_async(
            brand_id, start_date, end_date, use_cache
        )
        
        if not portfolio_metrics:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No portfolio data available for this brand"
            )
        
        # Get individual campaign ROI for top performers
        campaigns = db.query(Sponsorship).filter(Sponsorship.brand_id == brand_id).all()
        campaign_ids = [c.id for c in campaigns]
        
        # Use optimized summary query
        from app.services.database_optimization_service import db_optimization_service
        campaign_summary_data = db_optimization_service.get_aggregated_campaign_summary(
            db, campaign_ids, start_date, end_date
        )
        
        # Sort campaigns by ROI and get top performers
        sorted_campaigns = sorted(
            campaign_summary_data.items(),
            key=lambda x: (x[1]['total_revenue'] / max(1, x[1]['total_impressions'])) * 100,  # Simple ROI proxy
            reverse=True
        )[:include_top_campaigns]
        
        top_campaigns = []
        for campaign_id, summary_data in sorted_campaigns:
            campaign = next((c for c in campaigns if c.id == campaign_id), None)
            if campaign:
                # Convert summary to ROI metrics format
                roi_metrics = await roi_service.calculate_campaign_roi_async(
                    campaign_id, start_date, end_date, use_cache
                )
                if roi_metrics:
                    top_campaigns.append(CampaignROISummaryResponse(
                        campaign_id=campaign_id,
                        campaign_title=campaign.title,
                        roi_metrics=convert_roi_metrics_to_response(roi_metrics)
                    ))
        
        return PortfolioROIResponse(
            brand_id=brand_id,
            portfolio_metrics=convert_roi_metrics_to_response(portfolio_metrics),
            campaign_count=len(campaigns),
            top_performing_campaigns=top_campaigns
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get portfolio ROI: {str(e)}"
        )


@router.get("/benchmarks")
async def get_roi_benchmarks(
    industry: Optional[str] = Query(None, description="Industry for benchmarks"),
    platform: Optional[str] = Query(None, description="Platform for benchmarks"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get ROI benchmarks for comparison"""
    try:
        # This would typically come from a benchmarks database or external service
        # For now, return industry standard benchmarks
        benchmarks = {
            "general": {
                "average_roi": 4.0,  # 400% ROI
                "good_roi": 6.0,     # 600% ROI
                "excellent_roi": 10.0,  # 1000% ROI
                "average_cpa": 50.0,
                "average_ctr": 2.5,
                "average_engagement_rate": 3.5
            },
            "by_industry": {
                "fashion": {
                    "average_roi": 5.2,
                    "average_cpa": 45.0,
                    "average_ctr": 3.1,
                    "average_engagement_rate": 4.2
                },
                "technology": {
                    "average_roi": 3.8,
                    "average_cpa": 65.0,
                    "average_ctr": 2.1,
                    "average_engagement_rate": 2.8
                },
                "food_beverage": {
                    "average_roi": 4.5,
                    "average_cpa": 40.0,
                    "average_ctr": 2.8,
                    "average_engagement_rate": 5.1
                }
            },
            "by_platform": {
                "instagram": {
                    "average_roi": 4.2,
                    "average_cpa": 48.0,
                    "average_ctr": 2.7,
                    "average_engagement_rate": 4.1
                },
                "youtube": {
                    "average_roi": 3.9,
                    "average_cpa": 55.0,
                    "average_ctr": 2.3,
                    "average_engagement_rate": 3.2
                },
                "tiktok": {
                    "average_roi": 5.8,
                    "average_cpa": 35.0,
                    "average_ctr": 3.5,
                    "average_engagement_rate": 6.2
                }
            }
        }
        
        # Filter by industry or platform if specified
        if industry and industry in benchmarks["by_industry"]:
            return {
                "industry": industry,
                "benchmarks": benchmarks["by_industry"][industry],
                "general_benchmarks": benchmarks["general"]
            }
        
        if platform and platform in benchmarks["by_platform"]:
            return {
                "platform": platform,
                "benchmarks": benchmarks["by_platform"][platform],
                "general_benchmarks": benchmarks["general"]
            }
        
        return {
            "all_benchmarks": benchmarks,
            "note": "Benchmarks are based on industry averages and may vary by specific use case"
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get ROI benchmarks: {str(e)}"
        )