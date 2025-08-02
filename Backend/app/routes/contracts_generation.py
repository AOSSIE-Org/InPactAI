from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import httpx
import os
from datetime import datetime, timedelta
import json

router = APIRouter(prefix="/api/contracts/generation", tags=["Contract Generation"])

# Initialize Supabase client
from supabase import create_client, Client
supabase_url = os.environ.get("SUPABASE_URL")
supabase_key = os.environ.get("SUPABASE_KEY")
if not supabase_url or not supabase_key:
    raise ValueError("SUPABASE_URL and SUPABASE_KEY must be set in environment variables")
supabase: Client = create_client(supabase_url, supabase_key)

class ContractGenerationRequest(BaseModel):
    creator_id: str
    brand_id: str
    contract_type: str  # "one-time", "recurring", "campaign", "sponsorship"
    budget_range: str  # "low", "medium", "high"
    content_type: List[str]  # ["instagram", "youtube", "tiktok", "blog"]
    duration_weeks: int
    requirements: str  # Natural language description
    industry: Optional[str] = None
    exclusivity: Optional[str] = "non-exclusive"
    compliance_requirements: Optional[List[str]] = []

class ContractTemplate(BaseModel):
    id: str
    name: str
    contract_type: str
    industry: str
    template_data: Dict[str, Any]
    usage_count: int
    success_rate: float

class GeneratedContract(BaseModel):
    contract_title: str
    contract_type: str
    total_budget: float
    start_date: str
    end_date: str
    terms_and_conditions: Dict[str, Any]
    payment_terms: Dict[str, Any]
    deliverables: Dict[str, Any]
    legal_compliance: Dict[str, Any]
    risk_score: float
    ai_suggestions: List[str]

class ClauseSuggestion(BaseModel):
    clause_type: str
    title: str
    content: str
    importance: str  # "critical", "important", "optional"
    reasoning: str

