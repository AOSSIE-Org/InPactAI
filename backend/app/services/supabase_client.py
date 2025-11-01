"""
Supabase client initialization for backend services.
Uses service role key for admin-level operations.
"""
from supabase import create_client, Client
from app.core.config import settings

# Initialize Supabase client with service role key
supabase: Client = create_client(settings.supabase_url, settings.supabase_service_key)
