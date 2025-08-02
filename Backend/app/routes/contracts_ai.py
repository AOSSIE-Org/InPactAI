from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import httpx
import os
from datetime import datetime
import json

router = APIRouter(prefix="/api/contracts/ai", tags=["Contracts AI"])

# Initialize Supabase client
from supabase import create_client, Client
supabase: Client = create_client(
    os.environ.get("SUPABASE_URL", "https://your-project.supabase.co"),
    os.environ.get("SUPABASE_KEY", "your-anon-key")
)

class ContractQuery(BaseModel):
    query: str
    contract_id: Optional[str] = None
    user_id: Optional[str] = None

class ContractAnalysis(BaseModel):
    contract_id: str
    risk_score: float
    risk_factors: List[str]
    recommendations: List[str]
    performance_prediction: str
    market_comparison: Dict[str, Any]

class AIResponse(BaseModel):
    response: str
    analysis: Optional[ContractAnalysis] = None
    suggestions: List[str] = []
    data: Dict[str, Any] = {}

@router.post("/chat", response_model=AIResponse)
async def contract_ai_chat(query: ContractQuery):
    """AI-powered contract assistant for natural language queries"""
    
    try:
        # Get all contracts for context
        contracts_response = supabase.table("contracts").select("*").execute()
        contracts = contracts_response.data if contracts_response.data else []
        
        # Get contract statistics
        stats_response = supabase.table("contracts").select("status, total_budget").execute()
        stats_data = stats_response.data if stats_response.data else []
        
        # Prepare context for AI
        context = {
            "total_contracts": len(contracts),
            "contracts": contracts[:10],  # Limit for context
            "stats": {
                "active": len([c for c in stats_data if c.get("status") == "active"]),
                "draft": len([c for c in stats_data if c.get("status") == "draft"]),
                "completed": len([c for c in stats_data if c.get("status") == "completed"]),
                "total_budget": sum([c.get("total_budget", 0) for c in stats_data])
            }
        }
        
        # Create AI prompt
        system_prompt = f"""You are an AI contract assistant for InPactAI, a creator-brand collaboration platform. 

Available data:
- Total contracts: {context['total_contracts']}
- Active contracts: {context['stats']['active']}
- Draft contracts: {context['stats']['draft']}
- Completed contracts: {context['stats']['completed']}
- Total budget: ${context['stats']['total_budget']:,}

Contract data (first 10): {json.dumps(contracts[:10], indent=2)}

Your capabilities:
1. Analyze contracts for risks and opportunities
2. Provide contract recommendations
3. Answer questions about contract performance
4. Suggest improvements
5. Compare contracts and trends
6. Predict contract success

Respond in a helpful, professional tone. If analyzing a specific contract, provide detailed insights. If general questions, provide overview and trends."""

        user_prompt = f"User Query: {query.query}"
        if query.contract_id:
            user_prompt += f"\nSpecific Contract ID: {query.contract_id}"
        
        # Call Groq AI
        groq_url = "https://api.groq.com/openai/v1/chat/completions"
        headers = {
            "Authorization": f"Bearer {os.environ.get('GROQ_API_KEY')}",
            "Content-Type": "application/json"
        }
        
        payload = {
            "model": "moonshotai/kimi-k2-instruct",
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            "temperature": 0.7,
            "max_tokens": 1000
        }
        
        async with httpx.AsyncClient() as client:
            response = await client.post(groq_url, headers=headers, json=payload)
            response.raise_for_status()
            ai_response = response.json()
            
        ai_message = ai_response["choices"][0]["message"]["content"]
        
        # Generate analysis if contract-specific
        analysis = None
        if query.contract_id:
            contract = next((c for c in contracts if c.get("id") == query.contract_id), None)
            if contract:
                analysis = await generate_contract_analysis(contract, contracts)
        
        # Extract suggestions from AI response
        suggestions = extract_suggestions(ai_message)
        
        return AIResponse(
            response=ai_message,
            analysis=analysis,
            suggestions=suggestions,
            data={"context": context}
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI processing failed: {str(e)}")

async def generate_contract_analysis(contract: Dict, all_contracts: List[Dict]) -> ContractAnalysis:
    """Generate detailed analysis for a specific contract"""
    
    # Calculate risk score based on various factors
    risk_factors = []
    risk_score = 0.0
    
    # Budget risk
    if contract.get("total_budget", 0) > 10000:
        risk_factors.append("High budget contract")
        risk_score += 0.2
    
    # Duration risk
    if contract.get("start_date") and contract.get("end_date"):
        start = datetime.fromisoformat(contract["start_date"].replace("Z", "+00:00"))
        end = datetime.fromisoformat(contract["end_date"].replace("Z", "+00:00"))
        duration_days = (end - start).days
        if duration_days > 90:
            risk_factors.append("Long-term contract")
            risk_score += 0.15
    
    # Status risk
    if contract.get("status") == "draft":
        risk_factors.append("Contract in draft status")
        risk_score += 0.1
    
    # Market comparison
    similar_contracts = [
        c for c in all_contracts 
        if c.get("contract_type") == contract.get("contract_type") 
        and c.get("id") != contract.get("id")
    ]
    
    avg_budget = sum([c.get("total_budget", 0) for c in similar_contracts]) / len(similar_contracts) if similar_contracts else 0
    
    market_comparison = {
        "similar_contracts_count": len(similar_contracts),
        "average_budget": avg_budget,
        "budget_percentile": "above_average" if contract.get("total_budget", 0) > avg_budget else "below_average"
    }
    
    # Generate recommendations
    recommendations = []
    if risk_score > 0.3:
        recommendations.append("Consider breaking down into smaller milestones")
    if contract.get("status") == "draft":
        recommendations.append("Review and finalize contract terms")
    if contract.get("total_budget", 0) > avg_budget * 1.5:
        recommendations.append("Consider negotiating budget or adding deliverables")
    
    # Performance prediction
    if risk_score < 0.2:
        performance_prediction = "High success probability"
    elif risk_score < 0.4:
        performance_prediction = "Moderate success probability"
    else:
        performance_prediction = "Requires careful monitoring"
    
    return ContractAnalysis(
        contract_id=contract.get("id", ""),
        risk_score=min(risk_score, 1.0),
        risk_factors=risk_factors,
        recommendations=recommendations,
        performance_prediction=performance_prediction,
        market_comparison=market_comparison
    )

def extract_suggestions(ai_response: str) -> List[str]:
    """Extract actionable suggestions from AI response"""
    suggestions = []
    
    # Simple keyword-based extraction
    if "recommend" in ai_response.lower():
        suggestions.append("Review contract recommendations")
    if "risk" in ai_response.lower():
        suggestions.append("Check risk assessment")
    if "budget" in ai_response.lower():
        suggestions.append("Review budget allocation")
    if "timeline" in ai_response.lower():
        suggestions.append("Optimize project timeline")
    
    return suggestions

@router.get("/insights")
async def get_contract_insights():
    """Get AI-generated contract insights and trends"""
    
    try:
        # Get contract data
        contracts_response = supabase.table("contracts").select("*").execute()
        contracts = contracts_response.data if contracts_response.data else []
        
        if not contracts:
            return {"insights": "No contracts available for analysis"}
        
        # Calculate insights
        total_budget = sum([c.get("total_budget", 0) for c in contracts])
        avg_budget = total_budget / len(contracts) if contracts else 0
        
        status_counts = {}
        for contract in contracts:
            status = contract.get("status", "unknown")
            status_counts[status] = status_counts.get(status, 0) + 1
        
        # Type analysis
        type_counts = {}
        for contract in contracts:
            contract_type = contract.get("contract_type", "unknown")
            type_counts[contract_type] = type_counts.get(contract_type, 0) + 1
        
        insights = {
            "total_contracts": len(contracts),
            "total_budget": total_budget,
            "average_budget": avg_budget,
            "status_distribution": status_counts,
            "type_distribution": type_counts,
            "trends": {
                "high_value_contracts": len([c for c in contracts if c.get("total_budget", 0) > avg_budget * 2]),
                "active_contracts": status_counts.get("active", 0),
                "draft_contracts": status_counts.get("draft", 0)
            }
        }
        
        return {"insights": insights}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate insights: {str(e)}")

@router.post("/analyze/{contract_id}")
async def analyze_contract(contract_id: str):
    """Deep analysis of a specific contract"""
    
    try:
        # Get specific contract
        contract_response = supabase.table("contracts").select("*").eq("id", contract_id).execute()
        contract = contract_response.data[0] if contract_response.data else None
        
        if not contract:
            raise HTTPException(status_code=404, detail="Contract not found")
        
        # Get all contracts for comparison
        all_contracts_response = supabase.table("contracts").select("*").execute()
        all_contracts = all_contracts_response.data if all_contracts_response.data else []
        
        # Generate analysis
        analysis = await generate_contract_analysis(contract, all_contracts)
        
        return {"analysis": analysis}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}") 