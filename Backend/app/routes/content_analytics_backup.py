from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
from pydantic import BaseModel

from app.db.db import get_db
from app.models.models import User, ContractContentMapping, ContentAnalytics, Sponsorship
from app.services.content_linking_service import content_linking_service
from app.services.data_ingestion_service import data_ingestion_service
from app.services.scheduled_sync_service import scheduled_sync_service


router = APIRouter(prefix="/api", tags=["content-analytics"])


# Request/Response Models
class LinkContentRequest(BaseModel):
    content_url: str


class LinkContentResponse(BaseModel):
    success: bool
    message: str
    content_mapping_id: Optional[str] = None


class ContentPreviewResponse(BaseModel):
    title: Optional[str]
    thumbnail: Optional[str]
    description: Optional[str]
    platform: str
    content_type: str
    is_valid: bool


class LinkedContentResponse(BaseModel):
    id: str
    platform: str
    content_id: str
    content_url: str
    content_type: str
    content_title: Optional[str]
    content_thumbnail: Optional[str]
    linked_at: str
    user_id: str


class SyncResponse(BaseModel):
    success: bool
    message: str
    results: Optional[Dict] = None


# Helper function to get current user (placeholder - replace with actual auth)
async def get_current_user(db: AsyncSession = Depends(get_db)) -> User:
    # TODO: Replace with actual authentication logic
    # For now, return a dummy user for testing
    result = await db.execute(select(User))
    user = result.scalars().first()
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user


async def verify_contract_access(contract_id: str, user_id: str, db: AsyncSession) -> bool:
    """Verify that user has access to the contract"""
    result = await db.execute(select(Sponsorship).where(Sponsorship.id == contract_id))
    contract = result.scalars().first()
    if not contract:
        return False
    
    # Check if user is the brand owner or has applied to this sponsorship
    if contract.brand_id == user_id:
        return True
    
    # Check if user has applied to this sponsorship (creator access)
    from app.models.models import SponsorshipApplication
    result = await db.execute(
        select(SponsorshipApplication).where(
            SponsorshipApplication.sponsorship_id == contract_id,
            SponsorshipApplication.creator_id == user_id
        )
    )
    application = result.scalars().first()
    
    return application is not None


@router.post("/contracts/{contract_id}/content", response_model=LinkContentResponse)
async def link_content_to_contract(
    contract_id: str,
    request: LinkContentRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Link content to a contract"""
    try:
        # Verify user has access to this contract
        if not await verify_contract_access(contract_id, current_user.id, db):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied to this contract"
            )
        
        # Link content to contract
        success, message, content_mapping_id = content_linking_service.link_content_to_contract(
            contract_id, request.content_url, current_user.id, db
        )
        
        if success and content_mapping_id:
            # Schedule automatic sync for this content
            scheduled_sync_service.add_content_sync_job(content_mapping_id, interval_hours=1, priority=1)
            
            # Trigger immediate sync
            data_ingestion_service.sync_content_data(content_mapping_id, db)
        
        return LinkContentResponse(
            success=success,
            message=message,
            content_mapping_id=content_mapping_id
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to link content: {str(e)}"
        )


@router.get("/contracts/{contract_id}/content", response_model=List[LinkedContentResponse])
async def get_contract_content(
    contract_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get all content linked to a contract"""
    try:
        # Verify user has access to this contract
        if not await verify_contract_access(contract_id, current_user.id, db):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied to this contract"
            )
        
        # Get linked content
        linked_content = content_linking_service.get_linked_content(contract_id, db)
        
        return [
            LinkedContentResponse(
                id=content['id'],
                platform=content['platform'],
                content_id=content['contentId'],
                content_url=content['contentUrl'],
                content_type=content['contentType'],
                content_title=content['contentTitle'],
                content_thumbnail=content['contentThumbnail'],
                linked_at=content['linkedAt'],
                user_id=content['userId']
            )
            for content in linked_content
        ]
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get contract content: {str(e)}"
        )


