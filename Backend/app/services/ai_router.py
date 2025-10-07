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

IMPORTANT: You MUST respond with valid JSON only. No additional text before or after the JSON.

Your tasks:
1. Understand the user's intent from their natural language query
2. Identify which API route(s) should be called
3. Extract required parameters from the query
4. If information is missing, ask follow-up questions
5. Return a structured response with the action to take

Response format (MUST be valid JSON):
{{
    "intent": "what the user wants to do",
    "route": "route_name or null if follow_up_needed",
    "parameters": {{"param_name": "value"}},
    "follow_up_needed": true/false,
    "follow_up_question": "question to ask if more info needed",
    "explanation": "brief explanation of what you understood"
}}

Examples of valid responses:

Query: "Show me my dashboard"
Response: {{"intent": "View dashboard overview", "route": "dashboard_overview", "parameters": {{}}, "follow_up_needed": false, "follow_up_question": null, "explanation": "User wants to see dashboard overview with metrics"}}

Query: "Find creators in tech"
Response: {{"intent": "Search for creators", "route": "creator_search", "parameters": {{"industry": "tech"}}, "follow_up_needed": false, "follow_up_question": null, "explanation": "User wants to find creators in tech industry"}}

Query: "Show campaigns"
Response: {{"intent": "List campaigns", "route": "campaigns", "parameters": {{}}, "follow_up_needed": false, "follow_up_question": null, "explanation": "User wants to see their campaigns"}}

Query: "What's my revenue?"
Response: {{"intent": "View revenue analytics", "route": "analytics_revenue", "parameters": {{}}, "follow_up_needed": false, "follow_up_question": null, "explanation": "User wants to see revenue analytics"}}

