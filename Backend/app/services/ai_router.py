import os
import json
import logging
from datetime import datetime
from typing import Dict, List, Optional, Any
from groq import Groq
from fastapi import HTTPException
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class AIRouter:
    def __init__(self):
        """Initialize AI Router with Groq client"""
        self.groq_api_key = os.getenv("GROQ_API_KEY")
        if not self.groq_api_key:
            raise ValueError("GROQ_API_KEY environment variable is required")
        
        self.client = Groq(api_key=self.groq_api_key)
        
        # Available API routes and their descriptions
        self.available_routes = {
            "dashboard_overview": {
                "endpoint": "/api/brand/dashboard/overview",
                "description": "Get dashboard overview with key metrics (total campaigns, revenue, creator matches, recent activity)",
                "parameters": ["brand_id"],
                "method": "GET"
            },
            "brand_profile": {
                "endpoint": "/api/brand/profile/{user_id}",
                "description": "Get or update brand profile information",
                "parameters": ["user_id"],
                "method": "GET/PUT"
            },
            "campaigns": {
                "endpoint": "/api/brand/campaigns",
                "description": "Manage campaigns (list, create, update, delete)",
                "parameters": ["brand_id", "campaign_id (optional)"],
                "method": "GET/POST/PUT/DELETE"
            },
            "creator_matches": {
                "endpoint": "/api/brand/creators/matches",
                "description": "Get AI-matched creators for the brand",
                "parameters": ["brand_id"],
                "method": "GET"
            },
            "creator_search": {
                "endpoint": "/api/brand/creators/search",
                "description": "Search for creators based on criteria (industry, engagement, location)",
                "parameters": ["brand_id", "industry (optional)", "min_engagement (optional)", "location (optional)"],
                "method": "GET"
            },
            "creator_profile": {
                "endpoint": "/api/brand/creators/{creator_id}/profile",
                "description": "Get detailed creator profile with insights and posts",
                "parameters": ["creator_id", "brand_id"],
                "method": "GET"
            },
            "analytics_performance": {
                "endpoint": "/api/brand/analytics/performance",
                "description": "Get campaign performance analytics and ROI",
                "parameters": ["brand_id"],
                "method": "GET"
            },
            "analytics_revenue": {
                "endpoint": "/api/brand/analytics/revenue",
                "description": "Get revenue analytics and payment statistics",
                "parameters": ["brand_id"],
                "method": "GET"
            },
            "contracts": {
                "endpoint": "/api/brand/contracts",
                "description": "Manage contracts (list, create, update status)",
                "parameters": ["brand_id", "contract_id (optional)"],
                "method": "GET/POST/PUT"
            }
        }

    def create_system_prompt(self) -> str:
        """Create the system prompt for the LLM"""
        routes_info = "\n".join([
            f"- {route_name}: {info['description']} (Parameters: {', '.join(info['parameters'])})"
            for route_name, info in self.available_routes.items()
        ])
        
        return f"""You are an intelligent AI assistant for a brand dashboard. Your job is to understand user queries and route them to the appropriate API endpoints.

Available API Routes:
{routes_info}

Your tasks:
1. Understand the user's intent from their natural language query
2. Identify which API route(s) should be called
3. Extract required parameters from the query
4. If information is missing, ask follow-up questions
5. Return a structured response with the action to take

Response format:
{{
    "intent": "what the user wants to do",
    "route": "route_name or null if follow_up_needed",
    "parameters": {{"param_name": "value"}},
    "follow_up_needed": true/false,
    "follow_up_question": "question to ask if more info needed",
    "explanation": "brief explanation of what you understood"
}}

Examples:
- "Show me my dashboard" → dashboard_overview
- "Find creators for my tech campaign" → creator_search with industry="tech"
- "I want to create a new campaign" → campaigns with method="POST"
- "What's my revenue this month?" → analytics_revenue
- "Show me creator matches" → creator_matches

Be helpful and ask clarifying questions when needed."""

    async def process_query(self, query: str, brand_id: str = None) -> Dict[str, Any]:
        """Process a natural language query and return routing information"""
        try:
            # Create the conversation with system prompt
            messages = [
                {"role": "system", "content": self.create_system_prompt()},
                {"role": "user", "content": f"User query: {query}"}
            ]
            
            # Add brand_id context if available
            if brand_id:
                messages.append({
                    "role": "system", 
                    "content": f"Note: The user's brand_id is {brand_id}. Use this for any endpoints that require it."
                })
            
            # Call Groq LLM
            response = self.client.chat.completions.create(
                model="moonshotai/kimi-k2-instruct",  # Updated to Kimi K2 instruct
                messages=messages,
                temperature=0.6,  # Updated temperature
                max_tokens=1024  # Updated max tokens
            )
            
            # Parse the response
            llm_response = response.choices[0].message.content.strip()
            
            # Try to parse JSON response
            try:
                parsed_response = json.loads(llm_response)
            except json.JSONDecodeError:
                # If JSON parsing fails, create a structured response
                parsed_response = {
                    "intent": "unknown",
                    "route": None,
                    "parameters": {},
                    "follow_up_needed": True,
                    "follow_up_question": "I didn't understand your request. Could you please rephrase it?",
                    "explanation": "Failed to parse LLM response",
                    "raw_response": llm_response
                }
            
            # Validate and enhance the response
            enhanced_response = self._enhance_response(parsed_response, brand_id, query)
            
            logger.info(f"AI Router processed query: '{query}' -> {enhanced_response['intent']}")
            return enhanced_response
            
        except Exception as e:
            logger.error(f"Error processing query with AI Router: {e}")
            raise HTTPException(status_code=500, detail="AI processing error")

    def _enhance_response(self, response: Dict[str, Any], brand_id: str, original_query: str) -> Dict[str, Any]:
        """Enhance the LLM response with additional context and validation"""
        
        # Add brand_id to parameters if not present and route needs it
        if brand_id and response.get("route"):
            route_info = self.available_routes.get(response["route"])
            if route_info and "brand_id" in route_info["parameters"]:
                if "parameters" not in response:
                    response["parameters"] = {}
                if "brand_id" not in response["parameters"]:
                    response["parameters"]["brand_id"] = brand_id
        
        # Validate route exists
        if response.get("route") and response["route"] not in self.available_routes:
            response["route"] = None
            response["follow_up_needed"] = True
            response["follow_up_question"] = f"I don't recognize that action. Available actions include: {', '.join(self.available_routes.keys())}"
        
        # Add metadata
        response["original_query"] = original_query
        response["timestamp"] = str(datetime.now())
        
        return response

    def get_route_info(self, route_name: str) -> Optional[Dict[str, Any]]:
        """Get information about a specific route"""
        return self.available_routes.get(route_name)

    def list_available_routes(self) -> Dict[str, Any]:
        """List all available routes for debugging"""
        return self.available_routes

# Global instance
ai_router = AIRouter() 