@router.delete("/contracts/{contract_id}/content/{content_mapping_id}")
async def unlink_content_from_contract(
    contract_id: str,
    content_mapping_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Unlink content from a contract"""
    try:
        # Verify user has access to this contract
        if not await verify_contract_access(contract_id, current_user.id, db):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied to this contract"
            )
        
        # Unlink content
        success, message = content_linking_service.unlink_content(
            contract_id, content_mapping_id, current_user.id, db
        )
        
        if success:
            # Remove scheduled sync job
            job_id = f"content_{content_mapping_id}"
            scheduled_sync_service.remove_job(job_id)
        
        return {"success": success, "message": message}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to unlink content: {str(e)}"
        )


@router.get("/content/{content_mapping_id}/preview", response_model=ContentPreviewResponse)
async def get_content_preview(
    content_mapping_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get preview of linked content"""
    try:
        # Get content mapping
        result = await db.execute(
            select(ContractContentMapping).where(
                ContractContentMapping.id == content_mapping_id,
                ContractContentMapping.is_active == True
            )
        )
        mapping = result.scalars().first()
        
        if not mapping:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Content mapping not found"
            )
        
        # Verify user has access to this content
        if not await verify_contract_access(mapping.contract_id, current_user.id, db):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied to this content"
            )
        
        return ContentPreviewResponse(
            title=mapping.content_title,
            thumbnail=mapping.content_thumbnail,
            description=None,  # Not stored in mapping
            platform=mapping.platform,
            content_type=mapping.content_type,
            is_valid=True
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get content preview: {str(e)}"
        )


@router.post("/contracts/{contract_id}/sync", response_model=SyncResponse)
async def sync_contract_content(
    contract_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Manually trigger sync for all content in a contract"""
    try:
        # Verify user has access to this contract
        if not verify_contract_access(contract_id, current_user.id, db):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied to this contract"
            )
        
        # Sync contract content
        success, message, results = data_ingestion_service.sync_contract_content(contract_id, db)
        
        return SyncResponse(
            success=success,
            message=message,
            results=results
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to sync contract content: {str(e)}"
        )


@router.post("/content/{content_mapping_id}/sync", response_model=SyncResponse)
async def sync_content(
    content_mapping_id: str,
    force_refresh: bool = False,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Manually trigger sync for specific content"""
    try:
        # Get content mapping
        mapping = db.query(ContractContentMapping).filter(
            ContractContentMapping.id == content_mapping_id,
            ContractContentMapping.is_active == True
        ).first()
        
        if not mapping:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Content mapping not found"
            )
        
        # Verify user has access to this content
        if not verify_contract_access(mapping.contract_id, current_user.id, db):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied to this content"
            )
        
        # Sync content
        success, message = data_ingestion_service.sync_content_data(
            content_mapping_id, db, force_refresh=force_refresh
        )
        
        return SyncResponse(
            success=success,
            message=message
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to sync content: {str(e)}"
        )


