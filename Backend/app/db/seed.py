from datetime import datetime, timezone
from app.db.db import AsyncSessionLocal
from app.models.models import User
from ..services.auth_service import hash_password # Import the hashing utility

async def seed_db():
    """
    Seeds the database with initial creator and brand users.
    Includes hashed passwords to satisfy database constraints.
    """
    users = [
        {
            "id": "aabb1fd8-ba93-4e8c-976e-35e5c40b809c",
            "username": "creator1",
            "email": "creator1@example.com",
            "password": "password123",
            "role": "creator",
            "bio": "Lifestyle and travel content creator",
            "profile_image": None,
            "created_at": datetime.now(timezone.utc) # Timezone-aware
        },
        {
            "id": "6dbfcdd5-795f-49c1-8f7a-a5538b8c6f6f",
            "username": "brand1",
            "email": "brand1@example.com",
            "password": "password123",
            "role": "brand",
            "bio": "Sustainable fashion brand looking for influencers",
            "profile_image": None,
            "created_at": datetime.now(timezone.utc) # Timezone-aware
        },
    ]

    async with AsyncSessionLocal() as session:
        for user_data in users:
            # Correct check for user existence
            existing_user = await session.get(User, user_data["id"])

            if existing_user:
                continue
            else:
                # Create new user with hashed_password
                user = User(
                    id=user_data["id"],
                    username=user_data["username"],
                    email=user_data["email"],
                    hashed_password=hash_password(user_data["password"]), # Fixes seed failure
                    role=user_data["role"],
                    profile_image=user_data["profile_image"],
                    bio=user_data["bio"],
                    created_at=user_data["created_at"]
                )
                session.add(user)
                print(f"Created user: {user_data['email']}")

        await session.commit()
        print("✅ Users seeded successfully.")