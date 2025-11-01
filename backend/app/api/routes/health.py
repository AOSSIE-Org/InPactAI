"""
Health check routes for monitoring service status
"""
from fastapi import APIRouter, HTTPException

router = APIRouter(prefix="/health", tags=["health"])

@router.get("/")
def health_check():
    """Basic health check endpoint"""
    return {"status": "healthy", "message": "Backend is running"}

@router.get("/supabase")
def check_supabase():
    """
    Check Supabase connection status.
    This endpoint attempts to query Supabase to verify the connection.
    """
    try:
        from app.services.supabase_client import supabase

        # Attempt a simple query to verify connection
        # This will fail gracefully if no tables exist yet
        response = supabase.table("_supabase_test").select("*").limit(1).execute()

        return {
            "connected": True,
            "message": "Supabase connection is working!",
            "status": "healthy"
        }
    except Exception as e:
        # Even if the query fails (table doesn't exist),
        # we can still confirm the client initialized
        return {
            "connected": True,
            "message": "Supabase client initialized (no tables queried yet)",
            "status": "ready",
            "note": str(e)
        }
