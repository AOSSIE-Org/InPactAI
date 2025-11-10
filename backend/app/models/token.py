"""
Pydantic models for authentication tokens
"""

from pydantic import BaseModel
from typing import Optional


class Token(BaseModel):
    """JWT access token response"""
    access_token: str
    token_type: str = "bearer"
    expires_in: int  # seconds


class TokenData(BaseModel):
    """Decoded token data"""
    user_id: str
    email: Optional[str] = None
    role: Optional[str] = None


class TokenRefresh(BaseModel):
    """Token refresh request"""
    refresh_token: str

