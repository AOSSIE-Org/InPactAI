from fastapi import APIRouter, HTTPException, Depends, Query
from typing import List, Optional, Dict, Any
from datetime import datetime, date
from pydantic import BaseModel
import httpx
import os
from supabase import create_client, Client
from dotenv import load_dotenv

# Load environment variables
load_dotenv()
url: str = os.getenv("SUPABASE_URL")
key: str = os.getenv("SUPABASE_KEY")
if not url or not key:
    raise ValueError("SUPABASE_URL and SUPABASE_KEY must be set in environment variables")
supabase: Client = create_client(url, key)

router = APIRouter(prefix="/api/contracts", tags=["contracts"])

# ============================================================================
# PYDANTIC MODELS FOR CONTRACTS
# ============================================================================

class ContractBase(BaseModel):
    sponsorship_id: Optional[str] = None
    creator_id: str
    brand_id: str
    contract_title: Optional[str] = None
    contract_type: str = "one-time"
    terms_and_conditions: Optional[Dict[str, Any]] = None
    payment_terms: Optional[Dict[str, Any]] = None
    deliverables: Optional[Dict[str, Any]] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    total_budget: Optional[float] = None
    payment_schedule: Optional[Dict[str, Any]] = None
    legal_compliance: Optional[Dict[str, Any]] = None

class ContractCreate(ContractBase):
    pass

class ContractUpdate(BaseModel):
    contract_title: Optional[str] = None
    contract_type: Optional[str] = None
    terms_and_conditions: Optional[Dict[str, Any]] = None
    payment_terms: Optional[Dict[str, Any]] = None
    deliverables: Optional[Dict[str, Any]] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    total_budget: Optional[float] = None
    payment_schedule: Optional[Dict[str, Any]] = None
    legal_compliance: Optional[Dict[str, Any]] = None
    status: Optional[str] = None

class ContractResponse(ContractBase):
    id: str
    contract_url: Optional[str] = None
    status: str
    created_at: str
    updated_at: Optional[str] = None

class ContractTemplateBase(BaseModel):
    template_name: str
    template_type: str
    industry: Optional[str] = None
    terms_template: Optional[Dict[str, Any]] = None
    payment_terms_template: Optional[Dict[str, Any]] = None
    deliverables_template: Optional[Dict[str, Any]] = None
    is_public: bool = False

class ContractTemplateCreate(ContractTemplateBase):
    pass

class ContractTemplateResponse(ContractTemplateBase):
    id: str
    created_by: Optional[str] = None
    is_active: bool
    created_at: str
    updated_at: str

class MilestoneBase(BaseModel):
    milestone_name: str
    description: Optional[str] = None
    due_date: str
    payment_amount: float
    completion_criteria: Optional[Dict[str, Any]] = None

class MilestoneCreate(MilestoneBase):
    pass

class MilestoneUpdate(BaseModel):
    milestone_name: Optional[str] = None
    description: Optional[str] = None
    due_date: Optional[str] = None
    payment_amount: Optional[float] = None
    status: Optional[str] = None
    completion_criteria: Optional[Dict[str, Any]] = None

class MilestoneResponse(MilestoneBase):
    id: str
    contract_id: str
    status: str
    completed_at: Optional[str] = None
    created_at: str
    updated_at: str

class DeliverableBase(BaseModel):
    deliverable_type: str
    description: Optional[str] = None
    platform: str
    requirements: Optional[Dict[str, Any]] = None
    due_date: str

class DeliverableCreate(DeliverableBase):
    pass

class DeliverableUpdate(BaseModel):
    deliverable_type: Optional[str] = None
    description: Optional[str] = None
    platform: Optional[str] = None
    requirements: Optional[Dict[str, Any]] = None
    due_date: Optional[str] = None
    status: Optional[str] = None
    content_url: Optional[str] = None
    approval_status: Optional[str] = None
    approval_notes: Optional[str] = None

