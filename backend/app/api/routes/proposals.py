from fastapi import APIRouter, HTTPException, Depends, Query
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime, timezone
from app.core.supabase_clients import supabase_anon
from app.core.dependencies import get_current_brand, get_current_creator, get_current_user
import json
import re
from groq import Groq
from app.core.config import settings
from postgrest.exceptions import APIError
from fastapi import status as http_status
from uuid import uuid4

router = APIRouter()


# Delete a proposal (brand only)
@router.delete("/proposals/{proposal_id}", status_code=204)
async def delete_proposal(
    proposal_id: str,
    brand: dict = Depends(get_current_brand)
):
    """
    Delete a proposal. Only the brand who owns the proposal can delete it.
    """
    supabase = supabase_anon
    brand_id = brand['id']
    try:
        # Check if proposal exists and belongs to this brand
        prop_resp = supabase.table("proposals") \
            .select("id, brand_id") \
            .eq("id", proposal_id) \
            .single() \
            .execute()
        if not prop_resp.data:
            raise HTTPException(status_code=404, detail="Proposal not found")
        if prop_resp.data["brand_id"] != brand_id:
            raise HTTPException(status_code=403, detail="You do not have permission to delete this proposal")

        # Delete the proposal
        del_resp = supabase.table("proposals") \
            .delete() \
            .eq("id", proposal_id) \
            .execute()
        if del_resp.status_code >= 400:
            raise HTTPException(status_code=500, detail=f"Failed to delete proposal: {del_resp.data}")
        return
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error deleting proposal: {str(e)}")
"""
Proposals management routes for brands and creators.
"""



class ProposalCreate(BaseModel):
    """Schema for creating a new proposal."""
    campaign_id: str
    creator_id: str
    subject: str = Field(..., min_length=1, max_length=255)
    message: str = Field(..., min_length=1)
    proposed_amount: Optional[float] = None
    content_ideas: Optional[List[str]] = Field(default_factory=list)
    ideal_pricing: Optional[str] = None


class ProposalResponse(BaseModel):
    """Schema for proposal response."""
    id: str
    campaign_id: str
    brand_id: str
    creator_id: str
    subject: str
    message: str
    proposed_amount: Optional[float]
    content_ideas: Optional[List[str]]
    ideal_pricing: Optional[str]
    status: str
    created_at: datetime
    updated_at: datetime
    campaign_title: Optional[str] = None
    brand_name: Optional[str] = None
    creator_name: Optional[str] = None
    negotiation_status: Optional[str] = None
    negotiation_thread: Optional[List[Dict[str, Any]]] = None
    current_terms: Optional[Dict[str, Any]] = None
    version: Optional[int] = None
    contract_id: Optional[str] = None


class ContractResponse(BaseModel):
    """Schema for contract response."""
    id: str
    proposal_id: str
    brand_id: str
    creator_id: str
    terms: Dict[str, Any]
    status: str
    created_at: datetime
    updated_at: datetime
    brand_name: Optional[str] = None
    creator_name: Optional[str] = None
    proposal: Optional[ProposalResponse] = None
    negotiation_thread: Optional[List[Dict[str, Any]]] = None
    unsigned_contract_link: Optional[str] = None
    signed_contract_link: Optional[str] = None
    unsigned_contract_downloaded_by_creator: Optional[bool] = False
    signed_contract_downloaded_by_brand: Optional[bool] = False
    pending_status_change: Optional[Dict[str, Any]] = None


class AcceptNegotiationResponse(BaseModel):
    proposal: ProposalResponse
    contract: ContractResponse


class ProposalStatusUpdate(BaseModel):
    """Schema for updating proposal status."""
    status: str = Field(..., pattern="^(pending|accepted|declined|withdrawn)$")


def sanitize_content_ideas(value):
    """Ensure content_ideas is always a list of strings."""
    import json
    if isinstance(value, str):
        try:
            value = json.loads(value)
        except Exception:
            value = []
    if not isinstance(value, list):
        value = []
    # Ensure all items are strings
    sanitized = [str(item) for item in value if item is not None]
    if not sanitized:
        return None
    return sanitized

def clean_message_field(msg: str) -> str:
    """Clean message field if it contains JSON string."""
    if not msg or not isinstance(msg, str):
        return msg or ""

    if not msg.strip().startswith('{'):
        return msg

    try:
        # Try to parse as JSON, handling escaped strings
        msg_clean = msg.replace('\\\\n', '\n').replace('\\\\"', '"')
        msg_obj = json.loads(msg_clean)
        if isinstance(msg_obj, dict) and 'message' in msg_obj:
            return msg_obj['message']
    except Exception:
        pass

    try:
        # Try to extract message directly using regex
        match = re.search(r'"message"\s*:\s*"([^"]*(?:\\.[^"]*)*)"', msg)
        if match:
            extracted_msg = match.group(1)
            extracted_msg = extracted_msg.replace('\\n', '\n').replace('\\"', '"').replace('\\\\', '\\')
            return extracted_msg
    except Exception:
        pass

    return msg


def parse_datetime(dt_str: str) -> datetime:
    """Parse datetime string to datetime object."""
    if isinstance(dt_str, datetime):
        return dt_str

    try:
        # Handle ISO format with or without timezone
        if dt_str.endswith('Z'):
            dt_str = dt_str[:-1] + '+00:00'
        return datetime.fromisoformat(dt_str.replace('Z', '+00:00'))
    except Exception:
        return datetime.now(timezone.utc)


def normalize_json_field(value, default):
    """Ensure JSON fields are returned as the expected Python type."""
    if value is None:
        return default
    if isinstance(value, (dict, list)):
        return value
    if isinstance(value, str):
        try:
            parsed = json.loads(value)
            if isinstance(parsed, type(default)):
                return parsed
            return default
        except Exception:
            return default
    return default


def normalize_negotiation_thread(thread) -> List[Dict[str, Any]]:
    """Normalize negotiation thread to a list of dict entries."""
    normalized = normalize_json_field(thread, [])
    if not isinstance(normalized, list):
        return []
    cleaned = []
    for entry in normalized:
        if not isinstance(entry, dict):
            continue
        cleaned.append(entry)
    return cleaned


def normalize_current_terms(terms) -> Dict[str, Any]:
    """Normalize current terms to a dict."""
    normalized = normalize_json_field(terms, {})
    if not isinstance(normalized, dict):
        return {}
    return normalized


def normalize_proposal_record(
    prop: dict,
    brand_name: Optional[str] = None,
    creator_name: Optional[str] = None
) -> dict:
    """Normalize raw proposal data into consistent response dict."""
    proposal = dict(prop)

    # Clean message field
    if proposal.get("message"):
        proposal["message"] = clean_message_field(proposal["message"])

    # Parse datetimes
    if proposal.get("created_at"):
        proposal["created_at"] = parse_datetime(proposal["created_at"])
    if proposal.get("updated_at"):
        proposal["updated_at"] = parse_datetime(proposal["updated_at"])

    # Convert proposed_amount to float if needed
    if proposal.get("proposed_amount") is not None:
        try:
            proposal["proposed_amount"] = float(proposal["proposed_amount"])
        except (TypeError, ValueError):
            proposal["proposed_amount"] = None

    # Sanitize content ideas
    sanitized_content_ideas = sanitize_content_ideas(proposal.get("content_ideas"))
    proposal["content_ideas"] = sanitized_content_ideas

    # Negotiation fields
    proposal["negotiation_status"] = proposal.get("negotiation_status", "none")
    proposal["negotiation_thread"] = normalize_negotiation_thread(
        proposal.get("negotiation_thread")
    )
    proposal["current_terms"] = normalize_current_terms(
        proposal.get("current_terms")
    )
    proposal["version"] = proposal.get("version", 1)
    proposal["contract_id"] = proposal.get("contract_id")

    if brand_name:
        proposal["brand_name"] = brand_name
    if creator_name:
        proposal["creator_name"] = creator_name

    # Remove nested joins to avoid leaking raw data structures
    proposal.pop("campaigns", None)
    proposal.pop("creators", None)
    proposal.pop("brands", None)

    return proposal


def normalize_contract_record(contract: dict) -> dict:
    """Normalize raw contract data."""
    if not contract:
        return {}

    record = dict(contract)

    if record.get("created_at"):
        record["created_at"] = parse_datetime(record["created_at"])
    if record.get("updated_at"):
        record["updated_at"] = parse_datetime(record["updated_at"])

    record["terms"] = normalize_current_terms(record.get("terms"))

    proposal_data = None
    if isinstance(record.get("proposals"), dict):
        proposal_data = normalize_proposal_record(record["proposals"])
        if isinstance(record["proposals"].get("campaigns"), dict):
            proposal_data["campaign_title"] = record["proposals"]["campaigns"].get("title")
        if isinstance(record["proposals"].get("brands"), dict):
            proposal_data["brand_name"] = record["proposals"]["brands"].get("company_name")
        if isinstance(record["proposals"].get("creators"), dict):
            proposal_data["creator_name"] = record["proposals"]["creators"].get("display_name")

    record["proposal"] = proposal_data
    record["negotiation_thread"] = (
        proposal_data.get("negotiation_thread") if proposal_data else None
    )
    record["brand_name"] = record.get("brand_name") or (
        proposal_data.get("brand_name") if proposal_data else None
    )
    record["creator_name"] = record.get("creator_name") or (
        proposal_data.get("creator_name") if proposal_data else None
    )

    record.pop("proposals", None)

    return record


def build_thread_entry(
    sender_id: str,
    sender_role: str,
    message: str,
    entry_type: str = "message",
    meta: Optional[Dict[str, Any]] = None
) -> Dict[str, Any]:
    """Create a standardized negotiation thread entry."""
    entry = {
        "id": str(uuid4()),
        "sender_id": sender_id,
        "sender_role": sender_role,
        "message": message,
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "type": entry_type,
    }
    if meta:
        entry["meta"] = meta
    return entry


def fetch_brand_profile_by_user_id(user_id: str) -> Optional[dict]:
    """Fetch brand profile associated with the given user ID."""
    try:
        response = supabase_anon.table("brands") \
            .select("id, company_name") \
            .eq("user_id", user_id) \
            .single() \
            .execute()
        return response.data if response and response.data else None
    except Exception:
        return None


def fetch_creator_profile_by_user_id(user_id: str) -> Optional[dict]:
    """Fetch creator profile associated with the given user ID."""
    try:
        response = supabase_anon.table("creators") \
            .select("id, display_name") \
            .eq("user_id", user_id) \
            .single() \
            .execute()
        return response.data if response and response.data else None
    except Exception:
        return None


def fetch_proposal_with_joins(proposal_id: str) -> dict:
    """Fetch a proposal with joined campaign, brand, and creator data, handling serialization errors."""
    supabase = supabase_anon

    try:
        # Try to fetch with joins
        proposal_resp = supabase.table("proposals") \
            .select("id,campaign_id,brand_id,creator_id,subject,message,proposed_amount,content_ideas,ideal_pricing,status,created_at,updated_at,negotiation_status,negotiation_thread,current_terms,version,contract_id, campaigns(title), brands(company_name), creators(display_name)") \
            .eq("id", proposal_id) \
            .single() \
            .execute()
        if proposal_resp.data:
            return proposal_resp.data
    except APIError as api_error:
        # Handle serialization error
        error_dict = {}
        error_details = ''

        if api_error.args:
            if isinstance(api_error.args[0], dict):
                error_dict = api_error.args[0]
                error_details = error_dict.get('details', '')
            else:
                error_str = str(api_error.args[0])
                if "JSON could not be generated" in error_str:
                    code_match = re.search(r"'code'\s*:\s*(\d+)", error_str)
                    code_value = int(code_match.group(1)) if code_match else 0

                    if code_value == 200:
                        json_start = error_str.find('{"id"')
                        if json_start == -1:
                            json_start = error_str.find('{\"id\"')
                        if json_start >= 0:
                            brace_count = 0
                            json_end = json_start
                            for i in range(json_start, len(error_str)):
                                if error_str[i] == '{':
                                    brace_count += 1
                                elif error_str[i] == '}':
                                    brace_count -= 1
                                    if brace_count == 0:
                                        json_end = i + 1
                                        break
                            if json_end > json_start:
                                error_details = error_str[json_start:json_end]
                                error_dict = {'code': 200, 'message': 'JSON could not be generated', 'details': error_details}

        error_code = error_dict.get('code', 0) if isinstance(error_dict, dict) else 0
        error_msg = str(error_dict.get('message', '')) if isinstance(error_dict, dict) else str(api_error)

        if error_code == 200 and "JSON could not be generated" in error_msg and error_details:
            try:
                details_str = str(error_details)
                if details_str.startswith("b'") and details_str.endswith("'"):
                    details_str = details_str[2:-1]
                elif details_str.startswith("b\"") and details_str.endswith("\""):
                    details_str = details_str[2:-1]

                json_start = details_str.find('{')
                json_end = details_str.rfind('}') + 1
                if json_start >= 0 and json_end > json_start:
                    json_str = details_str[json_start:json_end]
                    json_str = json_str.replace('\\\\\\\\', '\\')
                    json_str = json_str.replace("\\'", "'")
                    proposal_data = json.loads(json_str)
                    if proposal_data:
                        # Fetch related data separately if needed
                        return proposal_data
            except Exception:
                pass

    # Fallback: fetch proposal without joins, then fetch related data separately
    try:
        proposal_resp = supabase.table("proposals") \
            .select("id,campaign_id,brand_id,creator_id,subject,message,proposed_amount,content_ideas,ideal_pricing,status,created_at,updated_at,negotiation_status,negotiation_thread,current_terms,version,contract_id") \
            .eq("id", proposal_id) \
            .single() \
            .execute()

        if proposal_resp.data:
            proposal_data = proposal_resp.data

            # Fetch campaign title separately
            try:
                campaign_resp = supabase.table("campaigns") \
                    .select("title") \
                    .eq("id", proposal_data["campaign_id"]) \
                    .single() \
                    .execute()
                if campaign_resp.data:
                    proposal_data["campaigns"] = {"title": campaign_resp.data.get("title")}
            except Exception:
                pass

            # Fetch brand name separately
            try:
                brand_resp = supabase.table("brands") \
                    .select("company_name") \
                    .eq("id", proposal_data["brand_id"]) \
                    .single() \
                    .execute()
                if brand_resp.data:
                    proposal_data["brands"] = {"company_name": brand_resp.data.get("company_name")}
            except Exception:
                pass

            # Fetch creator name separately
            try:
                creator_resp = supabase.table("creators") \
                    .select("display_name") \
                    .eq("id", proposal_data["creator_id"]) \
                    .single() \
                    .execute()
                if creator_resp.data:
                    proposal_data["creators"] = {"display_name": creator_resp.data.get("display_name")}
            except Exception:
                pass

            return proposal_data
    except Exception:
        pass

    raise HTTPException(status_code=404, detail="Proposal not found")


