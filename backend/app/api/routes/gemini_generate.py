import os
import httpx
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.core.config import settings







router = APIRouter()
GEMINI_API_KEY = settings.gemini_api_key
GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent"

class GenerateRequest(BaseModel):
    prompt: str

@router.post("/generate")
async def generate_content(request: GenerateRequest):
    if not GEMINI_API_KEY:
        raise HTTPException(status_code=500, detail="Gemini API is not configured. Please set GEMINI_API_KEY in environment.")
    payload = {
        "contents": [{"role": "user", "parts": [{"text": request.prompt}]}]
    }
    headers = {
        "Content-Type": "application/json",
    }
    params = {"key": GEMINI_API_KEY}
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(GEMINI_API_URL, json=payload, headers=headers, params=params)
        response.raise_for_status()
        return response.json()
    except httpx.RequestError as e:
        raise HTTPException(status_code=502, detail=f"Gemini API error: {str(e)}")
    except httpx.HTTPStatusError as e:
        raise HTTPException(status_code=502, detail=f"Gemini API error: {str(e)}")