class DeliverableResponse(DeliverableBase):
    id: str
    contract_id: str
    status: str
    content_url: Optional[str] = None
    approval_status: str
    approval_notes: Optional[str] = None
    submitted_at: Optional[str] = None
    approved_at: Optional[str] = None
    created_at: str
    updated_at: str

class PaymentBase(BaseModel):
    amount: float
    payment_type: str
    due_date: str
    payment_method: Optional[str] = None
    payment_notes: Optional[str] = None

class PaymentCreate(PaymentBase):
    pass

class PaymentUpdate(BaseModel):
    amount: Optional[float] = None
    payment_type: Optional[str] = None
    status: Optional[str] = None
    due_date: Optional[str] = None
    paid_date: Optional[datetime] = None
    payment_method: Optional[str] = None
    transaction_id: Optional[str] = None
    payment_notes: Optional[str] = None

class PaymentResponse(PaymentBase):
    id: str
    contract_id: str
    milestone_id: Optional[str] = None
    status: str
    paid_date: Optional[str] = None
    transaction_id: Optional[str] = None
    created_at: str
    updated_at: str

class CommentBase(BaseModel):
    comment: str
    comment_type: str = "general"
    is_internal: bool = False
    parent_comment_id: Optional[str] = None

class CommentCreate(CommentBase):
    pass

class CommentResponse(CommentBase):
    id: str
    contract_id: str
    user_id: str
    created_at: str

class AnalyticsResponse(BaseModel):
    id: str
    contract_id: str
    performance_metrics: Optional[Dict[str, Any]] = None
    engagement_data: Optional[Dict[str, Any]] = None
    revenue_generated: float = 0
    roi_percentage: float = 0
    cost_per_engagement: float = 0
    cost_per_click: float = 0
    recorded_at: str

class NotificationResponse(BaseModel):
    id: str
    contract_id: str
    user_id: str
    notification_type: str
    title: str
    message: str
    is_read: bool
    created_at: str

# ============================================================================
# CONTRACT CRUD OPERATIONS
# ============================================================================

@router.post("/", response_model=ContractResponse)
async def create_contract(contract: ContractCreate):
    """Create a new contract"""
    try:
        # Insert contract
        result = supabase.table("contracts").insert({
            "sponsorship_id": contract.sponsorship_id,
            "creator_id": contract.creator_id,
            "brand_id": contract.brand_id,
            "contract_title": contract.contract_title,
            "contract_type": contract.contract_type,
            "terms_and_conditions": contract.terms_and_conditions,
            "payment_terms": contract.payment_terms,
            "deliverables": contract.deliverables,
            "start_date": contract.start_date,
            "end_date": contract.end_date,
            "total_budget": contract.total_budget,
            "payment_schedule": contract.payment_schedule,
            "legal_compliance": contract.legal_compliance,
            "status": "draft"
        }).execute()
        
        if result.data:
            return ContractResponse(**result.data[0])
        else:
            raise HTTPException(status_code=400, detail="Failed to create contract")
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating contract: {str(e)}")

@router.get("/", response_model=List[ContractResponse])
async def get_contracts(
    brand_id: Optional[str] = Query(None, description="Filter by brand ID"),
    creator_id: Optional[str] = Query(None, description="Filter by creator ID"),
    status: Optional[str] = Query(None, description="Filter by status"),
    limit: int = Query(50, description="Number of contracts to return"),
    offset: int = Query(0, description="Number of contracts to skip")
):
    """Get all contracts with optional filtering"""
    try:
        query = supabase.table("contracts").select("*")
        
        if brand_id:
            query = query.eq("brand_id", brand_id)
        if creator_id:
            query = query.eq("creator_id", creator_id)
        if status:
            query = query.eq("status", status)
            
        query = query.range(offset, offset + limit - 1)
        result = query.execute()
        
        return [ContractResponse(**contract) for contract in result.data]
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching contracts: {str(e)}")