def fetch_proposal_by_id(proposal_id: str) -> dict:
    """Fetch a proposal by ID or raise 404."""
    try:
        proposal_resp = supabase_anon.table("proposals") \
            .select("*") \
            .eq("id", proposal_id) \
            .single() \
            .execute()
        if not proposal_resp.data:
            raise HTTPException(status_code=404, detail="Proposal not found")
        return proposal_resp.data
    except APIError as api_error:
        # Handle case where Supabase returns code 200 but can't serialize JSON
        # This happens when message field contains escaped characters
        # APIError.args[0] might be a dict or a string, so we need to handle both
        error_dict = {}
        error_details = ''

        if api_error.args:
            if isinstance(api_error.args[0], dict):
                error_dict = api_error.args[0]
                error_details = error_dict.get('details', '')
            else:
                # args[0] is a string - parse it
                error_str = str(api_error.args[0])
                # Check if it contains the serialization error
                if "JSON could not be generated" in error_str:
                    # Extract code first
                    code_match = re.search(r"'code'\s*:\s*(\d+)", error_str)
                    code_value = int(code_match.group(1)) if code_match else 0

                    if code_value == 200:
                        # Try to find the JSON object in the error string
                        # Look for the pattern: 'details': 'b\'{...}\''
                        # Or just find the first { and last } that contains "id"
                        json_start = error_str.find('{"id"')
                        if json_start == -1:
                            json_start = error_str.find('{\"id\"')
                        if json_start >= 0:
                            # Find the matching closing brace
                            brace_count = 0
                            json_end = json_start
                            for i in range(json_start, len(error_str)):
                                if error_str[i] == '{':
                                    brace_count += 1
                                elif error_str[i] == '}':
                                    brace_count -= 1
                                    if brace_count == 0:
                                        json_end = i + 1
                                        break
                            if json_end > json_start:
                                error_details = error_str[json_start:json_end]
                                # Remove b' prefix if present in the original string context
                                if 'b\\\'' in error_str[json_start-10:json_start] or "b'" in error_str[json_start-10:json_start]:
                                    # The JSON is already extracted, just need to unescape
                                    pass

                        error_dict = {'code': 200, 'message': 'JSON could not be generated', 'details': error_details}

        error_code = error_dict.get('code', 0) if isinstance(error_dict, dict) else 0
        error_msg = str(error_dict.get('message', '')) if isinstance(error_dict, dict) else str(api_error)

        if error_code == 200 and "JSON could not be generated" in error_msg:
            # Try to extract data from error details
            if not error_details and isinstance(error_dict, dict):
                error_details = error_dict.get('details', '')

            if error_details:
                try:
                    # The details might be a bytes string or regular string
                    if isinstance(error_details, bytes):
                        error_details = error_details.decode('utf-8')

                    # Extract JSON from the details string
                    # Format is typically: b'{"id":"...",...}'
                    # or just: {"id":"...",...}
                    details_str = str(error_details)

                    # Remove b' prefix and trailing quote if present
                    if details_str.startswith("b'") and details_str.endswith("'"):
                        details_str = details_str[2:-1]
                    elif details_str.startswith("b\"") and details_str.endswith("\""):
                        details_str = details_str[2:-1]

                    # Find the JSON object in the string
                    json_start = details_str.find('{')
                    json_end = details_str.rfind('}') + 1
                    if json_start >= 0 and json_end > json_start:
                        json_str = details_str[json_start:json_end]
                        # Unescape the string - handle double-escaped characters
                        # The JSON string has \\\\n (4 backslashes + n) which needs to become \n (1 backslash + n)
                        # Replace double backslashes: \\\\ -> \
                        # This converts \\\\n to \n, \\\\" to \", etc.
                        json_str = json_str.replace('\\\\\\\\', '\\')
                        # Also handle escaped single quotes: \\' -> '
                        json_str = json_str.replace("\\'", "'")
                        # Now the string should have proper JSON escape sequences
                        # Parse the JSON
                        proposal_data = json.loads(json_str)
                        if proposal_data:
                            return proposal_data
                except Exception as parse_error:
                    # Log the parse error for debugging but continue to fallback
                    import traceback
                    print(f"Failed to parse error details: {parse_error}")
                    print(traceback.format_exc())
                    pass

            # Fallback: try fetching with specific fields to avoid serialization issues
            try:
                proposal_resp = supabase_anon.table("proposals") \
                    .select("id,campaign_id,brand_id,creator_id,subject,message,proposed_amount,content_ideas,ideal_pricing,status,created_at,updated_at,negotiation_status,negotiation_thread,current_terms,version,contract_id") \
                    .eq("id", proposal_id) \
                    .single() \
                    .execute()
                if proposal_resp.data:
                    return proposal_resp.data
            except Exception:
                pass

            # If all else fails, raise the original error
            raise HTTPException(
                status_code=500,
                detail=f"Failed to fetch proposal due to data serialization issue: {error_msg}"
            )
        else:
            # Re-raise if it's not the serialization error
            raise HTTPException(
                status_code=500,
                detail=f"Failed to fetch proposal: {error_msg}"
            )


class NegotiationStartRequest(BaseModel):
    initial_message: Optional[str] = Field(
        None, min_length=1, max_length=5000
    )
    proposed_terms: Optional[Dict[str, Any]] = Field(
        default=None,
        description="Optional proposed terms in JSON format"
    )


class NegotiationMessageRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=5000)


class NegotiationTermsUpdateRequest(BaseModel):
    terms: Dict[str, Any] = Field(
        ...,
        description="Updated terms provided by the brand"
    )
    note: Optional[str] = Field(
        None,
        description="Optional message to accompany the terms update",
        max_length=5000
    )


class AcceptNegotiationRequest(BaseModel):
    message: Optional[str] = Field(
        None,
        description="Optional message from the creator when accepting",
        max_length=5000
    )


@router.post("/proposals", response_model=ProposalResponse, status_code=201)
async def create_proposal(
    proposal: ProposalCreate,
    brand: dict = Depends(get_current_brand)
):
    """Create a new proposal from a brand to a creator."""
    supabase = supabase_anon
    brand_id = brand['id']

    try:
        # Verify campaign belongs to brand
        campaign_resp = supabase.table("campaigns") \
            .select("id, title, brand_id") \
            .eq("id", proposal.campaign_id) \
            .eq("brand_id", brand_id) \
            .single() \
            .execute()

        if not campaign_resp.data:
            raise HTTPException(status_code=404, detail="Campaign not found")

        # Verify creator exists
        creator_resp = supabase.table("creators") \
            .select("id, display_name") \
            .eq("id", proposal.creator_id) \
            .eq("is_active", True) \
            .single() \
            .execute()

        if not creator_resp.data:
            raise HTTPException(status_code=404, detail="Creator not found")

        # Check if proposal already exists
        existing = supabase.table("proposals") \
            .select("id") \
            .eq("campaign_id", proposal.campaign_id) \
            .eq("creator_id", proposal.creator_id) \
            .eq("brand_id", brand_id) \
            .execute()

        if existing.data:
            raise HTTPException(
                status_code=400,
                detail="A proposal already exists for this creator and campaign"
            )

        # Clean message field
        clean_msg = clean_message_field(proposal.message)

        # Sanitize content_ideas
        content_ideas = sanitize_content_ideas(proposal.content_ideas)

        proposal_data = {
            "campaign_id": proposal.campaign_id,
            "brand_id": brand_id,
            "creator_id": proposal.creator_id,
            "subject": proposal.subject,
            "message": clean_msg,
            "proposed_amount": proposal.proposed_amount,
            "content_ideas": content_ideas,
            "ideal_pricing": proposal.ideal_pricing,
            "status": "pending"
        }

        result = supabase.table("proposals").insert(proposal_data).execute()

        if not result.data:
            raise HTTPException(status_code=500, detail="Failed to create proposal")

        proposal_obj = result.data[0]

        normalized = normalize_proposal_record(
            proposal_obj,
            brand_name=brand.get("company_name", "Unknown Brand"),
            creator_name=creator_resp.data.get("display_name")
        )
        normalized["campaign_title"] = campaign_resp.data.get("title")

        return normalized

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error creating proposal: {str(e)}"
        ) from e


@router.get("/proposals/sent", response_model=List[ProposalResponse])
async def get_sent_proposals(
    brand: dict = Depends(get_current_brand),
    status: Optional[str] = Query(None, description="Filter by status"),
    negotiation_status: Optional[str] = Query(
        None,
        description="Filter by negotiation status (e.g., none, open, finalized, declined)"
    ),
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0)
):
    """Get all proposals sent by the current brand."""
    supabase = supabase_anon
    brand_id = brand['id']

    try:
        query = supabase.table("proposals") \
            .select("*, campaigns(title), creators(display_name)") \
            .eq("brand_id", brand_id) \
            .order("created_at", desc=True) \
            .range(offset, offset + limit - 1)

        if status:
            query = query.eq("status", status)
        if negotiation_status:
            if negotiation_status == "active":
                query = query.neq("negotiation_status", "none")
            else:
                query = query.eq("negotiation_status", negotiation_status)

        result = query.execute()

        proposals = []
        brand_display_name = brand.get("company_name", "Unknown Brand")
        for prop in (result.data or []):
            creator_name = None
            if isinstance(prop.get("creators"), dict):
                creator_name = prop["creators"].get("display_name")

            proposal = normalize_proposal_record(
                prop,
                brand_name=brand_display_name,
                creator_name=creator_name
            )

            if isinstance(prop.get("campaigns"), dict):
                proposal["campaign_title"] = prop["campaigns"].get("title")

            proposals.append(proposal)

        return proposals

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error fetching proposals: {str(e)}"
        ) from e


@router.get("/proposals/received", response_model=List[ProposalResponse])
async def get_received_proposals(
    creator: dict = Depends(get_current_creator),
    status: Optional[str] = Query(None, description="Filter by status"),
    negotiation_status: Optional[str] = Query(
        None,
        description="Filter by negotiation status (e.g., none, open, finalized, declined)"
    ),
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0)
):
    """Get all proposals received by the current creator."""
    supabase = supabase_anon
    creator_id = creator['id']

    try:
        query = supabase.table("proposals") \
            .select("*, campaigns(title), brands(company_name)") \
            .eq("creator_id", creator_id) \
            .order("created_at", desc=True) \
            .range(offset, offset + limit - 1)

        if status:
            query = query.eq("status", status)
        if negotiation_status:
            if negotiation_status == "active":
                query = query.neq("negotiation_status", "none")
            else:
                query = query.eq("negotiation_status", negotiation_status)

        result = query.execute()

        proposals = []
        for prop in (result.data or []):
            brand_name = None
            if isinstance(prop.get("brands"), dict):
                brand_name = prop["brands"].get("company_name", "Unknown Brand")

            proposal = normalize_proposal_record(
                prop,
                brand_name=brand_name,
                creator_name=prop.get("creator_name")
            )

            if isinstance(prop.get("campaigns"), dict):
                proposal["campaign_title"] = prop["campaigns"].get("title")
            if brand_name:
                proposal["brand_name"] = brand_name

            proposals.append(proposal)

        return proposals

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error fetching proposals: {str(e)}"
        ) from e


