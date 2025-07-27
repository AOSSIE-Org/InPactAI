from fastapi import APIRouter, HTTPException, Query, Depends, Request
from typing import Dict, Any, Optional
from pydantic import BaseModel
import logging
from ..services.ai_router import ai_router
from ..services.redis_client import get_session_state, save_session_state
import uuid

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Define Router
router = APIRouter(prefix="/api/ai", tags=["AI Query"])

# Pydantic models for request/response
class AIQueryRequest(BaseModel):
    query: str
    brand_id: Optional[str] = None
    context: Optional[Dict[str, Any]] = None

class AIQueryResponse(BaseModel):
    intent: str
    route: Optional[str] = None
    parameters: Dict[str, Any] = {}
    follow_up_needed: bool = False
    follow_up_question: Optional[str] = None
    explanation: str
    original_query: str
    timestamp: str

@router.post("/query", response_model=AIQueryResponse)
async def process_ai_query(request: AIQueryRequest, http_request: Request):
    """
    Process a natural language query through AI and return routing information
    """
    try:
        # Validate input
        if not request.query or len(request.query.strip()) == 0:
            raise HTTPException(status_code=400, detail="Query cannot be empty")
        
        # Process query through AI router
        result = await ai_router.process_query(
            query=request.query.strip(),
            brand_id=request.brand_id
        )
        
        # --- Hybrid Orchestration Logic ---
        # Extended intent-to-parameter mapping for all available routes
        intent_param_map = {
            "dashboard_overview": {"required": ["brand_id"], "optional": []},
            "brand_profile": {"required": ["user_id"], "optional": []},
            "campaigns": {"required": ["brand_id"], "optional": ["campaign_id"]},
            "creator_matches": {"required": ["brand_id"], "optional": []},
            "creator_search": {"required": ["brand_id"], "optional": ["industry", "min_engagement", "location"]},
            "creator_profile": {"required": ["creator_id", "brand_id"], "optional": []},
            "analytics_performance": {"required": ["brand_id"], "optional": []},
            "analytics_revenue": {"required": ["brand_id"], "optional": []},
            "contracts": {"required": ["brand_id"], "optional": ["contract_id"]},
        }
        intent = result.get("route")
        params = result.get("parameters", {})
        
        # Debug: Log the parameters to understand the type issue
        logger.info(f"Intent: {intent}")
        logger.info(f"Params: {params}")
        logger.info(f"Params type: {type(params)}")
        for key, value in params.items():
            logger.info(f"  {key}: {value} (type: {type(value)})")
        
        api_result = None
        api_error = None
        # Prepare arguments for API calls, including optional params if present
        def get_api_args(intent, params):
            args = {}
            if intent in intent_param_map:
                # Add required params
                for param in intent_param_map[intent]["required"]:
                    if params.get(param) is not None:
                        args[param] = params[param]
                # Add optional params if present
                for param in intent_param_map[intent]["optional"]:
                    if params.get(param) is not None:
                        args[param] = params[param]
            return args

        # Check if all required params are present
        all_params_present = True
        missing_params = []
        if intent in intent_param_map:
            for param in intent_param_map[intent]["required"]:
                if not params.get(param):
                    all_params_present = False
                    missing_params.append(param)

        # Allow queries with only optional params if API supports it (e.g., creator_search with filters)
        only_optional_params = False
        if intent in intent_param_map and not all_params_present:
            # If at least one optional param is present and no required params are present
            if (
                len(intent_param_map[intent]["optional"]) > 0 and
                all(params.get(p) is None for p in intent_param_map[intent]["required"]) and
                any(params.get(p) is not None for p in intent_param_map[intent]["optional"])
            ):
                only_optional_params = True

        if (intent and all_params_present) or (intent and only_optional_params):
            try:
                api_args = get_api_args(intent, params)
                # Use aliases for get_campaigns and get_contracts
                if intent == "creator_search":
                    from ..routes.brand_dashboard import search_creators
                    api_result = await search_creators(**api_args)
                elif intent == "dashboard_overview":
                    from ..routes.brand_dashboard import get_dashboard_overview
                    api_result = await get_dashboard_overview(**api_args)
                elif intent == "creator_matches":
                    from ..routes.brand_dashboard import get_creator_matches
                    api_result = await get_creator_matches(**api_args)
                elif intent == "brand_profile":
                    from ..routes.brand_dashboard import get_brand_profile
                    api_result = await get_brand_profile(**api_args)
                elif intent == "campaigns":
                    from ..routes.brand_dashboard import get_brand_campaigns as get_campaigns
                    api_result = await get_campaigns(**api_args)
                elif intent == "creator_profile":
                    from ..routes.brand_dashboard import get_creator_profile
                    api_result = await get_creator_profile(**api_args)
                elif intent == "analytics_performance":
                    from ..routes.brand_dashboard import get_campaign_performance
                    api_result = await get_campaign_performance(**api_args)
                elif intent == "analytics_revenue":
                    from ..routes.brand_dashboard import get_revenue_analytics
                    api_result = await get_revenue_analytics(**api_args)
                elif intent == "contracts":
                    from ..routes.brand_dashboard import get_brand_contracts as get_contracts
                    api_result = await get_contracts(**api_args)
            except Exception as api_exc:
                logger.error(f"API call failed for intent '{intent}': {api_exc}")
                api_error = str(api_exc)

        # Convert to response model, add 'result' field for actual data
        response = AIQueryResponse(
            intent=result.get("intent", "unknown"),
            route=result.get("route"),
            parameters=params,
            follow_up_needed=not all_params_present and not only_optional_params or api_error is not None,
            follow_up_question=(result.get("follow_up_question") if not all_params_present and not only_optional_params else None),
            explanation=(result.get("explanation", "") if not api_error else f"An error occurred while processing your request: {api_error}"),
            original_query=result.get("original_query", request.query),
            timestamp=result.get("timestamp", ""),
        )
        # Attach result if available
        response_dict = response.dict()
        # 1. Get or generate session_id
        session_id = http_request.headers.get("X-Session-ID")
        if not session_id and request.context:
            session_id = request.context.get("session_id")
        if not session_id:
            session_id = str(uuid.uuid4())

        # 2. Load previous state from Redis
        state = await get_session_state(session_id)
        prev_params = state.get("params", {})
        prev_intent = state.get("intent")

        # 3. Merge new params and intent
        # Use new intent if present, else previous
        intent = result.get("route") or prev_intent
        params = {**prev_params, **result.get("parameters", {})}
        state["params"] = params
        state["intent"] = intent

        # 4. Save updated state to Redis
        await save_session_state(session_id, state)

        response_dict["session_id"] = session_id
        if api_result is not None:
            response_dict["result"] = api_result
        if api_error is not None:
            response_dict["error"] = api_error
        return response_dict
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error processing AI query: {e}")
        raise HTTPException(status_code=500, detail="Failed to process AI query")

@router.get("/routes")
async def get_available_routes():
    """
    Get list of available routes that the AI can route to
    """
    try:
        routes = ai_router.list_available_routes()
        return {
            "available_routes": routes,
            "total_routes": len(routes)
        }
    except Exception as e:
        logger.error(f"Error fetching available routes: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch routes")

@router.get("/route/{route_name}")
async def get_route_info(route_name: str):
    """
    Get detailed information about a specific route
    """
    try:
        route_info = ai_router.get_route_info(route_name)
        if not route_info:
            raise HTTPException(status_code=404, detail=f"Route '{route_name}' not found")
        
        return {
            "route_name": route_name,
            "info": route_info
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching route info: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch route info")

@router.post("/test")
async def test_ai_query(query: str = Query(..., description="Test query")):
    """
    Test endpoint for AI query processing (for development)
    """
    try:
        # Process test query
        result = await ai_router.process_query(query=query)
        
        return {
            "test_query": query,
            "result": result,
            "status": "success"
        }
    except Exception as e:
        logger.error(f"Error in test AI query: {e}")
        return {
            "test_query": query,
            "error": str(e),
            "status": "error"
        } 