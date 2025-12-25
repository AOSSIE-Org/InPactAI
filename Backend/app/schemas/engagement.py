from pydantic import BaseModel
from typing import Optional


class EngagementRequest(BaseModel):
    creator_id: str
    follower_count: Optional[int] = None


class EngagementMetrics(BaseModel):
    likes: int
    comments: int
    shares: int

    avg_likes: float
    avg_comments: float
    avg_shares: float

    engagement_rate: Optional[float] = None
    total_posts: int
    follower_count: Optional[int] = None