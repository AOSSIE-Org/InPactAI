from pydantic import BaseModel
from typing import Optional, Dict, List
from datetime import datetime

class UserCreate(BaseModel):
    username: str
    email: str
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


# ============================================================================
# BRAND DASHBOARD SCHEMAS
# ============================================================================

# Brand Profile Schemas
class BrandProfileCreate(BaseModel):
    user_id: str
    company_name: Optional[str] = None
    website: Optional[str] = None
    industry: Optional[str] = None
    contact_person: Optional[str] = None
    contact_email: Optional[str] = None

class BrandProfileUpdate(BaseModel):
    company_name: Optional[str] = None
    website: Optional[str] = None
    industry: Optional[str] = None
    contact_person: Optional[str] = None
    contact_email: Optional[str] = None

class BrandProfileResponse(BaseModel):
    id: str
    user_id: str
    company_name: Optional[str] = None
    website: Optional[str] = None
    industry: Optional[str] = None
    contact_person: Optional[str] = None
    contact_email: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


# Campaign Metrics Schemas
class CampaignMetricsCreate(BaseModel):
    campaign_id: str
    impressions: Optional[int] = None
    clicks: Optional[int] = None
    conversions: Optional[int] = None
    revenue: Optional[float] = None
    engagement_rate: Optional[float] = None

class CampaignMetricsResponse(BaseModel):
    id: str
    campaign_id: str
    impressions: Optional[int] = None
    clicks: Optional[int] = None
    conversions: Optional[int] = None
    revenue: Optional[float] = None
    engagement_rate: Optional[float] = None
    recorded_at: datetime

    class Config:
        from_attributes = True


# Contract Schemas
class ContractCreate(BaseModel):
    sponsorship_id: str
    creator_id: str
    brand_id: str
    contract_url: Optional[str] = None
    status: str = "draft"

class ContractUpdate(BaseModel):
    contract_url: Optional[str] = None
    status: Optional[str] = None

class ContractResponse(BaseModel):
    id: str
    sponsorship_id: str
    creator_id: str
    brand_id: str
    contract_url: Optional[str] = None
    status: str
    created_at: datetime

    class Config:
        from_attributes = True


# Creator Match Schemas
class CreatorMatchResponse(BaseModel):
    id: str
    brand_id: str
    creator_id: str
    match_score: Optional[float] = None
    matched_at: datetime

    class Config:
        from_attributes = True


# Dashboard Analytics Schemas
class DashboardOverviewResponse(BaseModel):
    total_campaigns: int
    active_campaigns: int
    total_revenue: float
    total_creators_matched: int
    recent_activity: list

class CampaignAnalyticsResponse(BaseModel):
    campaign_id: str
    campaign_title: str
    impressions: int
    clicks: int
    conversions: int
    revenue: float
    engagement_rate: float
    roi: float

class CreatorMatchAnalyticsResponse(BaseModel):
    creator_id: str
    creator_name: str
    match_score: float
    audience_overlap: float
    engagement_rate: float
    estimated_reach: int


# ============================================================================
# ADDITIONAL SCHEMAS FOR EXISTING TABLES
# ============================================================================

# Application Management Schemas
class SponsorshipApplicationResponse(BaseModel):
    id: str
    creator_id: str
    sponsorship_id: str
    post_id: Optional[str] = None
    proposal: str
    status: str
    applied_at: datetime
    creator: Optional[Dict] = None  # From users table
    campaign: Optional[Dict] = None  # From sponsorships table

    class Config:
        from_attributes = True

class ApplicationUpdateRequest(BaseModel):
    status: str  # "accepted", "rejected", "pending"
    notes: Optional[str] = None

class ApplicationSummaryResponse(BaseModel):
    total_applications: int
    pending_applications: int
    accepted_applications: int
    rejected_applications: int
    applications_by_campaign: Dict[str, int]
    recent_applications: List[Dict]


# Payment Management Schemas
class PaymentResponse(BaseModel):
    id: str
    creator_id: str
    brand_id: str
    sponsorship_id: str
    amount: float
    status: str
    transaction_date: datetime
    creator: Optional[Dict] = None  # From users table
    campaign: Optional[Dict] = None  # From sponsorships table

    class Config:
        from_attributes = True

class PaymentStatusUpdate(BaseModel):
    status: str  # "pending", "completed", "failed", "cancelled"

class PaymentAnalyticsResponse(BaseModel):
    total_payments: int
    completed_payments: int
    pending_payments: int
    total_amount: float
    average_payment: float
    payments_by_month: Dict[str, float]


# Campaign Metrics Management Schemas
class CampaignMetricsUpdate(BaseModel):
    impressions: Optional[int] = None
    clicks: Optional[int] = None
    conversions: Optional[int] = None
    revenue: Optional[float] = None
    engagement_rate: Optional[float] = None