@router.get("/user-by-email")
async def get_user_by_email(email: str):
    """Get user information by email"""
    try:
        user_response = supabase.table("users").select("*").eq("email", email).execute()
        
        if not user_response.data:
            raise HTTPException(status_code=404, detail=f"User with email '{email}' not found")
        
        user = user_response.data[0]
        return {
            "id": user["id"],
            "username": user["username"],
            "email": user["email"],
            "role": user["role"]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching user: {str(e)}")

@router.get("/available-users")
async def get_available_users():
    """Get available creator and brand IDs for testing"""
    try:
        # Get creators
        creators_response = supabase.table("users").select("id, username, role").eq("role", "creator").execute()
        creators = creators_response.data if creators_response.data else []
        
        # Get brands
        brands_response = supabase.table("users").select("id, username, role").eq("role", "brand").execute()
        brands = brands_response.data if brands_response.data else []
        
        return {
            "creators": creators,
            "brands": brands,
            "message": "Available users for contract generation"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching users: {str(e)}")

@router.post("/generate", response_model=GeneratedContract)
async def generate_smart_contract(request: ContractGenerationRequest):
    """Generate a smart contract based on requirements"""
    
    try:
        # Validate creator and brand IDs exist
        creator_response = supabase.table("users").select("*").eq("id", request.creator_id).execute()
        brand_response = supabase.table("users").select("*").eq("id", request.brand_id).execute()
        
        if not creator_response.data:
            raise HTTPException(status_code=404, detail=f"Creator with ID '{request.creator_id}' not found")
        
        if not brand_response.data:
            raise HTTPException(status_code=404, detail=f"Brand with ID '{request.brand_id}' not found")
        
        creator = creator_response.data[0]
        brand = brand_response.data[0]
        
        # Validate that creator is actually a creator and brand is actually a brand
        if creator.get("role") != "creator":
            raise HTTPException(status_code=400, detail=f"User '{request.creator_id}' is not a creator")
        
        if brand.get("role") != "brand":
            raise HTTPException(status_code=400, detail=f"User '{request.brand_id}' is not a brand")
        
        # Get similar contracts for reference
        similar_contracts_response = supabase.table("contracts").select("*").eq("contract_type", request.contract_type).limit(5).execute()
        similar_contracts = similar_contracts_response.data if similar_contracts_response.data else []
        
        # Calculate budget based on type and content
        budget = calculate_budget(request.budget_range, request.content_type, request.duration_weeks)
        
        # Generate dates
        start_date = datetime.now().date()
        end_date = start_date + timedelta(weeks=request.duration_weeks)
        
        # Create AI prompt for contract generation
        system_prompt = f"""You are an expert contract lawyer specializing in creator-brand collaborations. Generate a comprehensive contract based on the following requirements:

Creator Profile: {json.dumps(creator, indent=2)}
Brand Profile: {json.dumps(brand, indent=2)}
Contract Type: {request.contract_type}
Budget: ${budget:,.2f}
Content Types: {', '.join(request.content_type)}
Duration: {request.duration_weeks} weeks
Requirements: {request.requirements}
Industry: {request.industry or 'General'}
Exclusivity: {request.exclusivity}

Similar Contracts for Reference: {json.dumps(similar_contracts[:3], indent=2)}

IMPORTANT: You must respond with ONLY valid JSON. Do not include any text before or after the JSON. The JSON must have these exact keys:

{{
  "contract_title": "Professional contract title",
  "terms_and_conditions": {{
    "content_guidelines": "Guidelines for content creation",
    "usage_rights": "Rights granted to brand",
    "exclusivity": "{request.exclusivity}",
    "revision_policy": "Number of revisions allowed",
    "approval_process": "Content approval process"
  }},
  "payment_terms": {{
    "currency": "USD",
    "payment_schedule": "Payment schedule description",
    "payment_method": "Payment method",
    "late_fees": "Late payment fees",
    "advance_payment": "Advance payment amount",
    "final_payment": "Final payment amount"
  }},
  "deliverables": {{
    "content_type": "{', '.join(request.content_type)}",
    "quantity": "Number of deliverables",
    "timeline": "{request.duration_weeks} weeks",
    "format": "Content format requirements",
    "specifications": "Detailed specifications"
  }},
  "legal_compliance": {{
    "ftc_compliance": true,
    "disclosure_required": true,
    "disclosure_format": "Required disclosure format",
    "data_protection": "Data protection requirements"
  }},
  "risk_score": 0.3,
  "ai_suggestions": [
    "Suggestion 1",
    "Suggestion 2",
    "Suggestion 3"
  ]
}}

Generate a complete, professional contract that follows this exact JSON structure."""

        user_prompt = f"Generate a smart contract for: {request.requirements}"
        
        # Call Groq AI
        groq_api_key = os.environ.get('GROQ_API_KEY')
        if not groq_api_key:
            raise HTTPException(status_code=500, detail="GROQ_API_KEY is not configured. Please set up the API key to generate AI contracts.")
        
        groq_url = "https://api.groq.com/openai/v1/chat/completions"
        headers = {
            "Authorization": f"Bearer {groq_api_key}",
            "Content-Type": "application/json"
        }
        
        payload = {
            "model": "moonshotai/kimi-k2-instruct",
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            "temperature": 0.7,
            "max_tokens": 2000
        }
        
        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(groq_url, headers=headers, json=payload)
                response.raise_for_status()
                ai_response = response.json()
                
            ai_message = ai_response["choices"][0]["message"]["content"]
            
            # Check if AI response is empty
            if not ai_message or ai_message.strip() == "":
                raise HTTPException(status_code=500, detail="AI returned empty response. Please try again or check your API configuration.")
            
            # Parse AI response
            try:
                contract_data = json.loads(ai_message)
            except json.JSONDecodeError as json_error:
                # Log the actual AI response for debugging
                print(f"AI Response (first 500 chars): {ai_message[:500]}")
                raise HTTPException(status_code=500, detail=f"AI returned invalid JSON response: {str(json_error)}. Response preview: {ai_message[:200]}")
        except httpx.HTTPStatusError as http_error:
            error_detail = f"AI API HTTP error: {http_error.response.status_code}"
            try:
                error_text = http_error.response.text
                error_detail += f" - {error_text}"
            except:
                error_detail += " - Unable to read error response"
            raise HTTPException(status_code=500, detail=error_detail)
        except httpx.RequestError as request_error:
            raise HTTPException(status_code=500, detail=f"AI API request failed: {str(request_error)}")
        except Exception as ai_error:
            raise HTTPException(status_code=500, detail=f"AI contract generation failed: {str(ai_error)}")
        

        
        return GeneratedContract(
            contract_title=contract_data.get("contract_title", f"{request.contract_type.title()} Contract"),
            contract_type=request.contract_type,
            total_budget=budget,
            start_date=start_date.isoformat(),
            end_date=end_date.isoformat(),
            terms_and_conditions=contract_data.get("terms_and_conditions", {}),
            payment_terms=contract_data.get("payment_terms", {}),
            deliverables=contract_data.get("deliverables", {}),
            legal_compliance=contract_data.get("legal_compliance", {}),
            risk_score=contract_data.get("risk_score", 0.3),
            ai_suggestions=contract_data.get("ai_suggestions", [])
        )
        
    except Exception as e:
        import traceback
        print(f"Contract generation error: {str(e)}")
        print(f"Traceback: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"Contract generation failed: {str(e)}")

def calculate_budget(budget_range: str, content_types: List[str], duration_weeks: int) -> float:
    """Calculate budget based on requirements"""
    
    # Base rates per content type
    base_rates = {
        "instagram": 500,
        "youtube": 1000,
        "tiktok": 400,
        "facebook": 450,
        "twitter": 300,
        "linkedin": 600,
        "blog": 800
    }
    
    # Budget multipliers
    budget_multipliers = {
        "low": 0.7,
        "medium": 1.0,
        "high": 1.5
    }
    
    # Calculate base budget
    base_budget = sum(base_rates.get(content_type.lower(), 500) for content_type in content_types)
    
    # Apply budget range multiplier
    budget = base_budget * budget_multipliers.get(budget_range, 1.0)
    
    # Adjust for duration
    if duration_weeks > 4:
        budget *= 0.8  # Discount for longer contracts
    
    return round(budget, 2)



@router.post("/suggest-clauses")
async def suggest_clauses(contract_type: str, industry: str, budget: float):
    """Suggest relevant clauses for contract type"""
    
    try:
        # Create AI prompt for clause suggestions
        system_prompt = f"""You are a contract law expert. Suggest relevant clauses for a {contract_type} contract in the {industry} industry with a budget of ${budget:,.2f}.

Provide suggestions in JSON format with this structure:
{{
  "clauses": [
    {{
      "clause_type": "payment",
      "title": "Payment Terms",
      "content": "Detailed payment clause...",
      "importance": "critical",
      "reasoning": "Why this clause is important..."
    }}
  ]
}}

Focus on:
1. Payment and financial terms
2. Deliverables and quality standards
3. Intellectual property rights
4. Confidentiality and non-disclosure
5. Termination and dispute resolution
6. Compliance and legal requirements"""

        user_prompt = f"Suggest clauses for {contract_type} contract in {industry} industry"
        
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
            "max_tokens": 1500
        }
        
        async with httpx.AsyncClient() as client:
            response = await client.post(groq_url, headers=headers, json=payload)
            response.raise_for_status()
            ai_response = response.json()
            
        ai_message = ai_response["choices"][0]["message"]["content"]
        
        # Parse AI response
        try:
            clause_data = json.loads(ai_message)
            return {"clauses": clause_data.get("clauses", [])}
        except json.JSONDecodeError:
            # Fallback clauses
            return {"clauses": generate_fallback_clauses(contract_type, industry)}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Clause suggestion failed: {str(e)}")

def generate_fallback_clauses(contract_type: str, industry: str) -> List[Dict[str, Any]]:
    """Generate fallback clause suggestions"""
    
    base_clauses = [
        {
            "clause_type": "payment",
            "title": "Payment Terms",
            "content": "Payment shall be made in accordance with the agreed schedule. Late payments may incur penalties.",
            "importance": "critical",
            "reasoning": "Ensures timely payment and protects creator cash flow"
        },
        {
            "clause_type": "deliverables",
            "title": "Deliverables and Quality Standards",
            "content": "All deliverables must meet agreed quality standards and brand guidelines.",
            "importance": "critical",
            "reasoning": "Defines expectations and prevents disputes over quality"
        },
        {
            "clause_type": "intellectual_property",
            "title": "Intellectual Property Rights",
            "content": "Creator retains ownership of original content. Brand receives usage rights as specified.",
            "importance": "important",
            "reasoning": "Clarifies ownership and usage rights to prevent conflicts"
        },
        {
            "clause_type": "confidentiality",
            "title": "Confidentiality",
            "content": "Both parties agree to maintain confidentiality of proprietary information.",
            "importance": "important",
            "reasoning": "Protects sensitive business information"
        },
        {
            "clause_type": "termination",
            "title": "Termination",
            "content": "Either party may terminate with 30 days written notice.",
            "importance": "important",
            "reasoning": "Provides clear exit strategy for both parties"
        }
    ]
    
    return base_clauses

@router.post("/validate-compliance")
async def validate_contract_compliance(contract_data: Dict[str, Any]):
    """Validate contract for legal compliance"""
    
    try:
        # Create AI prompt for compliance validation
        system_prompt = """You are a legal compliance expert specializing in creator-brand contracts. Analyze the provided contract for compliance issues.

Check for:
1. FTC disclosure requirements
2. GDPR/data protection compliance
3. Intellectual property rights
4. Payment and tax compliance
5. Industry-specific regulations

Return analysis in JSON format:
{
  "is_compliant": true/false,
  "compliance_score": 0.0-1.0,
  "issues": ["list of compliance issues"],
  "recommendations": ["list of recommendations"],
  "risk_level": "low/medium/high"
}"""

        user_prompt = f"Validate compliance for contract: {json.dumps(contract_data, indent=2)}"
        
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
            "temperature": 0.5,
            "max_tokens": 1000
        }
        
        async with httpx.AsyncClient() as client:
            response = await client.post(groq_url, headers=headers, json=payload)
            response.raise_for_status()
            ai_response = response.json()
            
        ai_message = ai_response["choices"][0]["message"]["content"]
        
        # Parse AI response
        try:
            compliance_data = json.loads(ai_message)
            return compliance_data
        except json.JSONDecodeError:
            # Fallback compliance check
            return generate_fallback_compliance_check(contract_data)
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Compliance validation failed: {str(e)}")

def generate_fallback_compliance_check(contract_data: Dict[str, Any]) -> Dict[str, Any]:
    """Generate fallback compliance check"""
    
    issues = []
    recommendations = []
    
    # Basic compliance checks
    if not contract_data.get("legal_compliance", {}).get("ftc_compliance"):
        issues.append("Missing FTC disclosure requirements")
        recommendations.append("Add mandatory #ad or #sponsored disclosure")
    
    if not contract_data.get("terms_and_conditions", {}).get("usage_rights"):
        issues.append("Unclear intellectual property rights")
        recommendations.append("Define usage rights and ownership clearly")
    
    if not contract_data.get("payment_terms", {}).get("payment_schedule"):
        issues.append("Unclear payment terms")
        recommendations.append("Specify payment schedule and late fees")
    
    compliance_score = 0.7 if len(issues) == 0 else max(0.3, 0.7 - len(issues) * 0.1)
    risk_level = "low" if compliance_score > 0.8 else "medium" if compliance_score > 0.6 else "high"
    
    return {
        "is_compliant": len(issues) == 0,
        "compliance_score": compliance_score,
        "issues": issues,
        "recommendations": recommendations,
        "risk_level": risk_level
    }

@router.get("/templates")
async def get_contract_templates():
    """Get available contract templates"""
    
    try:
        # Get templates from database
        templates_response = supabase.table("contract_templates").select("*").execute()
        templates = templates_response.data if templates_response.data else []
        
        # If no templates in database, return default templates
        if not templates:
            templates = [
                {
                    "id": "template-1",
                    "name": "Influencer Sponsorship",
                    "contract_type": "sponsorship",
                    "industry": "general",
                    "usage_count": 0,
                    "success_rate": 0.85
                },
                {
                    "id": "template-2", 
                    "name": "Content Creation",
                    "contract_type": "one-time",
                    "industry": "general",
                    "usage_count": 0,
                    "success_rate": 0.90
                },
                {
                    "id": "template-3",
                    "name": "Brand Ambassador",
                    "contract_type": "recurring",
                    "industry": "general", 
                    "usage_count": 0,
                    "success_rate": 0.88
                }
            ]
        
        return {"templates": templates}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get templates: {str(e)}") 