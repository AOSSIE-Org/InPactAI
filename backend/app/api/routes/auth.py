from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr, constr,Field

from supabase import create_client, Client
from app.core.config import settings

router = APIRouter()
# Use anon key for end-user auth flows and service role for admin ops
supabase_public: Client = create_client(settings.supabase_url, settings.supabase_key)
supabase_admin: Client = create_client(settings.supabase_url, settings.supabase_service_key)


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
    user_id: str | None = None


@router.post("/api/auth/signup", response_model=SignupResponse)
async def signup_user(payload: SignupRequest):
    """
    Atomic signup: creates Supabase Auth user and profile row together.
    Supabase sends verification email automatically. If profile creation fails, user is not rolled back (no admin access).
    """
    try:
        # 1. Create user via Supabase Auth (sends verification email automatically)
        auth_resp = supabase_public.auth.sign_up({
            "email": payload.email,
            "password": payload.password
        })
        user = getattr(auth_resp, "user", None)
        if not user or not getattr(user, "id", None):
            error_msg = getattr(auth_resp, "error", None)
            raise HTTPException(status_code=400, detail=f"Failed to create auth user. {error_msg}")

        # 2. Insert profile row
        profile = {
            "id": user.id,
            "name": payload.name,
            "role": payload.role
        }
        res = supabase_admin.table("profiles").insert(profile).execute()
        if not res.data:
            # 3. Rollback: delete auth user if profile insert fails
            rollback_error = None
            for attempt in range(2):  # try up to 2 times
                try:
                    supabase_admin.auth.admin.delete_user(user.id)
                    break
                except Exception as rollback_err:
                    rollback_error = rollback_err
                    if attempt == 0:
                        continue  # retry once
            if rollback_error:
                # Log the orphaned user for manual cleanup
                # logger.error(f"Failed to rollback user {user.id}: {rollback_error}")
                raise HTTPException(
                    status_code=500,
                    detail=f"Failed to create profile and rollback failed. User {user.id} may be orphaned. Error: {rollback_error}"
                ) from rollback_error
            raise HTTPException(status_code=500, detail="Failed to create profile. User rolled back.")

        return SignupResponse(message="Signup successful! Please check your inbox to verify your email.", user_id=user.id)
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
    user_id: str | None = None
    email: str | None = None
    role: str | None = None
    name: str | None = None

@router.post("/api/auth/login", response_model=LoginResponse)
async def login_user(payload: LoginRequest):
    """
    Login route: authenticates user and enforces email verification.
    If email is not verified, returns 403 with a helpful message.
    Includes user profile info in response.
    """
    try:
        # 1. Authenticate user
        auth_resp = supabase_public.auth.sign_in_with_password({
            "email": payload.email,
            "password": payload.password
        })
        user = getattr(auth_resp, "user", None)
        error = getattr(auth_resp, "error", None)
        if error:
            error_msg = str(error)
            if "Email not confirmed" in error_msg:
                raise HTTPException(status_code=403, detail="Please verify your email before logging in.")
            raise HTTPException(status_code=401, detail=error_msg)
        if not user or not getattr(user, "id", None):
            raise HTTPException(status_code=401, detail="Invalid credentials.")

        # 2. Fetch user profile
        profile_res = supabase_admin.table("profiles").select("id, name, role").eq("id", user.id).single().execute()
        profile = profile_res.data if hasattr(profile_res, "data") else None
        if not profile:
            raise HTTPException(status_code=404, detail="User profile not found.")

        return LoginResponse(
            message="Login successful.",
            user_id=user.id,
            email=user.email,
            role=profile.get("role"),
            name=profile.get("name")
        )
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Login failed: {str(e)}")