@router.get("/content/{content_mapping_id}/analytics")
async def get_content_analytics(
    content_mapping_id: str,
    days: int = 30,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get analytics data for specific content"""
    try:
        # Get content mapping
        mapping = db.query(ContractContentMapping).filter(
            ContractContentMapping.id == content_mapping_id,
            ContractContentMapping.is_active == True
        ).first()
        
        if not mapping:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Content mapping not found"
            )
        
        # Verify user has access to this content
        if not verify_contract_access(mapping.contract_id, current_user.id, db):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied to this content"
            )
        
        # Calculate date range
        end_date = datetime.utcnow()
        start_date = end_date - timedelta(days=days)
        
        # Get analytics data
        analytics_data = data_ingestion_service.get_content_analytics(
            content_mapping_id, db, date_range=(start_date, end_date)
        )
        
        if analytics_data is None:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to retrieve analytics data"
            )
        
        return {
            "content_mapping_id": content_mapping_id,
            "platform": mapping.platform,
            "content_type": mapping.content_type,
            "date_range": {
                "start": start_date.isoformat(),
                "end": end_date.isoformat()
            },
            "analytics": analytics_data
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get content analytics: {str(e)}"
        )


@router.get("/analytics/contracts/{contract_id}")
async def get_contract_analytics(
    contract_id: str,
    days: int = 30,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get aggregated analytics for all content in a contract"""
    try:
        # Verify user has access to this contract
        if not verify_contract_access(contract_id, current_user.id, db):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied to this contract"
            )
        
        # Get all content mappings for the contract
        mappings = db.query(ContractContentMapping).filter(
            ContractContentMapping.contract_id == contract_id,
            ContractContentMapping.is_active == True
        ).all()
        
        if not mappings:
            return {
                "contract_id": contract_id,
                "total_content": 0,
                "analytics": {
                    "total_impressions": 0,
                    "total_reach": 0,
                    "total_likes": 0,
                    "total_comments": 0,
                    "total_shares": 0,
                    "total_saves": 0,
                    "total_clicks": 0,
                    "average_engagement_rate": 0.0
                },
                "content_breakdown": []
            }
        
        # Calculate date range
        end_date = datetime.utcnow()
        start_date = end_date - timedelta(days=days)
        
        # Aggregate analytics for all content
        total_metrics = {
            "total_impressions": 0,
            "total_reach": 0,
            "total_likes": 0,
            "total_comments": 0,
            "total_shares": 0,
            "total_saves": 0,
            "total_clicks": 0,
            "engagement_rates": []
        }
        
        content_breakdown = []
        
        for mapping in mappings:
            # Get latest analytics for this content
            latest_analytics = db.query(ContentAnalytics).filter(
                ContentAnalytics.contract_content_id == mapping.id,
                ContentAnalytics.metrics_collected_at >= start_date,
                ContentAnalytics.metrics_collected_at <= end_date
            ).order_by(ContentAnalytics.metrics_collected_at.desc()).first()
            
            if latest_analytics:
                # Add to totals
                total_metrics["total_impressions"] += latest_analytics.impressions
                total_metrics["total_reach"] += latest_analytics.reach
                total_metrics["total_likes"] += latest_analytics.likes
                total_metrics["total_comments"] += latest_analytics.comments
                total_metrics["total_shares"] += latest_analytics.shares
                total_metrics["total_saves"] += latest_analytics.saves
                total_metrics["total_clicks"] += latest_analytics.clicks
                
                if latest_analytics.engagement_rate:
                    total_metrics["engagement_rates"].append(float(latest_analytics.engagement_rate))
                
                # Add to breakdown
                content_breakdown.append({
                    "content_mapping_id": mapping.id,
                    "platform": mapping.platform,
                    "content_type": mapping.content_type,
                    "content_title": mapping.content_title,
                    "metrics": {
                        "impressions": latest_analytics.impressions,
                        "reach": latest_analytics.reach,
                        "likes": latest_analytics.likes,
                        "comments": latest_analytics.comments,
                        "shares": latest_analytics.shares,
                        "saves": latest_analytics.saves,
                        "clicks": latest_analytics.clicks,
                        "engagement_rate": float(latest_analytics.engagement_rate) if latest_analytics.engagement_rate else 0.0
                    },
                    "last_updated": latest_analytics.metrics_collected_at.isoformat()
                })
        
        # Calculate average engagement rate
        avg_engagement_rate = 0.0
        if total_metrics["engagement_rates"]:
            avg_engagement_rate = sum(total_metrics["engagement_rates"]) / len(total_metrics["engagement_rates"])
        
        return {
            "contract_id": contract_id,
            "total_content": len(mappings),
            "date_range": {
                "start": start_date.isoformat(),
                "end": end_date.isoformat()
            },
            "analytics": {
                "total_impressions": total_metrics["total_impressions"],
                "total_reach": total_metrics["total_reach"],
                "total_likes": total_metrics["total_likes"],
                "total_comments": total_metrics["total_comments"],
                "total_shares": total_metrics["total_shares"],
                "total_saves": total_metrics["total_saves"],
                "total_clicks": total_metrics["total_clicks"],
                "average_engagement_rate": round(avg_engagement_rate, 4)
            },
            "content_breakdown": content_breakdown
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get contract analytics: {str(e)}"
        )


