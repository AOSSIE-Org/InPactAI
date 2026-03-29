from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from ..db.db import AsyncSessionLocal
from ..models.models import (
    User, AudienceInsights, Sponsorship, UserPost,
    SponsorshipApplication, SponsorshipPayment, Collaboration
)
from ..schemas.schema import (
    UserCreate, AudienceInsightsCreate, SponsorshipCreate, UserPostCreate,
    SponsorshipApplicationCreate, SponsorshipPaymentCreate, CollaborationCreate
)
from ..utils.pagination import get_pagination_params, paginate_query

import os
from supabase import create_client, Client
from dotenv import load_dotenv
import uuid
from datetime import datetime, timezone

# Load environment variables
load_dotenv()
url: str = os.getenv("SUPABASE_URL")
key: str = os.getenv("SUPABASE_KEY")
supabase: Client = create_client(url, key)

# Define Router
router = APIRouter()

# Helper Functions
def generate_uuid():
    return str(uuid.uuid4())

def current_timestamp():
    return datetime.now(timezone.utc).isoformat()

# ========== USER ROUTES ==========
@router.post("/users/")
async def create_user(user: UserCreate):
    user_id = generate_uuid()
    t = current_timestamp()

    response = supabase.table("users").insert({
        "id": user_id,
        "username": user.username,
        "email": user.email,
        "role": user.role,
        "profile_image": user.profile_image,
        "bio": user.bio,
        "created_at": t
    }).execute()

    return response

@router.get("/users/")
async def get_users(
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(50, ge=1, le=100, description="Maximum number of records to return")
):
    skip, limit = get_pagination_params(skip, limit)
    start = skip
    end = skip + limit - 1
    
    result = supabase.table("users").select("*").order("id").range(start, end).execute()
    count_result = supabase.table("users").select("*", count="exact").limit(0).execute()
    total_count = count_result.count if hasattr(count_result, 'count') else len(count_result.data)
    return paginate_query(result, skip, limit, total_count)

# ========== AUDIENCE INSIGHTS ROUTES ==========
@router.post("/audience-insights/")
async def create_audience_insights(insights: AudienceInsightsCreate):
    insight_id = generate_uuid()
    t = current_timestamp()

    response = supabase.table("audience_insights").insert({
        "id": insight_id,
        "user_id": insights.user_id,
        "audience_age_group": insights.audience_age_group,
        "audience_location": insights.audience_location,
        "engagement_rate": insights.engagement_rate,
        "average_views": insights.average_views,
        "time_of_attention": insights.time_of_attention,
        "price_expectation": insights.price_expectation,
        "created_at": t
    }).execute()

    return response

@router.get("/audience-insights/")
async def get_audience_insights(
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(50, ge=1, le=100, description="Maximum number of records to return")
):
    skip, limit = get_pagination_params(skip, limit)
    start = skip
    end = skip + limit - 1
    
    result = supabase.table("audience_insights").select("*").order("id").range(start, end).execute()
    count_result = supabase.table("audience_insights").select("*", count="exact").limit(0).execute()
    total_count = count_result.count if hasattr(count_result, 'count') else len(count_result.data)
    return paginate_query(result, skip, limit, total_count)

# ========== SPONSORSHIP ROUTES ==========
@router.post("/sponsorships/")
async def create_sponsorship(sponsorship: SponsorshipCreate):
    sponsorship_id = generate_uuid()
    t = current_timestamp()

    response = supabase.table("sponsorships").insert({
        "id": sponsorship_id,
        "brand_id": sponsorship.brand_id,
        "title": sponsorship.title,
        "description": sponsorship.description,
        "required_audience": sponsorship.required_audience,
        "budget": sponsorship.budget,
        "engagement_minimum": sponsorship.engagement_minimum,
        "status": sponsorship.status,
        "created_at": t
    }).execute()

    return response

@router.get("/sponsorships/")
async def get_sponsorships(
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(50, ge=1, le=100, description="Maximum number of records to return")
):
    skip, limit = get_pagination_params(skip, limit)
    start = skip
    end = skip + limit - 1
    
    result = supabase.table("sponsorships").select("*").order("id").range(start, end).execute()
    count_result = supabase.table("sponsorships").select("*", count="exact").limit(0).execute()
    total_count = count_result.count if hasattr(count_result, 'count') else len(count_result.data)
    return paginate_query(result, skip, limit, total_count)

