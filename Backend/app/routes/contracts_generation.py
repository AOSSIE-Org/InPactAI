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
    contract_type: str  # "one-time", "recurring", "campaign", "sponsorship", "custom"
    custom_contract_type: Optional[str] = None
    min_budget: float
    max_budget: float
    content_type: List[str]  # ["instagram_post", "youtube_shorts", "custom", etc.]
    custom_content_types: Optional[List[str]] = []
    duration_value: int
    duration_unit: str  # "days", "weeks", "months", "years"
    requirements: str  # Natural language description
    industry: Optional[str] = None
    exclusivity: Optional[str] = "non-exclusive"
    compliance_requirements: Optional[List[str]] = []
    jurisdiction: Optional[str] = None
    dispute_resolution: Optional[str] = None
    custom_jurisdiction: Optional[str] = None
    custom_dispute_resolution: Optional[str] = None

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
    custom_contract_type: Optional[str] = None
    total_budget: float
    start_date: str
    end_date: str
    duration_value: int
    duration_unit: str
    content_types: List[str]
    custom_content_types: List[str] = []
    terms_and_conditions: Dict[str, Any]
    payment_terms: Dict[str, Any]
    deliverables: Dict[str, Any]
    legal_compliance: Dict[str, Any]
    risk_score: float
    ai_suggestions: List[str]
    pricing_fallback_used: Optional[bool] = False
    pricing_fallback_reason: Optional[str] = None
    generation_metadata: Optional[Dict[str, Any]] = None

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
        # Validate email format
        if not email or '@' not in email:
            raise HTTPException(status_code=400, detail="Invalid email format")
        
        print(f"Looking up user with email: {email}")
        
        user_response = supabase.table("users").select("*").eq("email", email).execute()
        
        print(f"User response: {user_response.data}")
        
        if not user_response.data:
            raise HTTPException(status_code=404, detail=f"User with email '{email}' not found")
        
        user = user_response.data[0]
        return {
            "id": user["id"],
            "username": user["username"],
            "email": user["email"],
            "role": user["role"]
        }
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error in get_user_by_email: {str(e)}")
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
        
        # Calculate budget based on min/max range
        budget = (request.min_budget + request.max_budget) / 2  # Use average of min/max
        
        # Convert duration to weeks for date calculation
        duration_weeks = (lambda: {
            'days': request.duration_value / 7,
            'weeks': request.duration_value,
            'months': request.duration_value * 4.33,  # Average weeks per month
            'years': request.duration_value * 52
        }.get(request.duration_unit, request.duration_value))()
        
        # Generate dates
        start_date = datetime.now().date()
        end_date = start_date + timedelta(weeks=duration_weeks)
        
        # Create AI prompt for contract generation
        # Get jurisdiction details
        jurisdiction_info = ""
        if request.jurisdiction:
            if request.jurisdiction == "custom" and request.custom_jurisdiction:
                jurisdiction_info = f"Custom Jurisdiction: {request.custom_jurisdiction}"
            else:
                jurisdiction_info = f"Governing Jurisdiction: {request.jurisdiction}"
        
        dispute_info = ""
        if request.dispute_resolution:
            if request.dispute_resolution == "custom" and request.custom_dispute_resolution:
                dispute_info = f"Custom Dispute Resolution: {request.custom_dispute_resolution}"
            else:
                dispute_info = f"Dispute Resolution: {request.dispute_resolution}"

        # Prepare content types string including custom types
        content_types_str = ', '.join(request.content_type)
        if request.custom_content_types:
            content_types_str += f", {', '.join(request.custom_content_types)}"
        
        # Prepare contract type string
        contract_type_str = request.contract_type
        if request.contract_type == 'custom' and request.custom_contract_type:
            contract_type_str = request.custom_contract_type
        
        system_prompt = f"""You are an expert contract lawyer specializing in creator-brand collaborations. Generate a comprehensive contract based on the following requirements:

Creator Profile: {json.dumps(creator, indent=2)}
Brand Profile: {json.dumps(brand, indent=2)}
Contract Type: {contract_type_str}
Budget: ${budget:,.2f}
Content Types: {content_types_str}
Duration: {request.duration_value} {request.duration_unit}
Requirements: {request.requirements}
Industry: {request.industry or 'General'}
Exclusivity: {request.exclusivity}
{jurisdiction_info}
{dispute_info}

Similar Contracts for Reference: {json.dumps(similar_contracts[:3], indent=2)}

IMPORTANT: You must respond with ONLY valid JSON. Do not include any text before or after the JSON. The JSON must have these exact keys:

{{
  "contract_title": "Professional contract title",
  "terms_and_conditions": {{
    "content_guidelines": "Guidelines for content creation",
    "usage_rights": "Rights granted to brand",
    "exclusivity": "{request.exclusivity}",
    "revision_policy": "Number of revisions allowed",
    "approval_process": "Content approval process",
    "governing_law": "{jurisdiction_info or 'Standard contract law'}",
    "dispute_resolution": "{dispute_info or 'Standard dispute resolution'}",
    "jurisdiction": "{request.jurisdiction or 'Standard jurisdiction'}"
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
    "timeline": "{request.duration_value} {request.duration_unit}",
    "format": "Content format requirements",
    "specifications": "Detailed specifications"
  }},
  "legal_compliance": {{
    "ftc_compliance": true,
    "disclosure_required": true,
    "disclosure_format": "Required disclosure format",
    "data_protection": "Data protection requirements",
    "jurisdiction_compliance": "Compliance with {request.jurisdiction or 'standard'} jurisdiction laws"
  }},
  "risk_score": 0.3,
  "ai_suggestions": [
    "Suggestion 1",
    "Suggestion 2",
    "Suggestion 3"
  ]
}}

Generate a complete, professional contract that follows this exact JSON structure and incorporates the specified jurisdiction and dispute resolution requirements."""

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
        
        # Use Groq AI for enhanced contract generation
        groq_api_key = os.environ.get('GROQ_API_KEY')
        if not groq_api_key:
            # Fallback if no API key
            contract_data = {
                "contract_title": f"{contract_type_str.title()} Contract - {request.industry or 'General'}",
                "terms_and_conditions": {
                    "content_guidelines": "Content must align with brand guidelines and target audience",
                    "usage_rights": "Brand receives rights to use content across specified platforms",
                    "exclusivity": request.exclusivity,
                    "revision_policy": "2 rounds of revisions included",
                    "approval_process": "Content requires brand approval before publication",
                    "governing_law": f"Governing law: {request.jurisdiction or 'Standard contract law'}",
                    "dispute_resolution": f"Dispute resolution: {request.dispute_resolution or 'Standard dispute resolution'}",
                    "jurisdiction": request.jurisdiction or "Standard jurisdiction"
                },
                "payment_terms": {
                    "currency": "USD",
                    "payment_schedule": "50% upfront, 50% upon completion",
                    "payment_method": "Bank transfer or digital payment",
                    "late_fees": "5% monthly interest on overdue payments",
                    "advance_payment": f"${request.min_budget * 0.5:,.2f}",
                    "final_payment": f"${request.max_budget * 0.5:,.2f}"
                },
                "deliverables": {
                    "content_type": content_types_str,
                    "quantity": "1 deliverable per content type",
                    "timeline": f"{request.duration_value} {request.duration_unit}",
                    "format": "High-quality digital content",
                    "specifications": request.requirements
                },
                "legal_compliance": {
                    "ftc_compliance": True,
                    "disclosure_required": True,
                    "disclosure_format": "Clear disclosure of sponsored content",
                    "data_protection": "GDPR compliant data handling",
                    "jurisdiction_compliance": f"Compliance with {request.jurisdiction or 'standard'} jurisdiction laws"
                },
                "risk_score": calculate_risk_score(request),
                "ai_suggestions": generate_ai_suggestions(request, calculate_risk_score(request))
            }
        else:
            # Use Groq AI for enhanced generation
            try:
                risk_score = calculate_risk_score(request)
                
                # Get jurisdiction details for enhanced generation
                jurisdiction_info = ""
                if request.jurisdiction:
                    if request.jurisdiction == "custom" and request.custom_jurisdiction:
                        jurisdiction_info = f"Custom Jurisdiction: {request.custom_jurisdiction}"
                    else:
                        jurisdiction_info = f"Governing Jurisdiction: {request.jurisdiction}"
                
                dispute_info = ""
                if request.dispute_resolution:
                    if request.dispute_resolution == "custom" and request.custom_dispute_resolution:
                        dispute_info = f"Custom Dispute Resolution: {request.custom_dispute_resolution}"
                    else:
                        dispute_info = f"Dispute Resolution: {request.dispute_resolution}"

                system_prompt = f"""You are an expert contract lawyer and risk analyst specializing in creator-brand collaborations. 

Analyze this contract request and provide enhanced contract terms and AI suggestions:

Contract Details:
- Type: {request.contract_type}
- Budget: ${request.min_budget:,.2f} - ${request.max_budget:,.2f}
- Content Types: {', '.join(request.content_type)}
- Duration: {request.duration_weeks} weeks
- Industry: {request.industry or 'General'}
- Exclusivity: {request.exclusivity}
- Requirements: {request.requirements}
- Compliance Requirements: {', '.join(request.compliance_requirements) if request.compliance_requirements else 'None'}
- Calculated Risk Score: {risk_score:.2f} ({risk_score*100:.0f}%)
{jurisdiction_info and f"- {jurisdiction_info}" or ""}
{dispute_info and f"- {dispute_info}" or ""}

Respond with ONLY valid JSON in this exact format:
{{
  "contract_title": "Professional contract title",
  "terms_and_conditions": {{
    "content_guidelines": "Enhanced guidelines based on content type and industry",
    "usage_rights": "Detailed rights specification",
    "exclusivity": "{request.exclusivity}",
    "revision_policy": "Specific revision terms",
    "approval_process": "Detailed approval workflow",
    "governing_law": "{jurisdiction_info or 'Standard contract law'}",
    "dispute_resolution": "{dispute_info or 'Standard dispute resolution'}",
    "jurisdiction": "{request.jurisdiction or 'Standard jurisdiction'}"
  }},
  "payment_terms": {{
    "currency": "USD",
    "payment_schedule": "Detailed payment schedule",
    "payment_method": "Payment method details",
    "late_fees": "Late payment terms",
    "advance_payment": "Advance payment details",
    "final_payment": "Final payment details"
  }},
  "deliverables": {{
    "content_type": "{', '.join(request.content_type)}",
    "quantity": "Specific quantity details",
    "timeline": "{request.duration_value} {request.duration_unit}",
    "format": "Detailed format requirements",
    "specifications": "Enhanced specifications"
  }},
  "legal_compliance": {{
    "ftc_compliance": true,
    "disclosure_required": true,
    "disclosure_format": "Specific disclosure requirements",
    "data_protection": "Enhanced data protection terms",
    "jurisdiction_compliance": "Compliance with {request.jurisdiction or 'standard'} jurisdiction laws"
  }},
  "risk_score": {risk_score},
  "ai_suggestions": [
    "AI-generated suggestion 1",
    "AI-generated suggestion 2",
    "AI-generated suggestion 3"
  ]
}}

Focus on:
1. Industry-specific requirements for {request.industry or 'general'} industry
2. Content type-specific guidelines for {', '.join(request.content_type)}
3. Risk mitigation strategies for {risk_score*100:.0f}% risk level
4. Compliance requirements: {', '.join(request.compliance_requirements) if request.compliance_requirements else 'Standard'}
5. Budget optimization for ${request.min_budget:,.2f} - ${request.max_budget:,.2f} range
6. Jurisdiction-specific legal requirements for {request.jurisdiction or 'standard'} jurisdiction
7. Dispute resolution framework: {request.dispute_resolution or 'standard'}"""

                user_prompt = f"Generate enhanced contract terms and AI suggestions for: {request.requirements}"
                
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
                
                async with httpx.AsyncClient() as client:
                    response = await client.post(groq_url, headers=headers, json=payload)
                    response.raise_for_status()
                    ai_response = response.json()
                    
                ai_message = ai_response["choices"][0]["message"]["content"]
                
                if not ai_message or ai_message.strip() == "":
                    raise Exception("AI returned empty response")
                
                # Parse AI response
                try:
                    contract_data = json.loads(ai_message)
                    # Ensure risk score is preserved
                    contract_data["risk_score"] = risk_score
                except json.JSONDecodeError as json_error:
                    print(f"AI Response (first 500 chars): {ai_message[:500]}")
                    raise Exception(f"AI returned invalid JSON: {str(json_error)}")
                    
            except Exception as ai_error:
                print(f"AI generation failed: {str(ai_error)}, using fallback")
                # Fallback to structured generation
                contract_data = {
                    "contract_title": f"{request.contract_type.title()} Contract - {request.industry or 'General'}",
                    "terms_and_conditions": {
                        "content_guidelines": "Content must align with brand guidelines and target audience",
                        "usage_rights": "Brand receives rights to use content across specified platforms",
                        "exclusivity": request.exclusivity,
                        "revision_policy": "2 rounds of revisions included",
                        "approval_process": "Content requires brand approval before publication"
                    },
                    "payment_terms": {
                        "currency": "USD",
                        "payment_schedule": "50% upfront, 50% upon completion",
                        "payment_method": "Bank transfer or digital payment",
                        "late_fees": "5% monthly interest on overdue payments",
                        "advance_payment": f"${request.min_budget * 0.5:,.2f}",
                        "final_payment": f"${request.max_budget * 0.5:,.2f}"
                    },
                    "deliverables": {
                        "content_type": ", ".join(request.content_type),
                        "quantity": "1 deliverable per content type",
                        "timeline": f"{request.duration_value} {request.duration_unit}",
                        "format": "High-quality digital content",
                        "specifications": request.requirements
                    },
                    "legal_compliance": {
                        "ftc_compliance": True,
                        "disclosure_required": True,
                        "disclosure_format": "Clear disclosure of sponsored content",
                        "data_protection": "GDPR compliant data handling"
                    },
                    "risk_score": calculate_risk_score(request),
                    "ai_suggestions": generate_ai_suggestions(request, calculate_risk_score(request))
                }
        

        
        return GeneratedContract(
            contract_title=contract_data.get("contract_title", f"{request.contract_type.title()} Contract"),
            contract_type=request.contract_type,
            custom_contract_type=request.custom_contract_type if request.contract_type == 'custom' else None,
            total_budget=budget,
            start_date=start_date.isoformat(),
            end_date=end_date.isoformat(),
            duration_value=request.duration_value,
            duration_unit=request.duration_unit,
            content_types=request.content_type,
            custom_content_types=request.custom_content_types,
            terms_and_conditions=contract_data.get("terms_and_conditions", {}),
            payment_terms=contract_data.get("payment_terms", {}),
            deliverables=contract_data.get("deliverables", {}),
            legal_compliance=contract_data.get("legal_compliance", {}),
            risk_score=contract_data.get("risk_score", 0.3),
            ai_suggestions=contract_data.get("ai_suggestions", []),
            pricing_fallback_used=False,  # This will be set by the frontend based on pricing recommendation
            pricing_fallback_reason=None,  # This will be set by the frontend based on pricing recommendation
            generation_metadata={
                "ai_generated": True,
                "generation_timestamp": datetime.now().isoformat(),
                "original_request": {
                    "requirements": request.requirements,
                    "industry": request.industry,
                    "exclusivity": request.exclusivity,
                    "compliance_requirements": request.compliance_requirements
                }
            }
        )
        
    except Exception as e:
        import traceback
        print(f"Contract generation error: {str(e)}")
        print(f"Traceback: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"Contract generation failed: {str(e)}")

def calculate_risk_score(request: ContractGenerationRequest) -> float:
    """Calculate risk score based on contract parameters"""
    
    risk_score = 0.0
    
    # Budget risk factors
    budget_range = request.max_budget - request.min_budget
    budget_volatility = budget_range / request.max_budget if request.max_budget > 0 else 0
    if budget_volatility > 0.5:  # High budget uncertainty
        risk_score += 0.2
    elif budget_volatility > 0.3:  # Medium budget uncertainty
        risk_score += 0.1
    
    # Contract type risk
    contract_type_risk = {
        "one-time": 0.1,
        "recurring": 0.15,
        "campaign": 0.2,
        "sponsorship": 0.25
    }
    risk_score += contract_type_risk.get(request.contract_type, 0.15)
    
    # Duration risk (longer contracts = higher risk)
    # Convert duration to weeks for risk calculation
    duration_weeks = (lambda: {
        'days': request.duration_value / 7,
        'weeks': request.duration_value,
        'months': request.duration_value * 4.33,
        'years': request.duration_value * 52
    }.get(request.duration_unit, request.duration_value))()
    
    if duration_weeks > 12:
        risk_score += 0.2
    elif duration_weeks > 8:
        risk_score += 0.15
    elif duration_weeks > 4:
        risk_score += 0.1
    
    # Content type risk
    content_type_risk = {
        # YouTube content types
        "youtube_shorts": 0.04,
        "youtube_video": 0.05,
        "youtube_live": 0.08,
        # Instagram content types
        "instagram_post": 0.06,
        "instagram_reel": 0.07,
        "instagram_story": 0.05,
        "instagram_live": 0.08,
        # TikTok content types
        "tiktok_video": 0.12,
        "tiktok_live": 0.15,
        # Facebook content types
        "facebook_post": 0.06,
        "facebook_live": 0.08,
        # Twitter content types
        "twitter_post": 0.07,
        "twitter_space": 0.09,
        # LinkedIn content types
        "linkedin_post": 0.04,
        "linkedin_article": 0.05,
        # Other content types
        "blog_post": 0.03,
        "podcast": 0.10,
        "newsletter": 0.04,
        # Legacy support
        "youtube": 0.05,
        "instagram": 0.08,
        "tiktok": 0.12,
        "facebook": 0.06,
        "twitter": 0.07,
        "linkedin": 0.04,
        "blog": 0.03
    }
    
    # Calculate average content type risk
    content_risks = [content_type_risk.get(ct.lower(), 0.1) for ct in request.content_type]
    avg_content_risk = sum(content_risks) / len(content_risks) if content_risks else 0.1
    risk_score += avg_content_risk
    
    # Exclusivity risk
    if request.exclusivity == "exclusive":
        risk_score += 0.15  # Higher risk for exclusive contracts
    elif request.exclusivity == "platform":
        risk_score += 0.1
    
    # Compliance requirements risk
    compliance_risk = len(request.compliance_requirements) * 0.02
    risk_score += min(compliance_risk, 0.1)  # Cap at 0.1
    
    # Industry risk
    high_risk_industries = ["finance", "healthcare", "legal", "pharmaceutical"]
    if request.industry and request.industry.lower() in high_risk_industries:
        risk_score += 0.1
    
    # Requirements complexity risk
    requirements_length = len(request.requirements)
    if requirements_length > 200:
        risk_score += 0.1
    elif requirements_length > 100:
        risk_score += 0.05
    
    # Cap risk score between 0.1 and 0.9
    risk_score = max(0.1, min(0.9, risk_score))
    
    return round(risk_score, 2)

def generate_ai_suggestions(request: ContractGenerationRequest, risk_score: float) -> List[str]:
    """Generate AI suggestions based on contract parameters and risk score"""
    
    suggestions = []
    
    # Budget-related suggestions
    budget_range = request.max_budget - request.min_budget
    budget_volatility = budget_range / request.max_budget if request.max_budget > 0 else 0
    
    if budget_volatility > 0.5:
        suggestions.append("Consider setting a more specific budget range to reduce uncertainty")
    elif budget_volatility > 0.3:
        suggestions.append("Define clear payment milestones to manage budget expectations")
    
    # Contract type suggestions
    if request.contract_type == "sponsorship":
        suggestions.append("Include detailed FTC disclosure requirements for sponsored content")
        suggestions.append("Specify content usage rights and duration limitations")
    elif request.contract_type == "recurring":
        suggestions.append("Define performance metrics and review periods")
        suggestions.append("Include termination clauses with notice periods")
    elif request.contract_type == "campaign":
        suggestions.append("Set clear campaign objectives and success metrics")
        suggestions.append("Include content approval timeline and revision limits")
    
    # Duration suggestions
    # Convert duration to weeks for suggestions
    duration_weeks = (lambda: {
        'days': request.duration_value / 7,
        'weeks': request.duration_value,
        'months': request.duration_value * 4.33,
        'years': request.duration_value * 52
    }.get(request.duration_unit, request.duration_value))()
    
    if duration_weeks > 8:
        suggestions.append("Break down deliverables into phases with interim deadlines")
        suggestions.append("Include progress review meetings and milestone payments")
    elif duration_weeks > 4:
        suggestions.append("Set weekly check-ins to track progress")
    
    # Content type suggestions
    if "tiktok" in request.content_type:
        suggestions.append("Include platform-specific guidelines for TikTok content")
    if "youtube" in request.content_type:
        suggestions.append("Specify video quality requirements and format standards")
    if "instagram" in request.content_type:
        suggestions.append("Define hashtag usage and tagging requirements")
    
    # Exclusivity suggestions
    if request.exclusivity == "exclusive":
        suggestions.append("Clearly define exclusivity scope and duration")
        suggestions.append("Include compensation for exclusivity restrictions")
    
    # Compliance suggestions
    if len(request.compliance_requirements) > 2:
        suggestions.append("Consider legal review for complex compliance requirements")
    
    # Risk-based suggestions
    if risk_score > 0.7:
        suggestions.append("Consider adding performance bonds or insurance requirements")
        suggestions.append("Include detailed dispute resolution procedures")
    elif risk_score > 0.5:
        suggestions.append("Add regular progress reports and quality checkpoints")
    elif risk_score < 0.3:
        suggestions.append("Keep contract terms simple and straightforward")
    
    # Industry-specific suggestions
    if request.industry and request.industry.lower() in ["finance", "healthcare", "legal"]:
        suggestions.append("Include industry-specific compliance and disclosure requirements")
    
    # Ensure we have at least 3 suggestions
    while len(suggestions) < 3:
        suggestions.append("Consider adding performance metrics to track campaign success")
        if len(suggestions) >= 3:
            break
    
    return suggestions[:5]  # Limit to 5 suggestions

def calculate_budget(budget_range: str, content_types: List[str], duration_value: int, duration_unit: str) -> float:
    """Calculate budget based on requirements"""
    
    # Base rates per content type
    base_rates = {
        # YouTube content types
        "youtube_shorts": 300,
        "youtube_video": 1000,
        "youtube_live": 1500,
        # Instagram content types
        "instagram_post": 500,
        "instagram_reel": 600,
        "instagram_story": 300,
        "instagram_live": 800,
        # TikTok content types
        "tiktok_video": 400,
        "tiktok_live": 600,
        # Facebook content types
        "facebook_post": 450,
        "facebook_live": 700,
        # Twitter content types
        "twitter_post": 300,
        "twitter_space": 500,
        # LinkedIn content types
        "linkedin_post": 600,
        "linkedin_article": 800,
        # Other content types
        "blog_post": 800,
        "podcast": 1200,
        "newsletter": 400,
        # Legacy support
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
    
    # Convert duration to weeks for budget calculation
    duration_weeks = (lambda: {
        'days': duration_value / 7,
        'weeks': duration_value,
        'months': duration_value * 4.33,
        'years': duration_value * 52
    }.get(duration_unit, duration_value))()
    
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