@router.get("/search")
async def search_contracts(
    query: str = Query(..., description="Search term"),
    brand_id: Optional[str] = Query(None, description="Filter by brand ID"),
    creator_id: Optional[str] = Query(None, description="Filter by creator ID"),
    status: Optional[str] = Query(None, description="Filter by status"),
    limit: int = Query(20, description="Number of results to return")
):
    """Search contracts by title, description, or other fields"""
    try:
        # Get all contracts first (since Supabase doesn't support OR conditions easily)
        search_query = supabase.table("contracts").select("*")
        
        # Add filters
        if brand_id:
            search_query = search_query.eq("brand_id", brand_id)
        if creator_id:
            search_query = search_query.eq("creator_id", creator_id)
        if status:
            search_query = search_query.eq("status", status)
            
        result = search_query.execute()
        contracts = result.data
        
        # Filter by search term in multiple fields
        query_lower = query.lower()
        filtered_contracts = []
        
        for contract in contracts:
            # Search in contract_title, creator_id, brand_id
            contract_title = (contract.get("contract_title") or "").lower()
            creator_id = (contract.get("creator_id") or "").lower()
            brand_id = (contract.get("brand_id") or "").lower()
            
            if (query_lower in contract_title or 
                query_lower in creator_id or 
                query_lower in brand_id):
                filtered_contracts.append(contract)
        
        # Apply limit
        limited_contracts = filtered_contracts[:limit]
        
        return [ContractResponse(**contract) for contract in limited_contracts]
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error searching contracts: {str(e)}")

@router.get("/{contract_id}", response_model=ContractResponse)
async def get_contract(contract_id: str):
    """Get a specific contract by ID"""
    try:
        result = supabase.table("contracts").select("*").eq("id", contract_id).execute()
        
        if not result.data:
            raise HTTPException(status_code=404, detail="Contract not found")
            
        return ContractResponse(**result.data[0])
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching contract: {str(e)}")

@router.put("/{contract_id}", response_model=ContractResponse)
async def update_contract(contract_id: str, contract_update: ContractUpdate):
    """Update a contract"""
    try:
        update_data = contract_update.dict(exclude_unset=True)
        if update_data:
            update_data["updated_at"] = datetime.utcnow().isoformat()
            
        result = supabase.table("contracts").update(update_data).eq("id", contract_id).execute()
        
        if not result.data:
            raise HTTPException(status_code=404, detail="Contract not found")
            
        return ContractResponse(**result.data[0])
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error updating contract: {str(e)}")

@router.delete("/{contract_id}")
async def delete_contract(contract_id: str):
    """Delete a contract"""
    try:
        result = supabase.table("contracts").delete().eq("id", contract_id).execute()
        
        if not result.data:
            raise HTTPException(status_code=404, detail="Contract not found")
            
        return {"message": "Contract deleted successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error deleting contract: {str(e)}")

# ============================================================================
# CONTRACT TEMPLATES
# ============================================================================

@router.post("/templates", response_model=ContractTemplateResponse)
async def create_contract_template(template: ContractTemplateCreate, user_id: str):
    """Create a new contract template"""
    try:
        result = supabase.table("contract_templates").insert({
            **template.dict(),
            "created_by": user_id
        }).execute()
        
        if result.data:
            return ContractTemplateResponse(**result.data[0])
        else:
            raise HTTPException(status_code=400, detail="Failed to create template")
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating template: {str(e)}")

@router.get("/templates", response_model=List[ContractTemplateResponse])
async def get_contract_templates(
    template_type: Optional[str] = Query(None, description="Filter by template type"),
    industry: Optional[str] = Query(None, description="Filter by industry"),
    is_public: Optional[bool] = Query(None, description="Filter by public status"),
    limit: int = Query(50, description="Number of templates to return"),
    offset: int = Query(0, description="Number of templates to skip")
):
    """Get all contract templates with optional filtering"""
    try:
        query = supabase.table("contract_templates").select("*")
        
        if template_type:
            query = query.eq("template_type", template_type)
        if industry:
            query = query.eq("industry", industry)
        if is_public is not None:
            query = query.eq("is_public", is_public)
            
        query = query.eq("is_active", True).range(offset, offset + limit - 1)
        result = query.execute()
        
        return [ContractTemplateResponse(**template) for template in result.data]
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching templates: {str(e)}")

