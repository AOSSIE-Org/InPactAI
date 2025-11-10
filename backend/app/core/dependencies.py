"""
FastAPI dependencies for authentication and authorization
Used across all protected endpoints
"""

from typing import Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.core.security import jwt_handler
from app.core.supabase_clients import supabase_anon


# Security scheme for Swagger docs
security = HTTPBearer(
    scheme_name="JWT Bearer Token",
    description="Enter your Supabase JWT token"
)

# Optional security scheme for endpoints that work with or without auth
optional_security = HTTPBearer(
    scheme_name="JWT Bearer Token (Optional)",
    description="Enter your Supabase JWT token (optional)",
    auto_error=False
)


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security)
) -> dict:
    """
    Dependency to get current authenticated user from JWT token

    Usage:
        @app.get("/protected")
        async def protected_route(user = Depends(get_current_user)):
            return {"user_id": user["id"]}

    Returns:
        User profile dict with id, email, role

    Raises:
        HTTPException 401: If token is invalid or user not found
    """

    # Extract token from Bearer scheme
    token = credentials.credentials

    # Decode and validate token
    try:
        payload = jwt_handler.decode_token(token)
    except HTTPException as e:
        raise e

    # Get user ID from token
    user_id = payload.get('sub')

    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token: no user ID"
        )

    # Fetch user profile from database
    try:
        response = supabase_anon.table('profiles') \
            .select('*') \
            .eq('id', user_id) \
            .single() \
            .execute()

        if not response.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User profile not found"
            )

        user = response.data

        # Add token email if not in profile
        if 'email' not in user:
            user['email'] = payload.get('email')

        return user

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching user: {str(e)}"
        )


async def get_current_creator(
    current_user: dict = Depends(get_current_user)
) -> dict:
    """
    Dependency to verify user is a creator and get creator profile

    Usage:
        @app.get("/creator-only")
        async def creator_route(creator = Depends(get_current_creator)):
            return {"creator_id": creator["id"]}

    Returns:
        Creator profile dict

    Raises:
        HTTPException 403: If user is not a creator
    """

    if current_user.get('role') != 'Creator':
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This endpoint is only accessible to creators"
        )

    # Fetch creator profile
    try:
        response = supabase_anon.table('creators') \
            .select('*') \
            .eq('user_id', current_user['id']) \
            .single() \
            .execute()

        if not response.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Creator profile not found. Please complete onboarding."
            )

        return response.data
    except Exception as e:
        # Check if it's a "not found" error from Supabase
        if "PGRST116" in str(e) or "No rows" in str(e):
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Creator profile not found. Please complete onboarding."
            )
        # Re-raise other exceptions
        raise


async def get_current_brand(
    current_user: dict = Depends(get_current_user)
) -> dict:
    """
    Dependency to verify user is a brand and get brand profile

    Usage:
        @app.get("/brand-only")
        async def brand_route(brand = Depends(get_current_brand)):
            return {"brand_id": brand["id"]}

    Returns:
        Brand profile dict

    Raises:
        HTTPException 403: If user is not a brand
    """

    if current_user.get('role') != 'Brand':
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This endpoint is only accessible to brands"
        )

    # Fetch brand profile
    response = supabase_anon.table('brands') \
        .select('*') \
        .eq('user_id', current_user['id']) \
        .single() \
        .execute()

    if not response.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Brand profile not found. Please complete onboarding."
        )

    return response.data


async def get_optional_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(optional_security)
) -> Optional[dict]:
    """
    Dependency for endpoints that work with or without authentication

    Usage:
        @app.get("/public-but-personalized")
        async def route(user = Depends(get_optional_user)):
            if user:
                return {"message": f"Hello {user['name']}"}
            return {"message": "Hello guest"}

    Returns:
        User profile dict if authenticated, None otherwise
    """

    if not credentials:
        return None

    try:
        return await get_current_user(credentials)
    try:
        return await get_current_user(credentials)
    except HTTPException:
        return None