Remember: Always return valid JSON, no extra text."""

    async def process_query(self, query: str, brand_id: Optional[str] = None) -> Dict[str, Any]:
        """Process a natural language query and return routing information"""
        try:
            # Create the conversation with system prompt
            messages = [
                {"role": "system", "content": self.create_system_prompt()},
                {"role": "user", "content": f"User query: {query}"}
            ]
            # Add brand_id context if available
            if brand_id is not None:
                messages.append({
                    "role": "system", 
                    "content": f"Note: The user's brand_id is {brand_id}. Use this for any endpoints that require it."
                })
            # Call Groq LLM with lower temperature for more consistent responses
            import asyncio
            response = await asyncio.to_thread(
                self.client.chat.completions.create,
                model=os.getenv("GROQ_MODEL", "openai/gpt-oss-120b"),
                messages=messages,
                temperature=0.1,
                max_tokens=1024,
                response_format={"type": "json_object"}
            )
            # Parse the response
            llm_response = response.choices[0].message.content.strip()
            # Clean the response and try to parse JSON with retry logic
            parsed_response = self._parse_json_with_retry(llm_response, query)
            # Validate and enhance the response
            enhanced_response = self._enhance_response(parsed_response, brand_id, query)
            logger.info(f"AI Router processed query: '{query}' -> {enhanced_response['intent']}")
            return enhanced_response
        except Exception as e:
            logger.exception(f"Error processing query with AI Router: {e}")
            raise HTTPException(status_code=500, detail="AI processing error") from e

    def _enhance_response(self, response: Dict[str, Any], brand_id: Optional[str], original_query: str) -> Dict[str, Any]:
        """Enhance the LLM response with additional context and validation"""
        
        # Add brand_id to parameters if not present and route needs it
        if brand_id is not None and response.get("route"):
            route_info = self.available_routes.get(response["route"])
            if route_info and "brand_id" in route_info["parameters"]:
                if "parameters" not in response:
                    response["parameters"] = {}
                if "brand_id" not in response["parameters"]:
                    response["parameters"]["brand_id"] = str(brand_id)  # Ensure brand_id is string
        
        # Validate route exists
        if response.get("route") and response["route"] not in self.available_routes:
            response["route"] = None
            response["follow_up_needed"] = True
            response["follow_up_question"] = f"I don't recognize that action. Available actions include: {', '.join(self.available_routes.keys())}"
        
        # Ensure parameter types are correct (brand_id should be string)
        if "parameters" in response:
            if "brand_id" in response["parameters"]:
                response["parameters"]["brand_id"] = str(response["parameters"]["brand_id"])
        
        # Add metadata
        response["original_query"] = original_query
        response["timestamp"] = str(datetime.now())
        
        return response

    def _clean_llm_response(self, response: str) -> str:
        """Clean LLM response to extract valid JSON"""
        # Remove markdown code blocks
        if "```json" in response:
            start = response.find("```json") + 7
            end = response.find("```", start)
            if end != -1:
                response = response[start:end].strip()
        elif "```" in response:
            start = response.find("```") + 3
            end = response.find("```", start)
            if end != -1:
                response = response[start:end].strip()
        
        # Remove any text before the first {
        if "{" in response:
            response = response[response.find("{"):]
        
        # Remove any text after the last }
        if "}" in response:
            response = response[:response.rfind("}") + 1]
        
        return response.strip()

    def _parse_json_with_retry(self, llm_response: str, original_query: str) -> Dict[str, Any]:
        """Parse JSON with multiple fallback strategies"""
        # Strategy 1: Try direct JSON parsing
        try:
            return json.loads(llm_response)
        except json.JSONDecodeError:
            pass
        
        # Strategy 2: Clean and try again
        cleaned_response = self._clean_llm_response(llm_response)
        try:
            return json.loads(cleaned_response)
        except json.JSONDecodeError:
            pass
        
        # Strategy 3: Try to extract JSON from the response
        try:
            # Look for JSON-like structure
            import re
            json_pattern = r'\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}'
            matches = re.findall(json_pattern, llm_response)
            if matches:
                return json.loads(matches[0])
        except (json.JSONDecodeError, IndexError):
            pass
        
        # Strategy 4: Create a fallback response based on simple keyword matching
        fallback_response = self._create_fallback_response(original_query)
        logger.warning(f"Failed to parse LLM response, using fallback: {llm_response[:100]}...")
        return fallback_response

    def _create_fallback_response(self, query: str) -> Dict[str, Any]:
        """Create a fallback response based on keyword matching"""
        query_lower = query.lower()
        
        # Simple keyword matching
        if any(word in query_lower for word in ["dashboard", "overview", "summary"]):
            return {
                "intent": "View dashboard overview",
                "route": "dashboard_overview",
                "parameters": {},
                "follow_up_needed": False,
                "follow_up_question": None,
                "explanation": "User wants to see dashboard overview"
            }
        elif any(word in query_lower for word in ["campaign", "campaigns"]):
            return {
                "intent": "List campaigns",
                "route": "campaigns",
                "parameters": {},
                "follow_up_needed": False,
                "follow_up_question": None,
                "explanation": "User wants to see their campaigns"
            }
        elif any(word in query_lower for word in ["creator", "creators", "influencer"]):
            if any(word in query_lower for word in ["search", "find", "look"]):
                return {
                    "intent": "Search for creators",
                    "route": "creator_search",
                    "parameters": {},
                    "follow_up_needed": False,
                    "follow_up_question": None,
                    "explanation": "User wants to search for creators"
                }
            else:
                return {
                    "intent": "View creator matches",
                    "route": "creator_matches",
                    "parameters": {},
                    "follow_up_needed": False,
                    "follow_up_question": None,
                    "explanation": "User wants to see creator matches"
                }
        elif any(word in query_lower for word in ["revenue", "money", "earnings", "income"]):
            return {
                "intent": "View revenue analytics",
                "route": "analytics_revenue",
                "parameters": {},
                "follow_up_needed": False,
                "follow_up_question": None,
                "explanation": "User wants to see revenue analytics"
            }
        elif any(word in query_lower for word in ["performance", "analytics", "metrics"]):
            return {
                "intent": "View performance analytics",
                "route": "analytics_performance",
                "parameters": {},
                "follow_up_needed": False,
                "follow_up_question": None,
                "explanation": "User wants to see performance analytics"
            }
        elif any(word in query_lower for word in ["contract", "contracts"]):
            return {
                "intent": "View contracts",
                "route": "contracts",
                "parameters": {},
                "follow_up_needed": False,
                "follow_up_question": None,
                "explanation": "User wants to see their contracts"
            }
        else:
            return {
                "intent": "unknown",
                "route": None,
                "parameters": {},
                "follow_up_needed": True,
                "follow_up_question": "I didn't understand your request. Could you please rephrase it?",
                "explanation": "Failed to parse LLM response, please try again with different wording"
            }

    def get_route_info(self, route_name: str) -> Optional[Dict[str, Any]]:
        """Get information about a specific route"""
        return self.available_routes.get(route_name)

    def list_available_routes(self) -> Dict[str, Any]:
        """List all available routes for debugging"""
        return self.available_routes

# Global instance
ai_router = AIRouter()