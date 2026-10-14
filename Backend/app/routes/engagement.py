from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import Optional

from ..db.db import get_db
from ..models.models import UserPost
from ..schemas.engagement import EngagementRequest, EngagementMetrics
from ..services.engagement_service import compute_engagement_metrics

router = APIRouter(prefix="/engagement", tags=["Engagement"]) 


@router.post("/compute", response_model=EngagementMetrics)
async def compute_engagement(data: EngagementRequest, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(UserPost).where(UserPost.user_id == data.creator_id))
    posts = result.scalars().all()

    metrics = compute_engagement_metrics(posts, data.follower_count)
    return metrics