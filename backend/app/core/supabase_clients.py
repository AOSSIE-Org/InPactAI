"""
Supabase client instances for different use cases:
- supabase_anon: For user-facing operations (anon key)
- supabase_admin: For server-side atomic operations (service role)
"""

from supabase import create_client
from app.core.config import settings

# Client for user-facing operations (anon key)
supabase_anon = create_client(settings.supabase_url, settings.supabase_key)

# Admin client for server-side atomic operations (service role)
supabase_admin = create_client(settings.supabase_url, settings.supabase_service_key)