@router.get("/templates/{template_id}", response_model=ContractTemplateResponse)
async def get_contract_template(template_id: str):
    """Get a specific contract template by ID"""
    try:
        result = supabase.table("contract_templates").select("*").eq("id", template_id).execute()
        
        if not result.data:
            raise HTTPException(status_code=404, detail="Template not found")
            
        return ContractTemplateResponse(**result.data[0])
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching template: {str(e)}")

# ============================================================================
# CONTRACT MILESTONES
# ============================================================================

@router.post("/{contract_id}/milestones", response_model=MilestoneResponse)
async def create_milestone(contract_id: str, milestone: MilestoneCreate):
    """Create a new milestone for a contract"""
    try:
        result = supabase.table("contract_milestones").insert({
            "contract_id": contract_id,
            **milestone.dict()
        }).execute()
        
        if result.data:
            return MilestoneResponse(**result.data[0])
        else:
            raise HTTPException(status_code=400, detail="Failed to create milestone")
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating milestone: {str(e)}")

@router.get("/{contract_id}/milestones", response_model=List[MilestoneResponse])
async def get_contract_milestones(contract_id: str):
    """Get all milestones for a contract"""
    try:
        result = supabase.table("contract_milestones").select("*").eq("contract_id", contract_id).execute()
        
        return [MilestoneResponse(**milestone) for milestone in result.data]
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching milestones: {str(e)}")

@router.put("/milestones/{milestone_id}", response_model=MilestoneResponse)
async def update_milestone(milestone_id: str, milestone_update: MilestoneUpdate):
    """Update a milestone"""
    try:
        update_data = milestone_update.dict(exclude_unset=True)
        if update_data:
            update_data["updated_at"] = datetime.utcnow().isoformat()
            
        result = supabase.table("contract_milestones").update(update_data).eq("id", milestone_id).execute()
        
        if not result.data:
            raise HTTPException(status_code=404, detail="Milestone not found")
            
        return MilestoneResponse(**result.data[0])
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error updating milestone: {str(e)}")

@router.delete("/milestones/{milestone_id}")
async def delete_milestone(milestone_id: str):
    """Delete a milestone"""
    try:
        result = supabase.table("contract_milestones").delete().eq("id", milestone_id).execute()
        
        if not result.data:
            raise HTTPException(status_code=404, detail="Milestone not found")
            
        return {"message": "Milestone deleted successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error deleting milestone: {str(e)}")

# ============================================================================
# CONTRACT DELIVERABLES
# ============================================================================

@router.post("/{contract_id}/deliverables", response_model=DeliverableResponse)
async def create_deliverable(contract_id: str, deliverable: DeliverableCreate):
    """Create a new deliverable for a contract"""
    try:
        result = supabase.table("contract_deliverables").insert({
            "contract_id": contract_id,
            **deliverable.dict()
        }).execute()
        
        if result.data:
            return DeliverableResponse(**result.data[0])
        else:
            raise HTTPException(status_code=400, detail="Failed to create deliverable")
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating deliverable: {str(e)}")

@router.get("/{contract_id}/deliverables", response_model=List[DeliverableResponse])
async def get_contract_deliverables(contract_id: str):
    """Get all deliverables for a contract"""
    try:
        result = supabase.table("contract_deliverables").select("*").eq("contract_id", contract_id).execute()
        
        return [DeliverableResponse(**deliverable) for deliverable in result.data]
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching deliverables: {str(e)}")