@router.put("/proposals/{proposal_id}/status", response_model=ProposalResponse)
async def update_proposal_status(
    proposal_id: str,
    status_update: ProposalStatusUpdate,
    user: dict = Depends(get_current_user)
):
    """Update proposal status. Can be called by either brand (to withdraw) or creator (to accept/decline)."""
    supabase = supabase_anon

    try:
        # Get proposal
        prop_resp = supabase.table("proposals") \
            .select("*") \
            .eq("id", proposal_id) \
            .single() \
            .execute()

        if not prop_resp.data:
            raise HTTPException(status_code=404, detail="Proposal not found")

        proposal = prop_resp.data
        user_id = user['id']

        # Fetch brand to get user_id
        brand_resp = supabase.table("brands") \
            .select("id, user_id, company_name") \
            .eq("id", proposal["brand_id"]) \
            .single() \
            .execute()
        brand_user_id = brand_resp.data.get("user_id") if brand_resp.data else None
        brand_data = brand_resp.data if brand_resp.data else None

        # Fetch creator to get user_id
        creator_resp = supabase.table("creators") \
            .select("id, user_id, display_name") \
            .eq("id", proposal["creator_id"]) \
            .single() \
            .execute()
        creator_user_id = creator_resp.data.get("user_id") if creator_resp.data else None
        creator_data = creator_resp.data if creator_resp.data else None

        # Permission check
        can_update = False
        if status_update.status == "withdrawn" and brand_user_id == user_id:
            can_update = True
        elif status_update.status in ["accepted", "declined"] and creator_user_id == user_id:
            can_update = True

        if not can_update:
            raise HTTPException(
                status_code=403,
                detail="You don't have permission to update this proposal"
            )

        # Update only status - Supabase has serialization issues with returning data
        # We'll update without expecting a response, and handle the serialization error
        update_data = {
            "status": status_update.status
        }

        # Update the proposal - Supabase will try to return the row but may fail to serialize
        # Code 200 with "JSON could not be generated" means the update succeeded
        try:
            # Update without any select - Supabase will still try to return data by default
            supabase.table("proposals") \
                .update(update_data) \
                .eq("id", proposal_id) \
                .execute()
            # If we get here without exception, update succeeded
        except APIError as api_error:
            # Check if this is a serialization error (code 200 = success but can't serialize)
            error_dict = api_error.args[0] if api_error.args else {}
            error_code = error_dict.get('code', 0)
            error_msg = str(error_dict.get('message', ''))

            # Code 200 means the update succeeded, but Supabase can't serialize the response
            if error_code == 200:
                # Update succeeded - the error is just about serialization
                # We'll continue and build response from original data
                pass
            else:
                # Real error (not code 200) - this is a failure
                raise HTTPException(
                    status_code=500,
                    detail=f"Failed to update proposal: {error_msg}"
                )
        except Exception as update_error:
            # Other unexpected errors
            error_msg = str(update_error)
            # Check if it's the serialization error in string form
            if "code': 200" in error_msg or "JSON could not be generated" in error_msg:
                # Still a serialization error - update likely succeeded
                pass
            else:
                raise HTTPException(
                    status_code=500,
                    detail=f"Failed to update proposal: {error_msg}"
                )

        # Fetch updated proposal for clean response using safe helper
        refreshed = fetch_proposal_with_joins(proposal_id)

        brand_name = None
        creator_name = None
        if isinstance(refreshed.get("brands"), dict):
            brand_name = refreshed["brands"].get("company_name", "Unknown Brand")
        elif brand_data:
            brand_name = brand_data.get("company_name", "Unknown Brand")

        if isinstance(refreshed.get("creators"), dict):
            creator_name = refreshed["creators"].get("display_name")
        elif creator_data:
            creator_name = creator_data.get("display_name")

        normalized = normalize_proposal_record(
            refreshed,
            brand_name=brand_name,
            creator_name=creator_name
        )

        if isinstance(refreshed.get("campaigns"), dict):
            normalized["campaign_title"] = refreshed["campaigns"].get("title")

        normalized["status"] = status_update.status

        return ProposalResponse.model_validate(normalized)

    except HTTPException:
        raise
    except Exception as e:
        import traceback
        print(f"Error updating proposal {proposal_id}: {str(e)}")
        print(traceback.format_exc())
        raise HTTPException(
            status_code=500,
            detail=f"Error updating proposal: {str(e)}"
        ) from e


@router.post(
    "/proposals/{proposal_id}/negotiation/start",
    response_model=ProposalResponse,
    status_code=201
)
async def start_negotiation(
    proposal_id: str,
    payload: NegotiationStartRequest,
    creator: dict = Depends(get_current_creator)
):
    """Creator starts a negotiation on a proposal."""
    supabase = supabase_anon

    if not payload.initial_message and not payload.proposed_terms:
        raise HTTPException(
            status_code=400,
            detail="Provide a message or proposed terms to start negotiation"
        )

    proposal = fetch_proposal_by_id(proposal_id)
    # Patch: sanitize content_ideas before any further use
    proposal["content_ideas"] = sanitize_content_ideas(proposal.get("content_ideas"))

    if proposal["creator_id"] != creator["id"]:
        raise HTTPException(
            status_code=403,
            detail="You do not have access to this proposal"
        )

    negotiation_status = proposal.get("negotiation_status", "none")
    if negotiation_status == "open":
        raise HTTPException(
            status_code=400,
            detail="Negotiation already in progress for this proposal"
        )
    if negotiation_status == "finalized":
        raise HTTPException(
            status_code=400,
            detail="Negotiation already finalized for this proposal"
        )

    thread = normalize_negotiation_thread(proposal.get("negotiation_thread"))

    if payload.initial_message:
        thread.append(
            build_thread_entry(
                sender_id=creator["id"],
                sender_role="Creator",
                message=payload.initial_message,
                entry_type="message"
            )
        )

    if payload.proposed_terms:
        message_text = payload.initial_message or "Creator proposed updated terms."
        thread.append(
            build_thread_entry(
                sender_id=creator["id"],
                sender_role="Creator",
                message=message_text,
                entry_type="terms_proposal",
                meta={"terms": payload.proposed_terms}
            )
        )

    update_data = {
        "negotiation_status": "open",
        "negotiation_thread": thread,
    }

    if payload.proposed_terms:
        update_data["current_terms"] = payload.proposed_terms
        current_version = proposal.get("version") or 1
        update_data["version"] = current_version + 1

    try:
        supabase.table("proposals") \
            .update(update_data) \
            .eq("id", proposal_id) \
            .execute()
    except APIError as api_error:
        # Handle serialization error - update might have succeeded
        error_dict = api_error.args[0] if api_error.args and isinstance(api_error.args[0], dict) else {}
        error_code = error_dict.get('code', 0)
        if error_code != 200:
            raise HTTPException(
                status_code=500,
                detail=f"Failed to start negotiation: {str(api_error)}"
            ) from api_error
        # Code 200 means update succeeded but can't serialize response
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to start negotiation: {str(e)}"
        ) from e

    # Fetch updated proposal using the safe helper function
    refreshed = fetch_proposal_with_joins(proposal_id)

    brand_name = None
    if isinstance(refreshed.get("brands"), dict):
        brand_name = refreshed["brands"].get("company_name", "Unknown Brand")

    normalized = normalize_proposal_record(
        refreshed,
        brand_name=brand_name,
        creator_name=creator.get("display_name")
    )

    if isinstance(refreshed.get("campaigns"), dict):
        normalized["campaign_title"] = refreshed["campaigns"].get("title")

    normalized["negotiation_status"] = "open"

    return ProposalResponse.model_validate(normalized)


@router.post(
    "/proposals/{proposal_id}/negotiation/messages",
    response_model=ProposalResponse
)
async def post_negotiation_message(
    proposal_id: str,
    payload: NegotiationMessageRequest,
    user: dict = Depends(get_current_user)
):
    """Post a new message to the negotiation thread."""
    supabase = supabase_anon
    proposal = fetch_proposal_by_id(proposal_id)

    if proposal.get("negotiation_status") != "open":
        raise HTTPException(
            status_code=400,
            detail="Negotiation is not active for this proposal"
        )

    sender_role = user.get("role")
    sender_id = None
    brand_profile = None
    creator_profile = None

    if sender_role == "Brand":
        brand_profile = fetch_brand_profile_by_user_id(user["id"])
        if not brand_profile or brand_profile.get("id") != proposal["brand_id"]:
            raise HTTPException(
                status_code=403,
                detail="You do not have permission to message on this negotiation"
            )
        sender_id = brand_profile["id"]
        sender_role_label = "Brand"
    elif sender_role == "Creator":
        creator_profile = fetch_creator_profile_by_user_id(user["id"])
        if not creator_profile or creator_profile.get("id") != proposal["creator_id"]:
            raise HTTPException(
                status_code=403,
                detail="You do not have permission to message on this negotiation"
            )
        sender_id = creator_profile["id"]
        sender_role_label = "Creator"
    else:
        raise HTTPException(
            status_code=403,
            detail="Only brands and creators can participate in negotiations"
        )

    thread = normalize_negotiation_thread(proposal.get("negotiation_thread"))
    thread.append(
        build_thread_entry(
            sender_id=sender_id,
            sender_role=sender_role_label,
            message=payload.message,
            entry_type="message"
        )
    )

    try:
        supabase.table("proposals") \
            .update({"negotiation_thread": thread}) \
            .eq("id", proposal_id) \
            .execute()
    except APIError as api_error:
        # Handle serialization error - update might have succeeded
        error_dict = api_error.args[0] if api_error.args and isinstance(api_error.args[0], dict) else {}
        error_code = error_dict.get('code', 0)
        if error_code != 200:
            raise HTTPException(
                status_code=500,
                detail=f"Failed to post message: {str(api_error)}"
            ) from api_error
        # Code 200 means update succeeded but can't serialize response
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to post message: {str(e)}"
        ) from e

    # Fetch updated proposal using the safe helper function
    refreshed = fetch_proposal_with_joins(proposal_id)

    brand_name = None
    creator_name = None
    if isinstance(refreshed.get("brands"), dict):
        brand_name = refreshed["brands"].get("company_name", "Unknown Brand")
    elif brand_profile:
        brand_name = brand_profile.get("company_name")

    if isinstance(refreshed.get("creators"), dict):
        creator_name = refreshed["creators"].get("display_name")
    elif creator_profile:
        creator_name = creator_profile.get("display_name")

    normalized = normalize_proposal_record(
        refreshed,
        brand_name=brand_name,
        creator_name=creator_name
    )

    if isinstance(refreshed.get("campaigns"), dict):
        normalized["campaign_title"] = refreshed["campaigns"].get("title")

    return ProposalResponse.model_validate(normalized)


@router.put(
    "/proposals/{proposal_id}/negotiation/terms",
    response_model=ProposalResponse
)
async def update_negotiation_terms(
    proposal_id: str,
    payload: NegotiationTermsUpdateRequest,
    brand: dict = Depends(get_current_brand)
):
    """Brand updates the proposal terms during negotiation."""
    supabase = supabase_anon
    proposal = fetch_proposal_by_id(proposal_id)

    if proposal["brand_id"] != brand["id"]:
        raise HTTPException(
            status_code=403,
            detail="You do not have access to this proposal"
        )

    if proposal.get("negotiation_status") != "open":
        raise HTTPException(
            status_code=400,
            detail="Negotiation is not active for this proposal"
        )

    if not payload.terms:
        raise HTTPException(
            status_code=400,
            detail="Updated terms cannot be empty"
        )

    thread = normalize_negotiation_thread(proposal.get("negotiation_thread"))
    note_message = payload.note or "Brand updated the proposal terms."
    thread.append(
        build_thread_entry(
            sender_id=brand["id"],
            sender_role="Brand",
            message=note_message,
            entry_type="terms_update",
            meta={"terms": payload.terms}
        )
    )

    update_data = {
        "current_terms": payload.terms,
        "version": (proposal.get("version") or 1) + 1,
        "negotiation_thread": thread,
    }

    try:
        supabase.table("proposals") \
            .update(update_data) \
            .eq("id", proposal_id) \
            .execute()
    except APIError as api_error:
        # Handle serialization error - update might have succeeded
        error_dict = api_error.args[0] if api_error.args and isinstance(api_error.args[0], dict) else {}
        error_code = error_dict.get('code', 0)
        if error_code != 200:
            raise HTTPException(
                status_code=500,
                detail=f"Failed to update negotiation terms: {str(api_error)}"
            ) from api_error
        # Code 200 means update succeeded but can't serialize response
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to update negotiation terms: {str(e)}"
        ) from e

    # Fetch updated proposal using the safe helper function
    refreshed = fetch_proposal_with_joins(proposal_id)

    brand_name = None
    creator_name = None
    if isinstance(refreshed.get("brands"), dict):
        brand_name = refreshed["brands"].get("company_name", "Unknown Brand")
    else:
        brand_name = brand.get("company_name")

    if isinstance(refreshed.get("creators"), dict):
        creator_name = refreshed["creators"].get("display_name")

    normalized = normalize_proposal_record(
        refreshed,
        brand_name=brand_name,
        creator_name=creator_name
    )

    if isinstance(refreshed.get("campaigns"), dict):
        normalized["campaign_title"] = refreshed["campaigns"].get("title")

    return ProposalResponse.model_validate(normalized)


