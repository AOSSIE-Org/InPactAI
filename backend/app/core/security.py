"""
Security utilities for JWT authentication
Handles token validation, creation, and user verification
"""

import jwt
from datetime import datetime, timedelta
from typing import Optional, Dict, Any
from fastapi import HTTPException, status
from app.core.config import settings


class JWTHandler:
    """Handle all JWT operations with Supabase tokens"""

    def __init__(self):
        try:
            self.secret_key = settings.SUPABASE_JWT_SECRET
            if not self.secret_key:
                raise ValueError("SUPABASE_JWT_SECRET is not set in environment variables")
        except Exception as e:
            raise ValueError(f"Failed to load JWT secret: {str(e)}. Please set SUPABASE_JWT_SECRET in your .env file.")
        self.algorithm = "HS256"  # Supabase uses HS256 for legacy keys

    def decode_token(self, token: str) -> Dict[str, Any]:
        """
        Decode and validate JWT token from Supabase

        Args:
            token: JWT token string (without 'Bearer ' prefix)

        Returns:
            Decoded payload with user information

        Raises:
            HTTPException: If token is invalid or expired
        """
        try:
            # Decode JWT using Supabase secret
            # Note: We don't verify audience as Supabase tokens may have different audience claims
            # The signature verification is sufficient for security
            payload = jwt.decode(
                token,
                self.secret_key,
                algorithms=[self.algorithm],
                options={
                    "verify_signature": True,
                    "verify_exp": True,
                    "verify_iat": True,
                    "verify_aud": False  # Disable audience verification for Supabase tokens
                }
            )

            # Validate required fields
            if 'sub' not in payload:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid token: missing user ID"
                )

            return payload

        except jwt.ExpiredSignatureError:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token has expired"
            )

        except jwt.InvalidTokenError as e:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=f"Invalid token: {str(e)}"
            )

    def verify_token(self, token: str) -> bool:
        """
        Quick token validation without full decode

        Args:
            token: JWT token string

        Returns:
            True if valid, False otherwise
        """
        try:
            jwt.decode(
                token,
                self.secret_key,
                algorithms=[self.algorithm],
                options={
                    "verify_signature": True,
                    "verify_exp": True,
                    "verify_aud": False  # Disable audience verification
                }
            )
            return True
        except:
            return False

    def get_user_id_from_token(self, token: str) -> str:
        """
        Extract user ID from token

        Args:
            token: JWT token string

        Returns:
            User UUID as string
        """
        payload = self.decode_token(token)
        return payload['sub']

    def get_user_email_from_token(self, token: str) -> Optional[str]:
        """
        Extract user email from token

        Args:
            token: JWT token string

        Returns:
            User email if present in token
        """
        payload = self.decode_token(token)
        return payload.get('email')

    def get_user_role_from_token(self, token: str) -> Optional[str]:
        """
        Extract user role from token metadata

        Args:
            token: JWT token string

        Returns:
            User role (creator/brand) if present
        """
        payload = self.decode_token(token)

        # Supabase stores custom claims in user_metadata or app_metadata
        user_metadata = payload.get('user_metadata', {})
        app_metadata = payload.get('app_metadata', {})

        return (
            user_metadata.get('role') or
            app_metadata.get('role') or
            payload.get('role')
        )


# Singleton instance
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