@router.put("/deliverables/{deliverable_id}", response_model=DeliverableResponse)
async def update_deliverable(deliverable_id: str, deliverable_update: DeliverableUpdate):
    """Update a deliverable"""
    try:
        update_data = deliverable_update.dict(exclude_unset=True)
        if update_data:
            update_data["updated_at"] = datetime.utcnow().isoformat()
            
        result = supabase.table("contract_deliverables").update(update_data).eq("id", deliverable_id).execute()
        
        if not result.data:
            raise HTTPException(status_code=404, detail="Deliverable not found")
            
        return DeliverableResponse(**result.data[0])
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error updating deliverable: {str(e)}")

@router.delete("/deliverables/{deliverable_id}")
async def delete_deliverable(deliverable_id: str):
    """Delete a deliverable"""
    try:
        result = supabase.table("contract_deliverables").delete().eq("id", deliverable_id).execute()
        
        if not result.data:
            raise HTTPException(status_code=404, detail="Deliverable not found")
            
        return {"message": "Deliverable deleted successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error deleting deliverable: {str(e)}")

# ============================================================================
# CONTRACT PAYMENTS
# ============================================================================

@router.post("/{contract_id}/payments", response_model=PaymentResponse)
async def create_payment(contract_id: str, payment: PaymentCreate, milestone_id: Optional[str] = None):
    """Create a new payment for a contract"""
    try:
        result = supabase.table("contract_payments").insert({
            "contract_id": contract_id,
            "milestone_id": milestone_id,
            **payment.dict()
        }).execute()
        
        if result.data:
            return PaymentResponse(**result.data[0])
        else:
            raise HTTPException(status_code=400, detail="Failed to create payment")
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating payment: {str(e)}")

@router.get("/{contract_id}/payments", response_model=List[PaymentResponse])
async def get_contract_payments(contract_id: str):
    """Get all payments for a contract"""
    try:
        result = supabase.table("contract_payments").select("*").eq("contract_id", contract_id).execute()
        
        return [PaymentResponse(**payment) for payment in result.data]
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching payments: {str(e)}")

@router.put("/payments/{payment_id}", response_model=PaymentResponse)
async def update_payment(payment_id: str, payment_update: PaymentUpdate):
    """Update a payment"""
    try:
        update_data = payment_update.dict(exclude_unset=True)
        if update_data:
            update_data["updated_at"] = datetime.utcnow().isoformat()
            
        result = supabase.table("contract_payments").update(update_data).eq("id", payment_id).execute()
        
        if not result.data:
            raise HTTPException(status_code=404, detail="Payment not found")
            
        return PaymentResponse(**result.data[0])
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error updating payment: {str(e)}")

@router.delete("/payments/{payment_id}")
async def delete_payment(payment_id: str):
    """Delete a payment"""
    try:
        result = supabase.table("contract_payments").delete().eq("id", payment_id).execute()
        
        if not result.data:
            raise HTTPException(status_code=404, detail="Payment not found")
            
        return {"message": "Payment deleted successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error deleting payment: {str(e)}")

# ============================================================================
# CONTRACT COMMENTS
# ============================================================================

@router.post("/{contract_id}/comments", response_model=CommentResponse)
async def create_comment(contract_id: str, comment: CommentCreate, user_id: str):
    """Create a new comment for a contract"""
    try:
        result = supabase.table("contract_comments").insert({
            "contract_id": contract_id,
            "user_id": user_id,
            **comment.dict()
        }).execute()
        
        if result.data:
            return CommentResponse(**result.data[0])
        else:
            raise HTTPException(status_code=400, detail="Failed to create comment")
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating comment: {str(e)}")

@router.get("/{contract_id}/comments", response_model=List[CommentResponse])
async def get_contract_comments(contract_id: str):
    """Get all comments for a contract"""
    try:
        result = supabase.table("contract_comments").select("*").eq("contract_id", contract_id).order("created_at", desc=True).execute()
        
        return [CommentResponse(**comment) for comment in result.data]
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching comments: {str(e)}")