@router.post(
    "/proposals/{proposal_id}/negotiation/accept",
    response_model=AcceptNegotiationResponse
)
async def accept_negotiation_terms(
    proposal_id: str,
    payload: AcceptNegotiationRequest,
    creator: dict = Depends(get_current_creator)
):
    """Creator accepts the latest negotiation terms to finalize the deal."""
    supabase = supabase_anon
    proposal = fetch_proposal_by_id(proposal_id)

    if proposal["creator_id"] != creator["id"]:
        raise HTTPException(
            status_code=403,
            detail="You do not have access to this proposal"
        )

    if proposal.get("negotiation_status") != "open":
        raise HTTPException(
            status_code=400,
            detail="Negotiation is not active for this proposal"
        )

    current_terms = normalize_current_terms(proposal.get("current_terms"))
    if not current_terms:
        raise HTTPException(
            status_code=400,
            detail="No terms available to accept"
        )

    thread = normalize_negotiation_thread(proposal.get("negotiation_thread"))

    if payload.message:
        thread.append(
            build_thread_entry(
                sender_id=creator["id"],
                sender_role="Creator",
                message=payload.message,
                entry_type="message"
            )
        )

    thread.append(
        build_thread_entry(
            sender_id=creator["id"],
            sender_role="Creator",
            message="Creator accepted the latest terms.",
            entry_type="acceptance",
            meta={"terms": current_terms}
        )
    )

    contract_payload = {
        "proposal_id": proposal["id"],
        "brand_id": proposal["brand_id"],
        "creator_id": proposal["creator_id"],
        "terms": current_terms,
        "status": "awaiting_signature"
    }

    try:
        contract_resp = supabase.table("contracts") \
            .insert(contract_payload) \
            .execute()
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to create contract: {str(e)}"
        ) from e

    if not contract_resp.data:
        raise HTTPException(
            status_code=500,
            detail="Failed to create contract record"
        )

    contract_record = contract_resp.data[0]

    # Copy deliverables from campaign_deliverables to contract_deliverables
    try:
        campaign_id = proposal.get("campaign_id")
        if campaign_id:
            # Fetch all deliverables for the campaign
            campaign_deliverables_resp = supabase.table("campaign_deliverables") \
                .select("*") \
                .eq("campaign_id", campaign_id) \
                .execute()

            campaign_deliverables = campaign_deliverables_resp.data or []

            if campaign_deliverables:
                # Create contract deliverables from campaign deliverables
                contract_deliverables_data = []
                for camp_deliv in campaign_deliverables:
                    # Build description from campaign deliverable data
                    description_parts = []
                    if camp_deliv.get("content_type"):
                        description_parts.append(camp_deliv["content_type"])
                    if camp_deliv.get("platform"):
                        description_parts.append(f"on {camp_deliv['platform']}")
                    if camp_deliv.get("quantity") and camp_deliv["quantity"] > 1:
                        description_parts.append(f"({camp_deliv['quantity']} items)")
                    if camp_deliv.get("guidance"):
                        description_parts.append(f"- {camp_deliv['guidance']}")

                    description = " ".join(description_parts) if description_parts else "Deliverable"

                    contract_deliverable = {
                        "contract_id": contract_record["id"],
                        "campaign_deliverable_id": camp_deliv["id"],
                        "description": description,
                        "status": "pending",
                        "brand_approval": False,
                        "creator_approval": False,
                    }
                    contract_deliverables_data.append(contract_deliverable)

                # Insert all contract deliverables
                if contract_deliverables_data:
                    supabase.table("contract_deliverables") \
                        .insert(contract_deliverables_data) \
                        .execute()
    except Exception as e:
        # Log the error but don't fail the contract creation
        # This ensures contract creation succeeds even if deliverable copying fails
        import logging
        logger = logging.getLogger(__name__)
        logger.warning(f"Failed to copy deliverables to contract: {str(e)}")

    update_data = {
        "negotiation_status": "finalized",
        "status": "accepted",
        "contract_id": contract_record["id"],
        "negotiation_thread": thread,
    }

    try:
        supabase.table("proposals") \
            .update(update_data) \
            .eq("id", proposal_id) \
            .execute()
    except APIError as api_error:
        # Handle serialization error - update might have succeeded
        error_dict = api_error.args[0] if api_error.args and isinstance(api_error.args[0], dict) else {}
        error_code = error_dict.get('code', 0)
        if error_code != 200:
            raise HTTPException(
                status_code=500,
                detail=f"Failed to finalize negotiation: {str(api_error)}"
            ) from api_error
        # Code 200 means update succeeded but can't serialize response
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to finalize negotiation: {str(e)}"
        ) from e

    # Fetch updated proposal using the safe helper function
    refreshed_proposal = fetch_proposal_with_joins(proposal_id)

    # Fetch contract - use explicit fields to avoid serialization issues
    try:
        refreshed_contract_resp = supabase.table("contracts") \
            .select("id,proposal_id,brand_id,creator_id,terms,status,created_at,updated_at") \
            .eq("id", contract_record["id"]) \
            .single() \
            .execute()
        refreshed_contract = refreshed_contract_resp.data if refreshed_contract_resp and refreshed_contract_resp.data else None
    except APIError as api_error:
        # Handle serialization error
        error_dict = api_error.args[0] if api_error.args and isinstance(api_error.args[0], dict) else {}
        error_code = error_dict.get('code', 0)
        if error_code == 200:
            # Try to fetch without joins
            refreshed_contract_resp = supabase.table("contracts") \
                .select("id,proposal_id,brand_id,creator_id,terms,status,created_at,updated_at") \
                .eq("id", contract_record["id"]) \
                .single() \
                .execute()
            refreshed_contract = refreshed_contract_resp.data if refreshed_contract_resp and refreshed_contract_resp.data else None
        else:
            raise HTTPException(status_code=500, detail=f"Failed to fetch contract: {str(api_error)}") from api_error
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch contract: {str(e)}") from e

    if not refreshed_contract:
        raise HTTPException(status_code=500, detail="Failed to fetch contract data")

    # Add proposal data from the already fetched proposal
    refreshed_contract["proposals"] = refreshed_proposal

    brand_name = None
    creator_name = None
    if isinstance(refreshed_proposal.get("brands"), dict):
        brand_name = refreshed_proposal["brands"].get("company_name", "Unknown Brand")
    if isinstance(refreshed_proposal.get("creators"), dict):
        creator_name = refreshed_proposal["creators"].get("display_name")

    normalized_proposal = normalize_proposal_record(
        refreshed_proposal,
        brand_name=brand_name,
        creator_name=creator_name
    )
    if isinstance(refreshed_proposal.get("campaigns"), dict):
        normalized_proposal["campaign_title"] = refreshed_proposal["campaigns"].get("title")

    normalized_contract = normalize_contract_record(refreshed_contract)
    if brand_name and not normalized_contract.get("brand_name"):
        normalized_contract["brand_name"] = brand_name
    if creator_name and not normalized_contract.get("creator_name"):
        normalized_contract["creator_name"] = creator_name

    if normalized_contract.get("proposal"):
        # Ensure nested proposal includes enriched fields
        proposal_instance = ProposalResponse.model_validate(
            normalized_proposal
        )
        normalized_contract["proposal"] = proposal_instance
        normalized_contract["negotiation_thread"] = proposal_instance.negotiation_thread

    return AcceptNegotiationResponse(
        proposal=ProposalResponse.model_validate(normalized_proposal),
        contract=ContractResponse.model_validate(normalized_contract)
    )


@router.get(
    "/proposals/negotiations",
    response_model=List[ProposalResponse]
)
async def list_negotiations(
    status: Optional[str] = Query(None, description="Filter by negotiation status"),
    user: dict = Depends(get_current_user)
):
    """Fetch proposals for the current user filtered by negotiation status."""
    supabase = supabase_anon
    role = user.get("role")

    if role not in ("Brand", "Creator"):
        raise HTTPException(
            status_code=403,
            detail="Only brands and creators can view negotiations"
        )

    brand_profile = None
    creator_profile = None

    if role == "Brand":
        brand_profile = fetch_brand_profile_by_user_id(user["id"])
        if not brand_profile:
            raise HTTPException(
                status_code=404,
                detail="Brand profile not found"
            )
        query = supabase.table("proposals") \
            .select("*, campaigns(title), brands(company_name), creators(display_name)") \
            .eq("brand_id", brand_profile["id"]) \
            .order("updated_at", desc=True)
    else:
        creator_profile = fetch_creator_profile_by_user_id(user["id"])
        if not creator_profile:
            raise HTTPException(
                status_code=404,
                detail="Creator profile not found"
            )
        query = supabase.table("proposals") \
            .select("*, campaigns(title), brands(company_name), creators(display_name)") \
            .eq("creator_id", creator_profile["id"]) \
            .order("updated_at", desc=True)

    if status:
        query = query.eq("negotiation_status", status)
    else:
        query = query.neq("negotiation_status", "none")

    response = query.execute()

    negotiations = []
    for prop in (response.data or []):
        brand_name = None
        creator_name = None
        if isinstance(prop.get("brands"), dict):
            brand_name = prop["brands"].get("company_name", "Unknown Brand")
        if isinstance(prop.get("creators"), dict):
            creator_name = prop["creators"].get("display_name")

        normalized = normalize_proposal_record(
            prop,
            brand_name=brand_name,
            creator_name=creator_name
        )

        if isinstance(prop.get("campaigns"), dict):
            normalized["campaign_title"] = prop["campaigns"].get("title")

        negotiations.append(normalized)

    return [ProposalResponse.model_validate(item) for item in negotiations]


def _normalize_contract_response(record: dict) -> ContractResponse:
    """Helper to normalize and build ContractResponse model."""
    normalized = normalize_contract_record(record)

    proposal_payload = normalized.get("proposal")
    proposal_model = None
    if proposal_payload:
        proposal_model = ProposalResponse.model_validate(proposal_payload)
        normalized["proposal"] = proposal_model
        normalized["negotiation_thread"] = proposal_model.negotiation_thread
    else:
        normalized["proposal"] = None
        normalized["negotiation_thread"] = None

    # Include contract link fields and tracking
    normalized["unsigned_contract_link"] = record.get("unsigned_contract_link")
    normalized["signed_contract_link"] = record.get("signed_contract_link")
    normalized["unsigned_contract_downloaded_by_creator"] = record.get("unsigned_contract_downloaded_by_creator", False)
    normalized["signed_contract_downloaded_by_brand"] = record.get("signed_contract_downloaded_by_brand", False)
    normalized["pending_status_change"] = normalize_json_field(record.get("pending_status_change"), None)

    return ContractResponse.model_validate(normalized)


@router.get(
    "/contracts",
    response_model=List[ContractResponse]
)
async def list_contracts(
    status: Optional[str] = Query(None, description="Filter contracts by status"),
    user: dict = Depends(get_current_user)
):
    """Fetch contracts for the authenticated brand or creator."""
    supabase = supabase_anon
    role = user.get("role")

    if role not in ("Brand", "Creator"):
        raise HTTPException(
            status_code=403,
            detail="Only brands and creators can view contracts"
        )

    brand_profile = None
    creator_profile = None

    if role == "Brand":
        brand_profile = fetch_brand_profile_by_user_id(user["id"])
        if not brand_profile:
            raise HTTPException(status_code=404, detail="Brand profile not found")
        query = supabase.table("contracts") \
            .select("*, proposals(*, campaigns(title), brands(company_name), creators(display_name))") \
            .eq("brand_id", brand_profile["id"]) \
            .order("updated_at", desc=True)
    else:
        creator_profile = fetch_creator_profile_by_user_id(user["id"])
        if not creator_profile:
            raise HTTPException(status_code=404, detail="Creator profile not found")
        query = supabase.table("contracts") \
            .select("*, proposals(*, campaigns(title), brands(company_name), creators(display_name))") \
            .eq("creator_id", creator_profile["id"]) \
            .order("updated_at", desc=True)

    if status:
        query = query.eq("status", status)

    try:
        response = query.execute()
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch contracts: {str(e)}"
        ) from e

    records = response.data or []
    return [_normalize_contract_response(record) for record in records]