# ========== USER POST ROUTES ==========
@router.post("/posts/")
async def create_post(post: UserPostCreate):
    post_id = generate_uuid()
    t = current_timestamp()

    response = supabase.table("user_posts").insert({
        "id": post_id,
        "user_id": post.user_id,
        "title": post.title,
        "content": post.content,
        "post_url": post.post_url,
        "category": post.category,
        "engagement_metrics": post.engagement_metrics,
        "created_at": t
    }).execute()

    return response

@router.get("/posts/")
async def get_posts(
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(50, ge=1, le=100, description="Maximum number of records to return")
):
    skip, limit = get_pagination_params(skip, limit)
    start = skip
    end = skip + limit - 1
    
    result = supabase.table("user_posts").select("*").order("id").range(start, end).execute()
    count_result = supabase.table("user_posts").select("*", count="exact").limit(0).execute()
    total_count = count_result.count if hasattr(count_result, 'count') else len(count_result.data)
    return paginate_query(result, skip, limit, total_count)

# ========== SPONSORSHIP APPLICATION ROUTES ==========
@router.post("/sponsorship-applications/")
async def create_sponsorship_application(application: SponsorshipApplicationCreate):
    application_id = generate_uuid()
    t = current_timestamp()

    response = supabase.table("sponsorship_applications").insert({
        "id": application_id,
        "creator_id": application.creator_id,
        "sponsorship_id": application.sponsorship_id,
        "post_id": application.post_id,
        "proposal": application.proposal,
        "status": application.status,
        "applied_at": t
    }).execute()

    return response

@router.get("/sponsorship-applications/")
async def get_sponsorship_applications(
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(50, ge=1, le=100, description="Maximum number of records to return")
):
    skip, limit = get_pagination_params(skip, limit)
    start = skip
    end = skip + limit - 1
    
    result = supabase.table("sponsorship_applications").select("*").order("id").range(start, end).execute()
    count_result = supabase.table("sponsorship_applications").select("*", count="exact").limit(0).execute()
    total_count = count_result.count if hasattr(count_result, 'count') else len(count_result.data)
    return paginate_query(result, skip, limit, total_count)

# ========== SPONSORSHIP PAYMENT ROUTES ==========
@router.post("/sponsorship-payments/")
async def create_sponsorship_payment(payment: SponsorshipPaymentCreate):
    payment_id = generate_uuid()
    t = current_timestamp()

    response = supabase.table("sponsorship_payments").insert({
        "id": payment_id,
        "creator_id": payment.creator_id,
        "sponsorship_id": payment.sponsorship_id,
        "amount": payment.amount,
        "status": payment.status,
        "payment_date": t
    }).execute()

    return response

@router.get("/sponsorship-payments/")
async def get_sponsorship_payments(
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(50, ge=1, le=100, description="Maximum number of records to return")
):
    skip, limit = get_pagination_params(skip, limit)
    start = skip
    end = skip + limit - 1
    
    result = supabase.table("sponsorship_payments").select("*").order("id").range(start, end).execute()
    count_result = supabase.table("sponsorship_payments").select("*", count="exact").limit(0).execute()
    total_count = count_result.count if hasattr(count_result, 'count') else len(count_result.data)
    return paginate_query(result, skip, limit, total_count)

# ========== COLLABORATION ROUTES ==========
@router.post("/collaborations/")
async def create_collaboration(collab: CollaborationCreate):
    collaboration_id = generate_uuid()
    t = current_timestamp()

    response = supabase.table("collaborations").insert({
        "id": collaboration_id,
        "creator_1_id": collab.creator_1_id,
        "creator_2_id": collab.creator_2_id,
        "collab_details": collab.collab_details,
        "status": collab.status,
        "created_at": t
    }).execute()

    return response

@router.get("/collaborations/")
async def get_collaborations(
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(50, ge=1, le=100, description="Maximum number of records to return")
):
    skip, limit = get_pagination_params(skip, limit)
    start = skip
    end = skip + limit - 1
    
    result = supabase.table("collaborations").select("*").order("id").range(start, end).execute()
    count_result = supabase.table("collaborations").select("*", count="exact").limit(0).execute()
    total_count = count_result.count if hasattr(count_result, 'count') else len(count_result.data)
    return paginate_query(result, skip, limit, total_count)
