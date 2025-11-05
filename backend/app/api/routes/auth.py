from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr, Field
from gotrue.errors import AuthApiError
from typing import Optional

from app.core.supabase_clients import supabase_anon, supabase_admin

router = APIRouter()


class SignupRequest(BaseModel):
    """
    Request schema for user signup.
    """
    name: str = Field(..., min_length=2)
    email: EmailStr
    password: str = Field(..., min_length=8)
    role: str = Field(..., pattern="^(Creator|Brand)$")


class SignupResponse(BaseModel):
    """
    Response schema for user signup.
    """
    message: str
    user_id: Optional[str] = None


@router.post("/api/auth/signup", response_model=SignupResponse)
async def signup_user(payload: SignupRequest):
    """
    Atomic signup using Supabase Admin API:
    1. Create auth user via admin.create_user()
    2. Insert profile row with id = created user id
    3. If profile insert fails -> delete auth user (rollback)
    """
    try:
        # 1. Create auth user using admin API (atomic)
        try:
            create_res = supabase_admin.auth.admin.create_user({
                "email": payload.email,
                "password": payload.password,
                # Don't auto-confirm for production (requires email verification)
                "email_confirm": False
            })
        except AuthApiError as e:
            status = 409 if getattr(e, "code", None) == "user_already_exists" else getattr(e, "status", 400) or 400
            raise HTTPException(status_code=status, detail=str(e)) from e
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Admin create_user failed: {str(e)}") from e

        # Handle different response shapes from supabase-py
        user = None
        if hasattr(create_res, "user"):
            user = create_res.user
        elif hasattr(create_res, "data") and create_res.data:
            if hasattr(create_res.data, "user"):
                user = create_res.data.user
            elif isinstance(create_res.data, dict) and "user" in create_res.data:
                user = create_res.data["user"]
        elif isinstance(create_res, dict):
            user = create_res.get("user") or create_res.get("data", {}).get("user")

        if not user:
            raise HTTPException(status_code=500, detail="Failed to create auth user (admin API).")

        user_id = getattr(user, "id", None) or (user.get("id") if hasattr(user, "get") else None)
        if not user_id:
            raise HTTPException(status_code=500, detail="Auth user created but no id returned.")


        # 2. Insert profile row (with rollback on any failure)
        profile = {
            "id": user_id,
            "name": payload.name,
            "role": payload.role
        }
        try:
            res = supabase_admin.table("profiles").insert(profile).execute()
            insert_data = getattr(res, "data", None)
            if not insert_data:
                raise Exception("No data returned from profile insert.")
        except Exception as insert_exc:
            # Always attempt rollback if insert fails
            try:
                supabase_admin.auth.admin.delete_user(user_id)
            except Exception as rollback_err:
                raise HTTPException(
                    status_code=500,
                    detail=f"Profile insert failed and rollback deletion failed for user {user_id}: {rollback_err}"
                ) from rollback_err
            raise HTTPException(
                status_code=500,
                detail=f"Failed to create profile. Auth user removed for safety. Reason: {insert_exc}"
            ) from insert_exc

        return SignupResponse(
            message="Signup successful! Please check your inbox to verify your email.",
            user_id=user_id
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Signup failed: {str(e)}") from e

# ------------------- LOGIN ROUTE -------------------
class LoginRequest(BaseModel):
    """
    Request schema for user login.
    """
    email: EmailStr
    password: str = Field(..., min_length=8)

class LoginResponse(BaseModel):
    """
    Response schema for user login.
    """
    message: str
    user_id: Optional[str] = None
    email: Optional[str] = None
    role: Optional[str] = None
    name: Optional[str] = None
    onboarding_completed: bool = False

@router.post("/api/auth/login", response_model=LoginResponse)
async def login_user(payload: LoginRequest):
    """
    Login route: authenticates user and enforces email verification.
    If email is not verified, returns 403 with a helpful message.
    Includes user profile info in response.
    """
    try:
        # 1. Authenticate user
        try:
            auth_resp = supabase_anon.auth.sign_in_with_password({
                "email": payload.email,
                "password": payload.password
            })
            user = getattr(auth_resp, "user", None)
        except Exception as e:
            # Supabase Python SDK v2 raises exceptions for auth errors
            if hasattr(e, "code") and e.code == "email_not_confirmed":
                raise HTTPException(status_code=403, detail="Please verify your email before logging in.")
            raise HTTPException(status_code=401, detail=str(e))
        if not user or not getattr(user, "id", None):
            raise HTTPException(status_code=401, detail="Invalid credentials.")

        # 2. Fetch user profile
        profile_res = supabase_admin.table("profiles").select("id, name, role, onboarding_completed").eq("id", user.id).single().execute()
        profile = profile_res.data if hasattr(profile_res, "data") else None
        if not profile:
            raise HTTPException(status_code=404, detail="User profile not found.")

        return LoginResponse(
            message="Login successful.",
            user_id=user.id,
            email=user.email,
            role=profile.get("role"),
            name=profile.get("name"),
            onboarding_completed=profile.get("onboarding_completed", False)
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Login failed: {str(e)}") from e
