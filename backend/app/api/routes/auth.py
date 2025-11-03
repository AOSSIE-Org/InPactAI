from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr, constr
from supabase import create_client, Client
from app.core.config import settings

router = APIRouter()
# Use Supabase Service Role Key for admin operations (never expose to frontend)
supabase: Client = create_client(settings.supabase_url, settings.supabase_service_key)

class SignupRequest(BaseModel):
    name: constr(min_length=2)
    email: EmailStr
    password: constr(min_length=8)
    role: constr(pattern="^(Creator|Brand)$")

class SignupResponse(BaseModel):
    message: str
    user_id: str | None = None

@router.post("/api/auth/signup", response_model=SignupResponse)
async def signup_user(payload: SignupRequest):
    """
    Atomic signup: creates Supabase Auth user and profile row together.
    If profile creation fails, deletes the auth user to avoid orphaned accounts.
    Uses Supabase service role key for admin access.
    """
    try:
        # 1. Create user via Supabase Auth admin API
        user_resp = supabase.auth.admin.create_user({
            "email": payload.email,
            "password": payload.password,
            "email_confirm": True
        })
        user = user_resp.user
        if not user or not user.id:
            raise HTTPException(status_code=500, detail="Failed to create auth user.")

        # 2. Insert profile row
        profile = {
            "id": user.id,
            "name": payload.name,
            "role": payload.role,
            "created_at": None  # Let Supabase set default timestamp
        }
        res = supabase.table("profiles").insert(profile).execute()
        if not res.data:
            # 3. Rollback: delete auth user if profile insert fails
            supabase.auth.admin.delete_user(user.id)
            raise HTTPException(status_code=500, detail="Failed to create profile. User rolled back.")

        return SignupResponse(message="Signup successful. Please log in.", user_id=user.id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Signup failed: {str(e)}")