@router.get(
    "/contracts/{contract_id}",
    response_model=ContractResponse
)
async def get_contract_detail(
    contract_id: str,
    user: dict = Depends(get_current_user)
):
    """Fetch a single contract with negotiation history."""
    supabase = supabase_anon
    role = user.get("role")

    if role not in ("Brand", "Creator"):
        raise HTTPException(
            status_code=403,
            detail="Only brands and creators can view contracts"
        )

    try:
        record_resp = supabase.table("contracts") \
            .select("*, proposals(*, campaigns(title), brands(company_name), creators(display_name))") \
            .eq("id", contract_id) \
            .single() \
            .execute()
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch contract: {str(e)}"
        ) from e

    record = record_resp.data if record_resp and record_resp.data else None
    if not record:
        raise HTTPException(status_code=404, detail="Contract not found")

    brand_id = record.get("brand_id")
    creator_id = record.get("creator_id")

    if role == "Brand":
        brand_profile = fetch_brand_profile_by_user_id(user["id"])
        if not brand_profile or brand_profile.get("id") != brand_id:
            raise HTTPException(status_code=403, detail="Access denied for this contract")
    else:
        creator_profile = fetch_creator_profile_by_user_id(user["id"])
        if not creator_profile or creator_profile.get("id") != creator_id:
            raise HTTPException(status_code=403, detail="Access denied for this contract")

    return _normalize_contract_response(record)


class ContractLinkUpdate(BaseModel):
    """Schema for updating contract link."""
    link: str = Field(..., min_length=1, description="Cloud storage link (Google Drive, Dropbox, etc.)")


@router.put(
    "/contracts/{contract_id}/unsigned-link",
    response_model=ContractResponse
)
async def update_unsigned_contract_link(
    contract_id: str,
    payload: ContractLinkUpdate,
    brand: dict = Depends(get_current_brand)
):
    """Brand uploads a link to the unsigned contract."""
    supabase = supabase_anon

    try:
        # Verify contract exists and belongs to this brand
        contract_resp = supabase.table("contracts") \
            .select("id, brand_id") \
            .eq("id", contract_id) \
            .single() \
            .execute()

        if not contract_resp.data:
            raise HTTPException(status_code=404, detail="Contract not found")

        if contract_resp.data["brand_id"] != brand["id"]:
            raise HTTPException(
                status_code=403,
                detail="You do not have permission to update this contract"
            )

        # Update the unsigned contract link
        update_resp = supabase.table("contracts") \
            .update({"unsigned_contract_link": payload.link}) \
            .eq("id", contract_id) \
            .execute()

        if not update_resp.data:
            raise HTTPException(
                status_code=500,
                detail="Failed to update contract link"
            )

        # Fetch updated contract
        updated_contract_resp = supabase.table("contracts") \
            .select("*, proposals(*, campaigns(title), brands(company_name), creators(display_name))") \
            .eq("id", contract_id) \
            .single() \
            .execute()

        if not updated_contract_resp.data:
            raise HTTPException(
                status_code=500,
                detail="Failed to fetch updated contract"
            )

        return _normalize_contract_response(updated_contract_resp.data)

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error updating contract link: {str(e)}"
        ) from e


@router.put(
    "/contracts/{contract_id}/signed-link",
    response_model=ContractResponse
)
async def update_signed_contract_link(
    contract_id: str,
    payload: ContractLinkUpdate,
    creator: dict = Depends(get_current_creator)
):
    """Creator uploads a link to the signed contract."""
    supabase = supabase_anon

    try:
        # Verify contract exists and belongs to this creator
        contract_resp = supabase.table("contracts") \
            .select("id, creator_id") \
            .eq("id", contract_id) \
            .single() \
            .execute()

        if not contract_resp.data:
            raise HTTPException(status_code=404, detail="Contract not found")

        if contract_resp.data["creator_id"] != creator["id"]:
            raise HTTPException(
                status_code=403,
                detail="You do not have permission to update this contract"
            )

        contract = contract_resp.data
        creator_profile = fetch_creator_profile_by_user_id(creator["id"])

        # Update the signed contract link
        update_resp = supabase.table("contracts") \
            .update({"signed_contract_link": payload.link}) \
            .eq("id", contract_id) \
            .execute()

        if not update_resp.data:
            raise HTTPException(
                status_code=500,
                detail="Failed to update contract link"
            )

        # Check if this is the initial contract finalization (both parties have signed)
        # Brand uploaded unsigned (signed it), Creator now uploads signed (signed it)
        # Create initial version if no versions exist
        versions_check = supabase.table("contract_versions") \
            .select("id") \
            .eq("contract_id", contract_id) \
            .limit(1) \
            .execute()

        if not versions_check.data:
            # Create initial version - both parties have signed
            version_data = {
                "contract_id": contract_id,
                "version_number": 1,
                "file_url": payload.link,
                "uploaded_by": creator_profile["id"] if creator_profile else None,
                "status": "final",
                "brand_approval": True,  # Brand already signed (uploaded unsigned)
                "creator_approval": True,  # Creator just signed (uploaded signed)
                "change_reason": "Initial signed contract",
                "is_current": True,
            }

            version_insert = supabase.table("contract_versions") \
                .insert(version_data) \
                .execute()

            if version_insert.data:
                # Update contract's current_version_id
                supabase.table("contracts") \
                    .update({"current_version_id": version_insert.data[0]["id"]}) \
                    .eq("id", contract_id) \
                    .execute()

        # Fetch updated contract
        updated_contract_resp = supabase.table("contracts") \
            .select("*, proposals(*, campaigns(title), brands(company_name), creators(display_name))") \
            .eq("id", contract_id) \
            .single() \
            .execute()

        if not updated_contract_resp.data:
            raise HTTPException(
                status_code=500,
                detail="Failed to fetch updated contract"
            )

        return _normalize_contract_response(updated_contract_resp.data)

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error updating contract link: {str(e)}"
        ) from e


class ContractChatMessage(BaseModel):
    """Schema for contract chat message."""
    id: str
    contract_id: str
    sender_id: str
    sender_role: str
    message: str
    created_at: datetime


class ContractChatMessageCreate(BaseModel):
    """Schema for creating a new contract chat message."""
    message: str = Field(..., min_length=1, max_length=5000)


class ContractStatusChangeRequest(BaseModel):
    """Schema for requesting a contract status change."""
    new_status: str = Field(
        ...,
        pattern="^(signed_and_active|paused|completed_successfully|terminated)$",
        description="New contract status"
    )


@router.post(
    "/contracts/{contract_id}/track-unsigned-download",
    response_model=ContractResponse
)
async def track_unsigned_contract_download(
    contract_id: str,
    creator: dict = Depends(get_current_creator)
):
    """Track when Creator downloads the unsigned contract."""
    supabase = supabase_anon

    try:
        # Verify contract exists and belongs to this creator
        contract_resp = supabase.table("contracts") \
            .select("id, creator_id") \
            .eq("id", contract_id) \
            .single() \
            .execute()

        if not contract_resp.data:
            raise HTTPException(status_code=404, detail="Contract not found")

        if contract_resp.data["creator_id"] != creator["id"]:
            raise HTTPException(
                status_code=403,
                detail="You do not have permission to track this download"
            )

        # Update the download tracking
        update_resp = supabase.table("contracts") \
            .update({"unsigned_contract_downloaded_by_creator": True}) \
            .eq("id", contract_id) \
            .execute()

        if not update_resp.data:
            raise HTTPException(
                status_code=500,
                detail="Failed to track download"
            )

        # Fetch updated contract
        updated_contract_resp = supabase.table("contracts") \
            .select("*, proposals(*, campaigns(title), brands(company_name), creators(display_name))") \
            .eq("id", contract_id) \
            .single() \
            .execute()

        if not updated_contract_resp.data:
            raise HTTPException(
                status_code=500,
                detail="Failed to fetch updated contract"
            )

        return _normalize_contract_response(updated_contract_resp.data)

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error tracking download: {str(e)}"
        ) from e


@router.post(
    "/contracts/{contract_id}/track-signed-download",
    response_model=ContractResponse
)
async def track_signed_contract_download(
    contract_id: str,
    brand: dict = Depends(get_current_brand)
):
    """Track when Brand downloads the signed contract."""
    supabase = supabase_anon

    try:
        # Verify contract exists and belongs to this brand
        contract_resp = supabase.table("contracts") \
            .select("id, brand_id, creator_id, signed_contract_link, signed_contract_downloaded_by_brand") \
            .eq("id", contract_id) \
            .single() \
            .execute()

        if not contract_resp.data:
            raise HTTPException(status_code=404, detail="Contract not found")

        if contract_resp.data["brand_id"] != brand["id"]:
            raise HTTPException(
                status_code=403,
                detail="You do not have permission to track this download"
            )

        contract = contract_resp.data
        brand_profile = fetch_brand_profile_by_user_id(brand["id"])

        # Update the download tracking
        update_resp = supabase.table("contracts") \
            .update({"signed_contract_downloaded_by_brand": True}) \
            .eq("id", contract_id) \
            .execute()

        if not update_resp.data:
            raise HTTPException(
                status_code=500,
                detail="Failed to track download"
            )


        # Fetch updated contract
        updated_contract_resp = supabase.table("contracts") \
            .select("*, proposals(*, campaigns(title), brands(company_name), creators(display_name))") \
            .eq("id", contract_id) \
            .single() \
            .execute()

        if not updated_contract_resp.data:
            raise HTTPException(
                status_code=500,
                detail="Failed to fetch updated contract"
            )

        return _normalize_contract_response(updated_contract_resp.data)

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error tracking download: {str(e)}"
        ) from e


@router.post(
    "/contracts/{contract_id}/request-status-change",
    response_model=ContractResponse
)
async def request_contract_status_change(
    contract_id: str,
    payload: ContractStatusChangeRequest,
    user: dict = Depends(get_current_user)
):
    """Request a contract status change. Requires approval from the other party."""
    supabase = supabase_anon
    role = user.get("role")

    if role not in ("Brand", "Creator"):
        raise HTTPException(
            status_code=403,
            detail="Only brands and creators can request status changes"
        )

    try:
        # Verify contract exists and user has access
        contract_resp = supabase.table("contracts") \
            .select("id, brand_id, creator_id, unsigned_contract_link, signed_contract_link, unsigned_contract_downloaded_by_creator, signed_contract_downloaded_by_brand") \
            .eq("id", contract_id) \
            .single() \
            .execute()

        if not contract_resp.data:
            raise HTTPException(status_code=404, detail="Contract not found")

        contract = contract_resp.data

        # Verify user has access to this contract
        if role == "Brand":
            brand_profile = fetch_brand_profile_by_user_id(user["id"])
            if not brand_profile or brand_profile.get("id") != contract["brand_id"]:
                raise HTTPException(status_code=403, detail="Access denied")
        else:
            creator_profile = fetch_creator_profile_by_user_id(user["id"])
            if not creator_profile or creator_profile.get("id") != contract["creator_id"]:
                raise HTTPException(status_code=403, detail="Access denied")

        # Check if all workflow steps are completed
        workflow_complete = (
            contract.get("unsigned_contract_link") and
            contract.get("unsigned_contract_downloaded_by_creator") and
            contract.get("signed_contract_link") and
            contract.get("signed_contract_downloaded_by_brand")
        )

        if not workflow_complete:
            raise HTTPException(
                status_code=400,
                detail="All contract file exchange steps must be completed before requesting status changes"
            )

        # Check if there's already a pending request
        pending = contract.get("pending_status_change")
        if pending:
            raise HTTPException(
                status_code=400,
                detail="There is already a pending status change request"
            )

        # Create pending status change request
        pending_request = {
            "requested_status": payload.new_status,
            "requesting_party": role,
            "requested_at": datetime.now(timezone.utc).isoformat()
        }

        update_resp = supabase.table("contracts") \
            .update({"pending_status_change": pending_request}) \
            .eq("id", contract_id) \
            .execute()

        if not update_resp.data:
            raise HTTPException(
                status_code=500,
                detail="Failed to create status change request"
            )

        # Fetch updated contract
        updated_contract_resp = supabase.table("contracts") \
            .select("*, proposals(*, campaigns(title), brands(company_name), creators(display_name))") \
            .eq("id", contract_id) \
            .single() \
            .execute()

        if not updated_contract_resp.data:
            raise HTTPException(
                status_code=500,
                detail="Failed to fetch updated contract"
            )

        return _normalize_contract_response(updated_contract_resp.data)

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error requesting status change: {str(e)}"
        ) from e


