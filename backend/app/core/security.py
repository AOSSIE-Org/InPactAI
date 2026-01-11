"""
Security utilities for JWT authentication
Handles token validation, creation, and user verification
"""

from jose import jwt, JWTError
from fastapi import HTTPException, status
from typing import Optional, Dict, Any
from app.core.config import settings


class JWTHandler:
    """Handle Supabase JWT verification only"""

    def __init__(self):
        self.public_key = settings.SUPABASE_JWT_PUBLIC_KEY
        if not self.public_key:
            raise ValueError("SUPABASE_JWT_PUBLIC_KEY is not set")

        self.algorithm = "ES256"

    def decode_token(self, token: str) -> Dict[str, Any]:
        try:
            payload = jwt.decode(
                token,
                self.public_key,                 # ✅ PUBLIC KEY
                algorithms=[self.algorithm],
                audience="authenticated",        # Supabase default
            )

            if "sub" not in payload:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid token: missing user id",
                )

            return payload

        except JWTError as e:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=f"Invalid token: {str(e)}",
            )

    def verify_token(self, token: str) -> bool:
        try:
            jwt.decode(
                token,
                self.public_key,
                algorithms=[self.algorithm],
                audience="authenticated",
            )
            return True
        except JWTError:
            return False

    def get_user_id_from_token(self, token: str) -> str:
        return self.decode_token(token)["sub"]

    def get_user_email_from_token(self, token: str) -> Optional[str]:
        return self.decode_token(token).get("email")

    def get_user_role_from_token(self, token: str) -> Optional[str]:
        payload = self.decode_token(token)
        return (
            payload.get("user_metadata", {}).get("role")
            or payload.get("app_metadata", {}).get("role")
            or payload.get("role")
        )


jwt_handler = JWTHandler()



# Legacy functions for backward compatibility (optional - requires passlib)
def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against a hash (if needed for custom auth)"""
    try:
        from passlib.context import CryptContext
        pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
        return pwd_context.verify(plain_password, hashed_password)
    except ImportError:
        raise ImportError("passlib is required for password verification. Install with: pip install passlib[bcrypt]")


def get_password_hash(password: str) -> str:
    """Hash a password (if needed for custom auth)"""
    try:
        from passlib.context import CryptContext
        pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
        return pwd_context.hash(password)
    except ImportError:
        raise ImportError("passlib is required for password hashing. Install with: pip install passlib[bcrypt]")
