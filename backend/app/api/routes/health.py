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
        response = supabase.table("_supabase_test").select("*").limit(1).execute()

        return {
            "connected": True,
            "message": "Supabase connection is working!",
            "status": "healthy"
        }
    except Exception as e:
        error_msg = str(e)
        # Detect table-not-found error (Supabase/PostgREST or DB error)
        if (
            "does not exist" in error_msg or
            "relation" in error_msg and "does not exist" in error_msg or
            "Could not find the table" in error_msg or
            "PGRST205" in error_msg
        ):
            return {
                "connected": True,
                "message": "Supabase client initialized (no tables queried yet)",
                "status": "ready",
                "note": error_msg
            }
        # For any other error, treat as unhealthy
        return {
            "connected": False,
            "message": "Supabase connection failed",
            "status": "unhealthy",
            "note": error_msg
        }