@router.post(
    "/contracts/{contract_id}/respond-status-change",
    response_model=ContractResponse
)
async def respond_to_status_change_request(
    contract_id: str,
    approved: bool = Query(..., description="Whether to approve the status change"),
    user: dict = Depends(get_current_user)
):
    """Approve or deny a pending status change request."""
    supabase = supabase_anon
    role = user.get("role")

    if role not in ("Brand", "Creator"):
        raise HTTPException(
            status_code=403,
            detail="Only brands and creators can respond to status change requests"
        )

    try:
        # Verify contract exists and user has access
        contract_resp = supabase.table("contracts") \
            .select("id, brand_id, creator_id, pending_status_change") \
            .eq("id", contract_id) \
            .single() \
            .execute()

        if not contract_resp.data:
            raise HTTPException(status_code=404, detail="Contract not found")

        contract = contract_resp.data

        # Verify user has access to this contract
        if role == "Brand":
            brand_profile = fetch_brand_profile_by_user_id(user["id"])
            if not brand_profile or brand_profile.get("id") != contract["brand_id"]:
                raise HTTPException(status_code=403, detail="Access denied")
        else:
            creator_profile = fetch_creator_profile_by_user_id(user["id"])
            if not creator_profile or creator_profile.get("id") != contract["creator_id"]:
                raise HTTPException(status_code=403, detail="Access denied")

        pending = contract.get("pending_status_change")
        if not pending or not isinstance(pending, dict):
            raise HTTPException(
                status_code=400,
                detail="No pending status change request found"
            )

        requesting_party = pending.get("requesting_party")
        if requesting_party == role:
            raise HTTPException(
                status_code=400,
                detail="You cannot respond to your own status change request"
            )

        if approved:
            # Update contract status and clear pending request
            new_status = pending.get("requested_status")
            update_resp = supabase.table("contracts") \
                .update({
                    "status": new_status,
                    "pending_status_change": None
                }) \
                .eq("id", contract_id) \
                .execute()
        else:
            # Just clear the pending request
            update_resp = supabase.table("contracts") \
                .update({"pending_status_change": None}) \
                .eq("id", contract_id) \
                .execute()

        if not update_resp.data:
            raise HTTPException(
                status_code=500,
                detail="Failed to update contract"
            )

        # Fetch updated contract
        updated_contract_resp = supabase.table("contracts") \
            .select("*, proposals(*, campaigns(title), brands(company_name), creators(display_name))") \
            .eq("id", contract_id) \
            .single() \
            .execute()

        if not updated_contract_resp.data:
            raise HTTPException(
                status_code=500,
                detail="Failed to fetch updated contract"
            )

        return _normalize_contract_response(updated_contract_resp.data)

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error responding to status change: {str(e)}"
        ) from e


@router.get(
    "/contracts/{contract_id}/chat",
    response_model=List[ContractChatMessage]
)
async def get_contract_chat_messages(
    contract_id: str,
    user: dict = Depends(get_current_user)
):
    """Fetch all chat messages for a contract."""
    supabase = supabase_anon
    role = user.get("role")

    if role not in ("Brand", "Creator"):
        raise HTTPException(
            status_code=403,
            detail="Only brands and creators can view contract chats"
        )

    try:
        # Verify contract exists and user has access
        contract_resp = supabase.table("contracts") \
            .select("id, brand_id, creator_id") \
            .eq("id", contract_id) \
            .single() \
            .execute()

        if not contract_resp.data:
            raise HTTPException(status_code=404, detail="Contract not found")

        contract = contract_resp.data

        # Verify user has access to this contract
        if role == "Brand":
            brand_profile = fetch_brand_profile_by_user_id(user["id"])
            if not brand_profile or brand_profile.get("id") != contract["brand_id"]:
                raise HTTPException(status_code=403, detail="Access denied")
        else:
            creator_profile = fetch_creator_profile_by_user_id(user["id"])
            if not creator_profile or creator_profile.get("id") != contract["creator_id"]:
                raise HTTPException(status_code=403, detail="Access denied")

        # Fetch chat messages
        messages_resp = supabase.table("contract_chats") \
            .select("*") \
            .eq("contract_id", contract_id) \
            .order("created_at", desc=False) \
            .execute()

        messages = []
        for msg in (messages_resp.data or []):
            # Parse datetime
            created_at = parse_datetime(msg.get("created_at"))
            messages.append({
                "id": msg.get("id"),
                "contract_id": msg.get("contract_id"),
                "sender_id": msg.get("sender_id"),
                "sender_role": msg.get("sender_role", "").capitalize(),  # Capitalize for display
                "message": msg.get("message"),
                "created_at": created_at
            })

        return [ContractChatMessage.model_validate(msg) for msg in messages]

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error fetching chat messages: {str(e)}"
        ) from e


@router.post(
    "/contracts/{contract_id}/chat",
    response_model=ContractChatMessage,
    status_code=201
)
async def post_contract_chat_message(
    contract_id: str,
    payload: ContractChatMessageCreate,
    user: dict = Depends(get_current_user)
):
    """Post a new message to the contract chat."""
    supabase = supabase_anon
    role = user.get("role")

    if role not in ("Brand", "Creator"):
        raise HTTPException(
            status_code=403,
            detail="Only brands and creators can send messages"
        )

    try:
        # Verify contract exists and user has access
        contract_resp = supabase.table("contracts") \
            .select("id, brand_id, creator_id") \
            .eq("id", contract_id) \
            .single() \
            .execute()

        if not contract_resp.data:
            raise HTTPException(status_code=404, detail="Contract not found")

        contract = contract_resp.data
        sender_id = None
        sender_role_db = None

        # Verify user has access and get sender ID
        if role == "Brand":
            brand_profile = fetch_brand_profile_by_user_id(user["id"])
            if not brand_profile or brand_profile.get("id") != contract["brand_id"]:
                raise HTTPException(status_code=403, detail="Access denied")
            sender_id = brand_profile["id"]
            sender_role_db = "brand"
        else:
            creator_profile = fetch_creator_profile_by_user_id(user["id"])
            if not creator_profile or creator_profile.get("id") != contract["creator_id"]:
                raise HTTPException(status_code=403, detail="Access denied")
            sender_id = creator_profile["id"]
            sender_role_db = "creator"

        # Insert chat message
        message_data = {
            "contract_id": contract_id,
            "sender_id": sender_id,
            "sender_role": sender_role_db,
            "message": payload.message
        }

        insert_resp = supabase.table("contract_chats") \
            .insert(message_data) \
            .execute()

        if not insert_resp.data:
            raise HTTPException(
                status_code=500,
                detail="Failed to post message"
            )

        message_record = insert_resp.data[0]
        created_at = parse_datetime(message_record.get("created_at"))
        sender_role_db = message_record.get("sender_role", "")

        return ContractChatMessage(
            id=message_record.get("id"),
            contract_id=message_record.get("contract_id"),
            sender_id=message_record.get("sender_id"),
            sender_role=sender_role_db.capitalize() if sender_role_db else role,  # Capitalize for consistency with GET endpoint
            message=message_record.get("message"),
            created_at=created_at
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error posting message: {str(e)}"
        ) from e


# ============================================================================
# DELIVERABLES TRACKING ENDPOINTS
# ============================================================================

class DeliverableCreate(BaseModel):
    """Schema for creating a deliverable."""
    description: str = Field(..., min_length=1, max_length=2000)
    due_date: Optional[datetime] = None


class DeliverableUpdate(BaseModel):
    """Schema for updating a deliverable."""
    description: Optional[str] = Field(None, min_length=1, max_length=2000)
    due_date: Optional[datetime] = None


class DeliverableResponse(BaseModel):
    """Schema for deliverable response."""
    id: str
    contract_id: str
    description: str
    due_date: Optional[datetime]
    status: str
    submission_url: Optional[str]
    review_comment: Optional[str]
    rejection_reason: Optional[str]
    brand_approval: bool
    creator_approval: bool
    created_at: datetime
    updated_at: datetime


class DeliverableSubmission(BaseModel):
    """Schema for submitting a deliverable URL."""
    submission_url: str = Field(..., min_length=1, max_length=2000)


class DeliverableReview(BaseModel):
    """Schema for reviewing a deliverable."""
    approved: bool
    review_comment: Optional[str] = Field(None, max_length=2000)
    rejection_reason: Optional[str] = Field(None, max_length=2000)


class DeliverablesListUpdate(BaseModel):
    """Schema for updating the deliverables list (add/edit/remove)."""
    deliverables: List[DeliverableCreate] = Field(..., min_items=0)


class ApprovalRequest(BaseModel):
    """Schema for approving deliverables list."""
    approved: bool




@router.get(
    "/contracts/{contract_id}/deliverables",
    response_model=List[DeliverableResponse]
)
async def get_contract_deliverables(
    contract_id: str,
    user: dict = Depends(get_current_user)
):
    """Fetch all deliverables for a contract."""
    supabase = supabase_anon
    role = user.get("role")

    if role not in ("Brand", "Creator"):
        raise HTTPException(
            status_code=403,
            detail="Only brands and creators can view deliverables"
        )

    try:
        # Verify contract exists and user has access
        contract_resp = supabase.table("contracts") \
            .select("id, brand_id, creator_id") \
            .eq("id", contract_id) \
            .single() \
            .execute()

        if not contract_resp.data:
            raise HTTPException(status_code=404, detail="Contract not found")

        contract = contract_resp.data

        # Verify user has access to this contract
        if role == "Brand":
            brand_profile = fetch_brand_profile_by_user_id(user["id"])
            if not brand_profile or brand_profile.get("id") != contract["brand_id"]:
                raise HTTPException(status_code=403, detail="Access denied")
        else:
            creator_profile = fetch_creator_profile_by_user_id(user["id"])
            if not creator_profile or creator_profile.get("id") != contract["creator_id"]:
                raise HTTPException(status_code=403, detail="Access denied")

        # Fetch deliverables
        deliverables_resp = supabase.table("contract_deliverables") \
            .select("*") \
            .eq("contract_id", contract_id) \
            .order("created_at", desc=False) \
            .execute()

        deliverables = []
        for deliv in (deliverables_resp.data or []):
            due_date = deliv.get("due_date")
            deliverables.append({
                "id": deliv.get("id"),
                "contract_id": deliv.get("contract_id"),
                "description": deliv.get("description"),
                "due_date": parse_datetime(due_date) if due_date else None,
                "status": deliv.get("status", "pending"),
                "submission_url": deliv.get("submission_url"),
                "review_comment": deliv.get("review_comment"),
                "rejection_reason": deliv.get("rejection_reason"),
                "brand_approval": deliv.get("brand_approval", False),
                "creator_approval": deliv.get("creator_approval", False),
                "created_at": parse_datetime(deliv.get("created_at")),
                "updated_at": parse_datetime(deliv.get("updated_at")),
            })

        return [DeliverableResponse.model_validate(d) for d in deliverables]

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error fetching deliverables: {str(e)}"
        ) from e


@router.post(
    "/contracts/{contract_id}/deliverables",
    response_model=List[DeliverableResponse],
    status_code=201
)
async def create_or_update_deliverables_list(
    contract_id: str,
    payload: DeliverablesListUpdate,
    brand: dict = Depends(get_current_brand)
):
    """
    Brand creates or updates the deliverables list.
    This resets approvals - both parties must re-approve after changes.
    """
    supabase = supabase_anon

    try:
        # Verify contract exists and belongs to this brand
        contract_resp = supabase.table("contracts") \
            .select("id, brand_id") \
            .eq("id", contract_id) \
            .single() \
            .execute()

        if not contract_resp.data:
            raise HTTPException(status_code=404, detail="Contract not found")

        if contract_resp.data["brand_id"] != brand["id"]:
            raise HTTPException(
                status_code=403,
                detail="Only the brand can create/update deliverables"
            )

        # Delete existing deliverables
        supabase.table("contract_deliverables") \
            .delete() \
            .eq("contract_id", contract_id) \
            .execute()

        # Create new deliverables
        new_deliverables = []
        for deliv in payload.deliverables:
            deliverable_data = {
                "contract_id": contract_id,
                "description": deliv.description,
                "due_date": deliv.due_date.isoformat() if deliv.due_date else None,
                "status": "pending",
                "brand_approval": False,
                "creator_approval": False,
            }

            insert_resp = supabase.table("contract_deliverables") \
                .insert(deliverable_data) \
                .execute()

            if insert_resp.data:
                new_deliverables.append(insert_resp.data[0])

        # Format response
        formatted = []
        for deliv in new_deliverables:
            due_date = deliv.get("due_date")
            formatted.append({
                "id": deliv.get("id"),
                "contract_id": deliv.get("contract_id"),
                "description": deliv.get("description"),
                "due_date": parse_datetime(due_date) if due_date else None,
                "status": deliv.get("status", "pending"),
                "submission_url": deliv.get("submission_url"),
                "review_comment": deliv.get("review_comment"),
                "rejection_reason": deliv.get("rejection_reason"),
                "brand_approval": deliv.get("brand_approval", False),
                "creator_approval": deliv.get("creator_approval", False),
                "created_at": parse_datetime(deliv.get("created_at")),
                "updated_at": parse_datetime(deliv.get("updated_at")),
            })

        return [DeliverableResponse.model_validate(d) for d in formatted]

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error creating/updating deliverables: {str(e)}"
        ) from e