@router.delete("/comments/{comment_id}")
async def delete_comment(comment_id: str):
    """Delete a comment"""
    try:
        result = supabase.table("contract_comments").delete().eq("id", comment_id).execute()
        
        if not result.data:
            raise HTTPException(status_code=404, detail="Comment not found")
            
        return {"message": "Comment deleted successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error deleting comment: {str(e)}")

# ============================================================================
# CONTRACT ANALYTICS
# ============================================================================

@router.get("/{contract_id}/analytics", response_model=List[AnalyticsResponse])
async def get_contract_analytics(contract_id: str):
    """Get analytics for a contract"""
    try:
        result = supabase.table("contract_analytics").select("*").eq("contract_id", contract_id).order("recorded_at", desc=True).execute()
        
        return [AnalyticsResponse(**analytics) for analytics in result.data]
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching analytics: {str(e)}")

@router.post("/{contract_id}/analytics", response_model=AnalyticsResponse)
async def create_contract_analytics(contract_id: str, analytics_data: Dict[str, Any]):
    """Create analytics entry for a contract"""
    try:
        result = supabase.table("contract_analytics").insert({
            "contract_id": contract_id,
            **analytics_data
        }).execute()
        
        if result.data:
            return AnalyticsResponse(**result.data[0])
        else:
            raise HTTPException(status_code=400, detail="Failed to create analytics entry")
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating analytics: {str(e)}")

# ============================================================================
# CONTRACT NOTIFICATIONS
# ============================================================================

@router.get("/{contract_id}/notifications", response_model=List[NotificationResponse])
async def get_contract_notifications(contract_id: str, user_id: Optional[str] = None):
    """Get notifications for a contract"""
    try:
        query = supabase.table("contract_notifications").select("*").eq("contract_id", contract_id)
        
        if user_id:
            query = query.eq("user_id", user_id)
            
        result = query.order("created_at", desc=True).execute()
        
        return [NotificationResponse(**notification) for notification in result.data]
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching notifications: {str(e)}")

@router.put("/notifications/{notification_id}/read")
async def mark_notification_read(notification_id: str):
    """Mark a notification as read"""
    try:
        result = supabase.table("contract_notifications").update({"is_read": True}).eq("id", notification_id).execute()
        
        if not result.data:
            raise HTTPException(status_code=404, detail="Notification not found")
            
        return {"message": "Notification marked as read"}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error updating notification: {str(e)}")

# ============================================================================
# CONTRACT STATISTICS
# ============================================================================

@router.get("/stats/overview")
async def get_contracts_overview(brand_id: Optional[str] = None, creator_id: Optional[str] = None):
    """Get overview statistics for contracts"""
    try:
        # Base query
        query = supabase.table("contracts").select("*")
        
        if brand_id:
            query = query.eq("brand_id", brand_id)
        if creator_id:
            query = query.eq("creator_id", creator_id)
            
        result = query.execute()
        contracts = result.data
        
        # Calculate statistics
        total_contracts = len(contracts)
        active_contracts = len([c for c in contracts if c.get("status") in ["signed", "active"]])
        completed_contracts = len([c for c in contracts if c.get("status") == "completed"])
        draft_contracts = len([c for c in contracts if c.get("status") == "draft"])
        
        total_budget = sum(c.get("total_budget", 0) for c in contracts if c.get("total_budget"))
        
        return {
            "total_contracts": total_contracts,
            "active_contracts": active_contracts,
            "completed_contracts": completed_contracts,
            "draft_contracts": draft_contracts,
            "total_budget": total_budget,
            "average_contract_value": total_budget / total_contracts if total_contracts > 0 else 0
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching contract statistics: {str(e)}")

# ============================================================================
# CONTRACT SEARCH - ENDPOINT MOVED ABOVE /{contract_id} ROUTE
# ============================================================================ 