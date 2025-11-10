"""
Test script to verify JWT authentication
Run: python test_jwt.py
"""

import requests
import os
from dotenv import load_dotenv

load_dotenv()

# Configuration
API_URL = "http://localhost:8000"
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_ANON_KEY = os.getenv("SUPABASE_KEY")

# Test user credentials (update with your test account)
TEST_EMAIL = "test@example.com"
TEST_PASSWORD = "Test123!@#"


def get_jwt_token():
    """Login and get JWT token from Supabase"""

    # Using Supabase Auth API directly
    response = requests.post(
        f"{SUPABASE_URL}/auth/v1/token?grant_type=password",
        headers={
            "apikey": SUPABASE_ANON_KEY,
            "Content-Type": "application/json"
        },
        json={
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        }
    )

    if response.status_code != 200:
        print(f"Login failed: {response.text}")
        return None

    data = response.json()
    return data.get("access_token")


def test_protected_endpoint(token):
    """Test accessing protected endpoint with JWT"""

    response = requests.get(
        f"{API_URL}/campaigns",
        headers={
            "Authorization": f"Bearer {token}"
        }
    )

    print(f"Status: {response.status_code}")
    print(f"Response: {response.json()}")

    return response.status_code == 200


def test_invalid_token():
    """Test with invalid token (should fail)"""

    response = requests.get(
        f"{API_URL}/campaigns",
        headers={
            "Authorization": "Bearer invalid_token_here"
        },
        timeout=10
    )

    print(f"Invalid token status: {response.status_code}")
    print(f"Error message: {response.json()}")

    return response.status_code == 401


if __name__ == "__main__":
    print("=== JWT Authentication Test ===\n")

    # Test 1: Get JWT token
    print("1. Getting JWT token...")
    token = get_jwt_token()

    if not token:
        print("❌ Failed to get JWT token")
        exit(1)

    print(f"✅ Got JWT token: {token[:50]}...\n")

    # Test 2: Access protected endpoint
    print("2. Testing protected endpoint with valid token...")
    if test_protected_endpoint(token):
        print("✅ Successfully accessed protected endpoint\n")
    else:
        print("❌ Failed to access protected endpoint\n")

    # Test 3: Test invalid token
    print("3. Testing with invalid token (should fail)...")
    if test_invalid_token():
        print("✅ Correctly rejected invalid token\n")
    else:
        print("❌ Invalid token was accepted (security issue!)\n")

    print("=== Tests Complete ===")

