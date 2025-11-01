
from supabase import create_client, Client
from app.core.config import settings

# Initialize Supabase client with role key
supabase: Client = create_client(settings.supabase_url, settings.supabase_key)
