import os
import requests
from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel
from app.core.config import settings

router = APIRouter()

class GroqRequest(BaseModel):
    prompt: str
    model: str = "meta-llama/llama-4-scout-17b-16e-instruct"  # default, can be overridden
    max_tokens: int = 256
    temperature: float = 0.7

@router.post("/groq/generate")
async def generate_groq_response(data: GroqRequest, request: Request):
    api_key = settings.groq_api_key
    if not api_key:
        raise HTTPException(status_code=500, detail="GROQ API key not configured.")
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }
    payload = {
        "model": data.model,
        "messages": [
            {"role": "user", "content": data.prompt}
        ],
        "max_tokens": data.max_tokens,
        "temperature": data.temperature
    }
    try:
        response = requests.post(
            "https://api.groq.com/openai/v1/chat/completions",
            headers=headers,
            json=payload,
            timeout=30
        )
        response.raise_for_status()
        result = response.json()
        return {"result": result}
    except requests.RequestException as e:
        raise HTTPException(status_code=502, detail=f"GROQ API error: {str(e)}")