@router.get("/analytics/roi/{contract_id}")
async def get_contract_roi(
    contract_id: str,
    days: int = 30,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get ROI calculations for a contract"""
    try:
        # Verify user has access to this contract
        if not verify_contract_access(contract_id, current_user.id, db):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied to this contract"
            )
        
        # Get contract details
        from app.models.models import Sponsorship
        contract = db.query(Sponsorship).filter(Sponsorship.id == contract_id).first()
        if not contract:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Contract not found"
            )
        
        # Calculate date range
        end_date = datetime.utcnow()
        start_date = end_date - timedelta(days=days)
        
        # Get all content mappings for the contract
        mappings = db.query(ContractContentMapping).filter(
            ContractContentMapping.contract_id == contract_id,
            ContractContentMapping.is_active == True
        ).all()
        
        if not mappings:
            return {
                "contract_id": contract_id,
                "date_range": {
                    "start": start_date.isoformat(),
                    "end": end_date.isoformat()
                },
                "roi_metrics": {
                    "total_spend": float(contract.budget) if contract.budget else 0.0,
                    "total_revenue": 0.0,
                    "total_conversions": 0,
                    "cost_per_acquisition": 0.0,
                    "return_on_investment": 0.0,
                    "roi_percentage": 0.0
                },
                "performance_metrics": {
                    "total_impressions": 0,
                    "total_reach": 0,
                    "total_clicks": 0,
                    "click_through_rate": 0.0,
                    "average_engagement_rate": 0.0
                }
            }
        
        # Aggregate metrics from all content
        total_impressions = 0
        total_reach = 0
        total_clicks = 0
        total_conversions = 0
        engagement_rates = []
        
        for mapping in mappings:
            # Get latest analytics for this content
            latest_analytics = db.query(ContentAnalytics).filter(
                ContentAnalytics.contract_content_id == mapping.id,
                ContentAnalytics.metrics_collected_at >= start_date,
                ContentAnalytics.metrics_collected_at <= end_date
            ).order_by(ContentAnalytics.metrics_collected_at.desc()).first()
            
            if latest_analytics:
                total_impressions += latest_analytics.impressions
                total_reach += latest_analytics.reach
                total_clicks += latest_analytics.clicks
                
                if latest_analytics.engagement_rate:
                    engagement_rates.append(float(latest_analytics.engagement_rate))
        
        # Calculate performance metrics
        click_through_rate = (total_clicks / total_impressions * 100) if total_impressions > 0 else 0.0
        average_engagement_rate = sum(engagement_rates) / len(engagement_rates) if engagement_rates else 0.0
        
        # ROI calculations (simplified - in production, you'd have actual conversion tracking)
        total_spend = float(contract.budget) if contract.budget else 0.0
        
        # Estimate conversions based on clicks and industry averages (2-3% conversion rate)
        estimated_conversion_rate = 0.025  # 2.5% average
        total_conversions = int(total_clicks * estimated_conversion_rate)
        
        # Estimate revenue based on conversions (this would come from actual tracking in production)
        # Using a simplified model: assume each conversion is worth 3x the cost per click
        estimated_revenue_per_conversion = (total_spend / total_clicks * 3) if total_clicks > 0 else 0
        total_revenue = total_conversions * estimated_revenue_per_conversion
        
        # Calculate ROI metrics
        cost_per_acquisition = (total_spend / total_conversions) if total_conversions > 0 else 0.0
        return_on_investment = ((total_revenue - total_spend) / total_spend) if total_spend > 0 else 0.0
        roi_percentage = return_on_investment * 100
        
        return {
            "contract_id": contract_id,
            "date_range": {
                "start": start_date.isoformat(),
                "end": end_date.isoformat()
            },
            "roi_metrics": {
                "total_spend": round(total_spend, 2),
                "total_revenue": round(total_revenue, 2),
                "total_conversions": total_conversions,
                "cost_per_acquisition": round(cost_per_acquisition, 2),
                "return_on_investment": round(return_on_investment, 4),
                "roi_percentage": round(roi_percentage, 2)
            },
            "performance_metrics": {
                "total_impressions": total_impressions,
                "total_reach": total_reach,
                "total_clicks": total_clicks,
                "click_through_rate": round(click_through_rate, 4),
                "average_engagement_rate": round(average_engagement_rate, 4)
            },
            "note": "ROI calculations are estimated based on industry averages. Actual conversion tracking would provide more accurate results."
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get contract ROI: {str(e)}"
        )


@router.get("/analytics/demographics/{contract_id}")
async def get_contract_demographics(
    contract_id: str,
    days: int = 30,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get audience demographics for a contract"""
    try:
        # Verify user has access to this contract
        if not verify_contract_access(contract_id, current_user.id, db):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied to this contract"
            )
        
        # Calculate date range
        end_date = datetime.utcnow()
        start_date = end_date - timedelta(days=days)
        
        # Get all content mappings for the contract
        mappings = db.query(ContractContentMapping).filter(
            ContractContentMapping.contract_id == contract_id,
            ContractContentMapping.is_active == True
        ).all()
        
        if not mappings:
            return {
                "contract_id": contract_id,
                "date_range": {
                    "start": start_date.isoformat(),
                    "end": end_date.isoformat()
                },
                "demographics": {
                    "age_groups": {},
                    "locations": {},
                    "interests": {},
                    "gender": {}
                },
                "engagement_patterns": {
                    "by_time_of_day": {},
                    "by_day_of_week": {},
                    "by_content_type": {}
                },
                "data_availability": {
                    "total_content_pieces": 0,
                    "content_with_demographics": 0,
                    "data_completeness_percentage": 0.0
                }
            }
        
        # Aggregate demographics from all content
        aggregated_demographics = {
            "age_groups": {},
            "locations": {},
            "interests": {},
            "gender": {}
        }
        
        engagement_by_content_type = {}
        content_with_demographics = 0
        total_impressions = 0
        
        for mapping in mappings:
            # Get latest analytics for this content
            latest_analytics = db.query(ContentAnalytics).filter(
                ContentAnalytics.contract_content_id == mapping.id,
                ContentAnalytics.metrics_collected_at >= start_date,
                ContentAnalytics.metrics_collected_at <= end_date
            ).order_by(ContentAnalytics.metrics_collected_at.desc()).first()
            
            if latest_analytics and latest_analytics.demographics:
                content_with_demographics += 1
                demographics = latest_analytics.demographics
                content_impressions = latest_analytics.impressions
                total_impressions += content_impressions
                
                # Aggregate age groups (weighted by impressions)
                if 'age_groups' in demographics:
                    for age_group, percentage in demographics['age_groups'].items():
                        if age_group not in aggregated_demographics['age_groups']:
                            aggregated_demographics['age_groups'][age_group] = 0
                        # Weight by impressions
                        aggregated_demographics['age_groups'][age_group] += (percentage * content_impressions)
                
                # Aggregate locations (weighted by impressions)
                if 'locations' in demographics:
                    for location, percentage in demographics['locations'].items():
                        if location not in aggregated_demographics['locations']:
                            aggregated_demographics['locations'][location] = 0
                        aggregated_demographics['locations'][location] += (percentage * content_impressions)
                
                # Aggregate interests (weighted by impressions)
                if 'interests' in demographics:
                    for interest, percentage in demographics['interests'].items():
                        if interest not in aggregated_demographics['interests']:
                            aggregated_demographics['interests'][interest] = 0
                        aggregated_demographics['interests'][interest] += (percentage * content_impressions)
                
                # Aggregate gender (weighted by impressions)
                if 'gender' in demographics:
                    for gender, percentage in demographics['gender'].items():
                        if gender not in aggregated_demographics['gender']:
                            aggregated_demographics['gender'][gender] = 0
                        aggregated_demographics['gender'][gender] += (percentage * content_impressions)
                
                # Track engagement by content type
                content_type = mapping.content_type
                if content_type not in engagement_by_content_type:
                    engagement_by_content_type[content_type] = {
                        'total_impressions': 0,
                        'total_engagement': 0,
                        'count': 0
                    }
                
                engagement_by_content_type[content_type]['total_impressions'] += content_impressions
                engagement_by_content_type[content_type]['total_engagement'] += (
                    latest_analytics.likes + latest_analytics.comments + 
                    latest_analytics.shares + latest_analytics.saves
                )
                engagement_by_content_type[content_type]['count'] += 1
        
        # Normalize aggregated demographics to percentages
        if total_impressions > 0:
            for category in aggregated_demographics:
                for key in aggregated_demographics[category]:
                    aggregated_demographics[category][key] = round(
                        (aggregated_demographics[category][key] / total_impressions) * 100, 2
                    )
        
        # Calculate engagement rates by content type
        engagement_by_content_type_normalized = {}
        for content_type, data in engagement_by_content_type.items():
            engagement_rate = (data['total_engagement'] / data['total_impressions'] * 100) if data['total_impressions'] > 0 else 0
            engagement_by_content_type_normalized[content_type] = {
                'engagement_rate': round(engagement_rate, 2),
                'total_impressions': data['total_impressions'],
                'content_count': data['count']
            }
        
        # Calculate data completeness
        data_completeness = (content_with_demographics / len(mappings) * 100) if mappings else 0
        
        # Generate mock time-based engagement patterns (in production, this would come from actual data)
        engagement_by_time = {
            "00-06": 5.2, "06-12": 25.8, "12-18": 45.3, "18-24": 23.7
        }
        engagement_by_day = {
            "Monday": 12.5, "Tuesday": 14.2, "Wednesday": 15.8, "Thursday": 16.1,
            "Friday": 18.3, "Saturday": 12.7, "Sunday": 10.4
        }
        
        return {
            "contract_id": contract_id,
            "date_range": {
                "start": start_date.isoformat(),
                "end": end_date.isoformat()
            },
            "demographics": aggregated_demographics,
            "engagement_patterns": {
                "by_time_of_day": engagement_by_time,
                "by_day_of_week": engagement_by_day,
                "by_content_type": engagement_by_content_type_normalized
            },
            "data_availability": {
                "total_content_pieces": len(mappings),
                "content_with_demographics": content_with_demographics,
                "data_completeness_percentage": round(data_completeness, 1)
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get contract demographics: {str(e)}"
        )