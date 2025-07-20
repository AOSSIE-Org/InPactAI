from fastapi import APIRouter, HTTPException, Query, Depends
from typing import Dict, Any, Optional
from pydantic import BaseModel
import logging
from ..services.ai_router import ai_router

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
async def process_ai_query(request: AIQueryRequest):
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
        
        # Convert to response model
        response = AIQueryResponse(
            intent=result.get("intent", "unknown"),
            route=result.get("route"),
            parameters=result.get("parameters", {}),
            follow_up_needed=result.get("follow_up_needed", False),
            follow_up_question=result.get("follow_up_question"),
            explanation=result.get("explanation", ""),
            original_query=result.get("original_query", request.query),
            timestamp=result.get("timestamp", "")
        )
        
        logger.info(f"AI Query processed successfully: '{request.query}' -> {response.intent}")
        return response
        
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