from supabase import create_client, Client
from app.core.config import settings

# Initialize Supabase client with anon key (public)
supabase: Client = create_client(settings.supabase_url, settings.supabase_key)