@router.post(
    "/contracts/{contract_id}/deliverables/approve",
    response_model=List[DeliverableResponse]
)
async def approve_deliverables_list(
    contract_id: str,
    payload: ApprovalRequest,
    user: dict = Depends(get_current_user)
):
    """
    Brand or Creator approves the deliverables list.
    Once both parties approve, the list is finalized and locked.
    """
    supabase = supabase_anon
    role = user.get("role")

    if role not in ("Brand", "Creator"):
        raise HTTPException(
            status_code=403,
            detail="Only brands and creators can approve deliverables"
        )

    try:
        # Verify contract exists and user has access
        contract_resp = supabase.table("contracts") \
            .select("id, brand_id, creator_id") \
            .eq("id", contract_id) \
            .single() \
            .execute()

        if not contract_resp.data:
            raise HTTPException(status_code=404, detail="Contract not found")

        contract = contract_resp.data

        # Verify user has access
        if role == "Brand":
            brand_profile = fetch_brand_profile_by_user_id(user["id"])
            if not brand_profile or brand_profile.get("id") != contract["brand_id"]:
                raise HTTPException(status_code=403, detail="Access denied")
            approval_field = "brand_approval"
        else:
            creator_profile = fetch_creator_profile_by_user_id(user["id"])
            if not creator_profile or creator_profile.get("id") != contract["creator_id"]:
                raise HTTPException(status_code=403, detail="Access denied")
            approval_field = "creator_approval"

        # Update all deliverables for this contract
        update_data = {approval_field: payload.approved}
        supabase.table("contract_deliverables") \
            .update(update_data) \
            .eq("contract_id", contract_id) \
            .execute()

        # Fetch updated deliverables
        deliverables_resp = supabase.table("contract_deliverables") \
            .select("*") \
            .eq("contract_id", contract_id) \
            .order("created_at", desc=False) \
            .execute()

        deliverables = []
        for deliv in (deliverables_resp.data or []):
            due_date = deliv.get("due_date")
            deliverables.append({
                "id": deliv.get("id"),
                "contract_id": deliv.get("contract_id"),
                "description": deliv.get("description"),
                "due_date": parse_datetime(due_date) if due_date else None,
                "status": deliv.get("status", "pending"),
                "submission_url": deliv.get("submission_url"),
                "review_comment": deliv.get("review_comment"),
                "rejection_reason": deliv.get("rejection_reason"),
                "brand_approval": deliv.get("brand_approval", False),
                "creator_approval": deliv.get("creator_approval", False),
                "created_at": parse_datetime(deliv.get("created_at")),
                "updated_at": parse_datetime(deliv.get("updated_at")),
            })

        return [DeliverableResponse.model_validate(d) for d in deliverables]

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error approving deliverables: {str(e)}"
        ) from e


@router.post(
    "/contracts/{contract_id}/deliverables/{deliverable_id}/submit",
    response_model=DeliverableResponse
)
async def submit_deliverable(
    contract_id: str,
    deliverable_id: str,
    payload: DeliverableSubmission,
    creator: dict = Depends(get_current_creator)
):
    """
    Creator submits a URL for a deliverable.
    Only allowed if the deliverables list is approved by both parties.
    """
    supabase = supabase_anon

    try:
        # Verify contract exists and belongs to this creator
        contract_resp = supabase.table("contracts") \
            .select("id, creator_id") \
            .eq("id", contract_id) \
            .single() \
            .execute()

        if not contract_resp.data:
            raise HTTPException(status_code=404, detail="Contract not found")

        if contract_resp.data["creator_id"] != creator["id"]:
            raise HTTPException(
                status_code=403,
                detail="Only the creator can submit deliverables"
            )

        # Verify deliverable exists and belongs to this contract
        deliv_resp = supabase.table("contract_deliverables") \
            .select("*") \
            .eq("id", deliverable_id) \
            .eq("contract_id", contract_id) \
            .single() \
            .execute()

        if not deliv_resp.data:
            raise HTTPException(status_code=404, detail="Deliverable not found")

        deliverable = deliv_resp.data

        # Check if deliverables list is approved by both parties
        if not deliverable.get("brand_approval") or not deliverable.get("creator_approval"):
            raise HTTPException(
                status_code=400,
                detail="Deliverables list must be approved by both parties before submission"
            )

        # Check if deliverable is already completed
        if deliverable.get("status") == "completed":
            raise HTTPException(
                status_code=400,
                detail="This deliverable is already completed and cannot be modified"
            )

        # Update deliverable with submission
        update_data = {
            "submission_url": payload.submission_url,
            "status": "under_review",
            "rejection_reason": None,  # Clear previous rejection
        }

        update_resp = supabase.table("contract_deliverables") \
            .update(update_data) \
            .eq("id", deliverable_id) \
            .execute()

        if not update_resp.data:
            raise HTTPException(
                status_code=500,
                detail="Failed to submit deliverable"
            )

        updated = update_resp.data[0]

        due_date = updated.get("due_date")
        return DeliverableResponse(
            id=updated.get("id"),
            contract_id=updated.get("contract_id"),
            description=updated.get("description"),
            due_date=parse_datetime(due_date) if due_date else None,
            status=updated.get("status", "under_review"),
            submission_url=updated.get("submission_url"),
            review_comment=updated.get("review_comment"),
            rejection_reason=updated.get("rejection_reason"),
            brand_approval=updated.get("brand_approval", False),
            creator_approval=updated.get("creator_approval", False),
            created_at=parse_datetime(updated.get("created_at")),
            updated_at=parse_datetime(updated.get("updated_at")),
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error submitting deliverable: {str(e)}"
        ) from e


@router.post(
    "/contracts/{contract_id}/deliverables/{deliverable_id}/review",
    response_model=DeliverableResponse
)
async def review_deliverable(
    contract_id: str,
    deliverable_id: str,
    payload: DeliverableReview,
    brand: dict = Depends(get_current_brand)
):
    """
    Brand reviews a submitted deliverable: approve or reject.
    If rejected, must provide a reason.
    """
    supabase = supabase_anon

    try:
        # Verify contract exists and belongs to this brand
        contract_resp = supabase.table("contracts") \
            .select("id, brand_id") \
            .eq("id", contract_id) \
            .single() \
            .execute()

        if not contract_resp.data:
            raise HTTPException(status_code=404, detail="Contract not found")

        if contract_resp.data["brand_id"] != brand["id"]:
            raise HTTPException(
                status_code=403,
                detail="Only the brand can review deliverables"
            )

        # Verify deliverable exists and belongs to this contract
        deliv_resp = supabase.table("contract_deliverables") \
            .select("*") \
            .eq("id", deliverable_id) \
            .eq("contract_id", contract_id) \
            .single() \
            .execute()

        if not deliv_resp.data:
            raise HTTPException(status_code=404, detail="Deliverable not found")

        deliverable = deliv_resp.data

        # Check if deliverable is under review
        if deliverable.get("status") != "under_review":
            raise HTTPException(
                status_code=400,
                detail="Deliverable must be under review to be reviewed"
            )

        # Validate rejection reason if rejecting
        if not payload.approved:
            if not payload.rejection_reason or not payload.rejection_reason.strip():
                raise HTTPException(
                    status_code=400,
                    detail="Rejection reason is required when rejecting a deliverable"
                )

        # Update deliverable
        update_data = {
            "status": "completed" if payload.approved else "rejected",
            "review_comment": payload.review_comment,
            "rejection_reason": payload.rejection_reason if not payload.approved else None,
        }

        update_resp = supabase.table("contract_deliverables") \
            .update(update_data) \
            .eq("id", deliverable_id) \
            .execute()

        if not update_resp.data:
            raise HTTPException(
                status_code=500,
                detail="Failed to review deliverable"
            )

        updated = update_resp.data[0]

        return DeliverableResponse(
            id=updated.get("id"),
            contract_id=updated.get("contract_id"),
            description=updated.get("description"),
            due_date=parse_datetime(updated.get("due_date")),
            status=updated.get("status"),
            submission_url=updated.get("submission_url"),
            review_comment=updated.get("review_comment"),
            rejection_reason=updated.get("rejection_reason"),
            brand_approval=updated.get("brand_approval", False),
            creator_approval=updated.get("creator_approval", False),
            created_at=parse_datetime(updated.get("created_at")),
            updated_at=parse_datetime(updated.get("updated_at")),
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error reviewing deliverable: {str(e)}"
        ) from e


# ============================================================================
# CONTRACT VERSIONING ENDPOINTS
# ============================================================================

class ContractVersionCreate(BaseModel):
    """Schema for creating a contract version."""
    file_url: str = Field(..., min_length=1, max_length=2000)
    change_reason: Optional[str] = Field(None, max_length=2000)


class ContractVersionResponse(BaseModel):
    """Schema for contract version response."""
    id: str
    contract_id: str
    version_number: int
    file_url: str
    uploaded_by: Optional[str]
    uploaded_at: datetime
    status: str
    brand_approval: bool
    creator_approval: bool
    change_reason: Optional[str]
    is_current: bool


class VersionApprovalRequest(BaseModel):
    """Schema for approving/rejecting a version."""
    approved: bool


@router.get(
    "/contracts/{contract_id}/versions",
    response_model=List[ContractVersionResponse]
)
async def get_contract_versions(
    contract_id: str,
    user: dict = Depends(get_current_user)
):
    """Fetch all versions for a contract."""
    supabase = supabase_anon
    role = user.get("role")

    if role not in ("Brand", "Creator"):
        raise HTTPException(
            status_code=403,
            detail="Only brands and creators can view contract versions"
        )

    try:
        # Verify contract exists and user has access
        contract_resp = supabase.table("contracts") \
            .select("id, brand_id, creator_id") \
            .eq("id", contract_id) \
            .single() \
            .execute()

        if not contract_resp.data:
            raise HTTPException(status_code=404, detail="Contract not found")

        contract = contract_resp.data

        # Verify user has access to this contract
        if role == "Brand":
            brand_profile = fetch_brand_profile_by_user_id(user["id"])
            if not brand_profile or brand_profile.get("id") != contract["brand_id"]:
                raise HTTPException(status_code=403, detail="Access denied")
        else:
            creator_profile = fetch_creator_profile_by_user_id(user["id"])
            if not creator_profile or creator_profile.get("id") != contract["creator_id"]:
                raise HTTPException(status_code=403, detail="Access denied")

        # Fetch versions
        versions_resp = supabase.table("contract_versions") \
            .select("*") \
            .eq("contract_id", contract_id) \
            .order("version_number", desc=False) \
            .execute()

        versions = []
        for version in (versions_resp.data or []):
            versions.append({
                "id": version.get("id"),
                "contract_id": version.get("contract_id"),
                "version_number": version.get("version_number", 0),
                "file_url": version.get("file_url"),
                "uploaded_by": version.get("uploaded_by"),
                "uploaded_at": parse_datetime(version.get("uploaded_at")),
                "status": version.get("status", "pending"),
                "brand_approval": version.get("brand_approval", False),
                "creator_approval": version.get("creator_approval", False),
                "change_reason": version.get("change_reason"),
                "is_current": version.get("is_current", False),
            })

        return [ContractVersionResponse.model_validate(v) for v in versions]

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error fetching contract versions: {str(e)}"
        ) from e


