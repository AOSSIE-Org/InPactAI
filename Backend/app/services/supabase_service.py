import os
import asyncio
from typing import Optional, Dict, Any, List
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

class SupabaseService:
    def __init__(self):
        self.url: str = os.getenv("SUPABASE_URL")
        self.key: str = os.getenv("SUPABASE_KEY") 
        self.client: Optional[Client] = None
        self._connected = False
        
    async def connect(self) -> bool:
        """Initialize Supabase client"""
        try:
            if not self.url or not self.key:
                print("❌ Supabase URL or Key not configured")
                return False
                
            self.client = create_client(self.url, self.key)
            
            # Test connection with a simple health check
            # Just initialize the client - actual table checks will happen during table creation
            self._connected = True
            print("✅ Supabase REST API client initialized!")
            return True
            
        except Exception as e:
            print(f"❌ Supabase connection failed: {e}")
            return False
    
    async def create_tables(self) -> bool:
        """Check if tables exist or print instructions for manual creation"""
        if not self._connected:
            return False
            
        try:
            # Try to check if users table exists by querying it
            try:
                result = self.client.table('users').select('id').limit(1).execute()
                print("✅ Tables already exist in Supabase!")
                return True
            except Exception:
                # Tables don't exist, provide instructions
                print("⚠️ Tables don't exist yet in Supabase.")
                print("📋 Please create the following tables in your Supabase dashboard:")
                print()
                print("1. Users table:")
                print("   - Go to Supabase Dashboard > Table Editor")
                print("   - Create table 'users' with columns: id (uuid), username (text), email (text), role (text), bio (text), profile_image (text)")
                print()
                print("2. Posts table:")
                print("   - Create table 'posts' with columns: id (uuid), user_id (uuid), title (text), content (text), image_url (text)")
                print()
                print("3. Trending_niches table (for AI features):")
                print("   - Create table 'trending_niches' with columns: id (serial), name (text), insight (text), global_activity (int), fetched_at (date)")
                print()
                print("4. Or use the SQL Editor to run the table creation scripts")
                print()
                print("✅ Supabase client is ready - tables need manual creation")
                return True
                
        except Exception as e:
            print(f"⚠️ Supabase table check failed: {e}")
            return False
    
    async def seed_data(self) -> bool:
        """Seed initial data"""
        if not self._connected:
            return False
            
        try:
            # Check if users already exist
            existing_users = self.client.table('users').select('email').execute()
            
            if len(existing_users.data) > 0:
                print("✅ Database already has user data")
                return True
            
            # Insert seed users
            seed_users = [
                {
                    "username": "creator1",
                    "email": "creator1@example.com",
                    "role": "creator", 
                    "bio": "Lifestyle and travel content creator"
                },
                {
                    "username": "brand1",
                    "email": "brand1@example.com", 
                    "role": "brand",
                    "bio": "Sustainable fashion brand looking for influencers"
                }
            ]
            
            result = self.client.table('users').insert(seed_users).execute()
            print("✅ Seed data inserted successfully!")
            return True
            
        except Exception as e:
            print(f"⚠️ Data seeding failed: {e}")
            return False

# Global instance
supabase_service = SupabaseService()