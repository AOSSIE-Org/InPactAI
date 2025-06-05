from pydantic import BaseModel
from typing import Optional, Dict
from datetime import datetime

class UserCreate(BaseModel):
    username: str
    email: str
    # password_hash: str  # Removed: managed by Supabase Auth
    role: str
    profile_image: Optional[str] = None
    bio: Optional[str] = None

class AudienceInsightsCreate(BaseModel):
    user_id: str
    audience_age_group: Dict[str, int]
    audience_location: Dict[str, int]
    engagement_rate: float
    average_views: int
    time_of_attention: int
    price_expectation: float

class SponsorshipCreate(BaseModel):
    brand_id: str
    title: str
    description: str
    required_audience: Dict[str, list]
    budget: float
    engagement_minimum: float

class UserPostCreate(BaseModel):
    user_id: str
    title: str
    content: str
    post_url: Optional[str] = None
    category: Optional[str] = None
    engagement_metrics: Dict[str, int]

class SponsorshipApplicationCreate(BaseModel):
    creator_id: str
    sponsorship_id: str
    post_id: Optional[str] = None
    proposal: str

class SponsorshipPaymentCreate(BaseModel):
    creator_id: str
    brand_id: str
    sponsorship_id: str
    amount: float
    status: Optional[str] = "pending"

class CollaborationCreate(BaseModel):
    creator_1_id: str
    creator_2_id: str
    collaboration_details: str