@router.get(
    "/contracts/{contract_id}/versions/current",
    response_model=ContractVersionResponse
)
async def get_current_contract_version(
    contract_id: str,
    user: dict = Depends(get_current_user)
):
    """Fetch the current (finalized) contract version."""
    supabase = supabase_anon
    role = user.get("role")

    if role not in ("Brand", "Creator"):
        raise HTTPException(
            status_code=403,
            detail="Only brands and creators can view contract versions"
        )

    try:
        # Verify contract exists and user has access
        contract_resp = supabase.table("contracts") \
            .select("id, brand_id, creator_id, current_version_id") \
            .eq("id", contract_id) \
            .single() \
            .execute()

        if not contract_resp.data:
            raise HTTPException(status_code=404, detail="Contract not found")

        contract = contract_resp.data

        # Verify user has access
        if role == "Brand":
            brand_profile = fetch_brand_profile_by_user_id(user["id"])
            if not brand_profile or brand_profile.get("id") != contract["brand_id"]:
                raise HTTPException(status_code=403, detail="Access denied")
        else:
            creator_profile = fetch_creator_profile_by_user_id(user["id"])
            if not creator_profile or creator_profile.get("id") != contract["creator_id"]:
                raise HTTPException(status_code=403, detail="Access denied")

        # Get current version
        if contract.get("current_version_id"):
            version_resp = supabase.table("contract_versions") \
                .select("*") \
                .eq("id", contract["current_version_id"]) \
                .single() \
                .execute()

            if version_resp.data:
                version = version_resp.data
                return ContractVersionResponse(
                    id=version.get("id"),
                    contract_id=version.get("contract_id"),
                    version_number=version.get("version_number", 0),
                    file_url=version.get("file_url"),
                    uploaded_by=version.get("uploaded_by"),
                    uploaded_at=parse_datetime(version.get("uploaded_at")),
                    status=version.get("status", "final"),
                    brand_approval=version.get("brand_approval", False),
                    creator_approval=version.get("creator_approval", False),
                    change_reason=version.get("change_reason"),
                    is_current=version.get("is_current", False),
                )

        raise HTTPException(
            status_code=404,
            detail="No current contract version found. Contract may not be finalized yet."
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error fetching current contract version: {str(e)}"
        ) from e


@router.post(
    "/contracts/{contract_id}/versions",
    response_model=ContractVersionResponse,
    status_code=201
)
async def create_contract_version(
    contract_id: str,
    payload: ContractVersionCreate,
    user: dict = Depends(get_current_user)
):
    """
    Create a new contract version (amendment).
    Either brand or creator can initiate an amendment.
    """
    supabase = supabase_anon
    role = user.get("role")

    if role not in ("Brand", "Creator"):
        raise HTTPException(
            status_code=403,
            detail="Only brands and creators can create contract versions"
        )

    try:
        # Verify contract exists and user has access
        contract_resp = supabase.table("contracts") \
            .select("id, brand_id, creator_id, current_version_id") \
            .eq("id", contract_id) \
            .single() \
            .execute()

        if not contract_resp.data:
            raise HTTPException(status_code=404, detail="Contract not found")

        contract = contract_resp.data

        # Verify user has access
        profile_id = None
        if role == "Brand":
            brand_profile = fetch_brand_profile_by_user_id(user["id"])
            if not brand_profile or brand_profile.get("id") != contract["brand_id"]:
                raise HTTPException(status_code=403, detail="Access denied")
            profile_id = brand_profile["id"]
        else:
            creator_profile = fetch_creator_profile_by_user_id(user["id"])
            if not creator_profile or creator_profile.get("id") != contract["creator_id"]:
                raise HTTPException(status_code=403, detail="Access denied")
            profile_id = creator_profile["id"]

        # Get the highest version number
        versions_resp = supabase.table("contract_versions") \
            .select("version_number") \
            .eq("contract_id", contract_id) \
            .order("version_number", desc=True) \
            .limit(1) \
            .execute()

        next_version = 1
        if versions_resp.data and len(versions_resp.data) > 0:
            next_version = versions_resp.data[0].get("version_number", 0) + 1

        # Create new version
        version_data = {
            "contract_id": contract_id,
            "version_number": next_version,
            "file_url": payload.file_url,
            "uploaded_by": profile_id,
            "status": "pending",
            "brand_approval": False,
            "creator_approval": False,
            "change_reason": payload.change_reason,
            "is_current": False,
        }

        insert_resp = supabase.table("contract_versions") \
            .insert(version_data) \
            .execute()

        if not insert_resp.data:
            raise HTTPException(
                status_code=500,
                detail="Failed to create contract version"
            )

        version_record = insert_resp.data[0]

        return ContractVersionResponse(
            id=version_record.get("id"),
            contract_id=version_record.get("contract_id"),
            version_number=version_record.get("version_number", next_version),
            file_url=version_record.get("file_url"),
            uploaded_by=version_record.get("uploaded_by"),
            uploaded_at=parse_datetime(version_record.get("uploaded_at")),
            status=version_record.get("status", "pending"),
            brand_approval=version_record.get("brand_approval", False),
            creator_approval=version_record.get("creator_approval", False),
            change_reason=version_record.get("change_reason"),
            is_current=version_record.get("is_current", False),
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error creating contract version: {str(e)}"
        ) from e


@router.post(
    "/contracts/{contract_id}/versions/{version_id}/approve",
    response_model=ContractVersionResponse
)
async def approve_contract_version(
    contract_id: str,
    version_id: str,
    payload: VersionApprovalRequest,
    user: dict = Depends(get_current_user)
):
    """
    Brand or Creator approves/rejects a contract version.
    When both parties approve, the version becomes final and current.
    """
    supabase = supabase_anon
    role = user.get("role")

    if role not in ("Brand", "Creator"):
        raise HTTPException(
            status_code=403,
            detail="Only brands and creators can approve contract versions"
        )

    try:
        # Verify contract exists and user has access
        contract_resp = supabase.table("contracts") \
            .select("id, brand_id, creator_id") \
            .eq("id", contract_id) \
            .single() \
            .execute()

        if not contract_resp.data:
            raise HTTPException(status_code=404, detail="Contract not found")

        contract = contract_resp.data

        # Verify user has access
        if role == "Brand":
            brand_profile = fetch_brand_profile_by_user_id(user["id"])
            if not brand_profile or brand_profile.get("id") != contract["brand_id"]:
                raise HTTPException(status_code=403, detail="Access denied")
            approval_field = "brand_approval"
        else:
            creator_profile = fetch_creator_profile_by_user_id(user["id"])
            if not creator_profile or creator_profile.get("id") != contract["creator_id"]:
                raise HTTPException(status_code=403, detail="Access denied")
            approval_field = "creator_approval"

        # Verify version exists
        version_resp = supabase.table("contract_versions") \
            .select("*") \
            .eq("id", version_id) \
            .eq("contract_id", contract_id) \
            .single() \
            .execute()

        if not version_resp.data:
            raise HTTPException(status_code=404, detail="Contract version not found")

        version = version_resp.data

        # Update approval
        update_data = {approval_field: payload.approved}
        if not payload.approved:
            # If rejecting, set status to rejected
            update_data["status"] = "rejected"
        else:
            # If approving, check if both parties have approved
            brand_approved = version.get("brand_approval", False) if role == "Creator" else payload.approved
            creator_approved = version.get("creator_approval", False) if role == "Brand" else payload.approved

            if brand_approved and creator_approved:
                # Both parties approved - finalize this version
                # First, set all other versions' is_current to false
                supabase.table("contract_versions") \
                    .update({"is_current": False}) \
                    .eq("contract_id", contract_id) \
                    .neq("id", version_id) \
                    .execute()

                # Mark this version as current and final
                update_data["status"] = "final"
                update_data["is_current"] = True

                # Update contract's current_version_id
                supabase.table("contracts") \
                    .update({"current_version_id": version_id}) \
                    .eq("id", contract_id) \
                    .execute()

        update_resp = supabase.table("contract_versions") \
            .update(update_data) \
            .eq("id", version_id) \
            .execute()

        if not update_resp.data:
            raise HTTPException(
                status_code=500,
                detail="Failed to update contract version"
            )

        updated = update_resp.data[0]

        return ContractVersionResponse(
            id=updated.get("id"),
            contract_id=updated.get("contract_id"),
            version_number=updated.get("version_number", 0),
            file_url=updated.get("file_url"),
            uploaded_by=updated.get("uploaded_by"),
            uploaded_at=parse_datetime(updated.get("uploaded_at")),
            status=updated.get("status", "pending"),
            brand_approval=updated.get("brand_approval", False),
            creator_approval=updated.get("creator_approval", False),
            change_reason=updated.get("change_reason"),
            is_current=updated.get("is_current", False),
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error approving contract version: {str(e)}"
        ) from e


@router.get("/proposals/draft", response_model=dict)
async def draft_proposal_content(
    campaign_id: str = Query(..., description="Campaign ID"),
    creator_id: str = Query(..., description="Creator ID"),
    content_idea: Optional[str] = Query(None, description="Content idea"),
    ideal_pricing: Optional[str] = Query(None, description="Ideal pricing"),
    brand: dict = Depends(get_current_brand)
):
    """Use AI to draft proposal content based on brand, campaign, and creator details."""
    supabase = supabase_anon
    brand_id = brand['id']

    try:
        # Fetch campaign
        campaign_resp = supabase.table("campaigns") \
            .select("*") \
            .eq("id", campaign_id) \
            .eq("brand_id", brand_id) \
            .single() \
            .execute()

        if not campaign_resp.data:
            raise HTTPException(status_code=404, detail="Campaign not found")

        campaign = campaign_resp.data

        # Fetch brand details
        brand_resp = supabase.table("brands") \
            .select("*") \
            .eq("id", brand_id) \
            .single() \
            .execute()

        brand_data = brand_resp.data if brand_resp.data else {}

        # Fetch creator details
        creator_resp = supabase.table("creators") \
            .select("*") \
            .eq("id", creator_id) \
            .eq("is_active", True) \
            .single() \
            .execute()

        if not creator_resp.data:
            raise HTTPException(status_code=404, detail="Creator not found")

        creator = creator_resp.data

        # Build prompt for AI
        prompt = f"""You are a professional brand partnership strategist. Draft a compelling collaboration proposal email.

BRAND INFORMATION:
- Company: {brand_data.get('company_name', 'Unknown')}
- Industry: {brand_data.get('industry', 'N/A')}
- Description: {brand_data.get('company_description', 'N/A')}
- Brand Values: {', '.join(brand_data.get('brand_values', []) or [])}
- Brand Voice: {brand_data.get('brand_voice', 'Professional')}

CAMPAIGN DETAILS:
- Title: {campaign.get('title', 'N/A')}
- Description: {campaign.get('description', campaign.get('short_description', 'N/A'))}
- Platforms: {', '.join(campaign.get('platforms', []) or [])}
- Budget Range: {campaign.get('budget_min', 0)} - {campaign.get('budget_max', 0)} INR
- Preferred Niches: {', '.join(campaign.get('preferred_creator_niches', []) or [])}

CREATOR PROFILE:
- Name: {creator.get('display_name', 'N/A')}
- Niche: {creator.get('primary_niche', 'N/A')}
- Followers: {creator.get('total_followers', 0)}
- Engagement Rate: {creator.get('engagement_rate', 0)}%
- Bio: {creator.get('bio', 'N/A')}

CONTENT IDEA: {content_idea or 'Not specified'}
IDEAL PRICING: {ideal_pricing or 'To be discussed'}

Create a professional, personalized proposal email with:
1. A compelling subject line
2. An engaging opening that shows you've researched the creator
3. Clear explanation of the campaign and collaboration opportunity
4. Specific content ideas or deliverables
5. Proposed compensation (if ideal pricing provided, use it as a guide)
6. Next steps and call to action

Return your response as JSON with this structure:
{{
  "subject": "Subject line here",
  "message": "Full proposal message here"
}}"""

        # Call Groq API
        if not settings.groq_api_key:
            raise HTTPException(status_code=500, detail="GROQ API key not configured")

        groq_client = Groq(api_key=settings.groq_api_key)

        completion = groq_client.chat.completions.create(
            model="meta-llama/llama-4-scout-17b-16e-instruct",
            messages=[
                {
                    "role": "system",
                    "content": "You are an expert at writing professional brand partnership proposals. Always respond with valid JSON only."
                },
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,
            max_completion_tokens=1500,
            top_p=1,
            stream=False,
        )

        content = completion.choices[0].message.content if completion.choices else "{}"
        content = content.strip()

        # Clean JSON response
        if content.startswith("```json"):
            content = content[7:]
        if content.startswith("```"):
            content = content[3:]
        if content.endswith("```"):
            content = content[:-3]
        content = content.strip()

        try:
            draft = json.loads(content)
            return {
                "subject": draft.get("subject", f"Collaboration Opportunity: {campaign.get('title', 'Campaign')}"),
                "message": draft.get("message", "We would love to collaborate with you on this campaign.")
            }
        except json.JSONDecodeError:
            # Fallback if JSON parsing fails
            return {
                "subject": f"Collaboration Opportunity: {campaign.get('title', 'Campaign')}",
                "message": content if content else "We would love to collaborate with you on this campaign."
            }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error drafting proposal: {str(e)}"
        ) from e
