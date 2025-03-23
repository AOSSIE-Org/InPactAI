from datetime import datetime, timezone
from db.db import AsyncSessionLocal
from models.models import User


async def seed_db():
    users = [
        {
            "username": "creator1",
            "email": "creator1@example.com",
            "password": "password123",
            "role": "creator",
            "bio": "Lifestyle and travel content creator",
        },
        {
            "username": "brand1",
            "email": "brand1@example.com",
            "password": "password123",
            "role": "brand",
            "bio": "Sustainable fashion brand looking for influencers",
        },
    ]

    # Insert or update the users
    async with AsyncSessionLocal() as session:
        for user_data in users:
            # Check if user exists
            existing_user = await session.execute(
                User.__table__.select().where(User.email == user_data["email"])
            )
            existing_user = existing_user.scalar_one_or_none()

            if existing_user:
                continue
            else:
                # Create new user
                user = User(
                    username=user_data["username"],
                    email=user_data["email"],
                    password_hash=user_data[
                        "password"
                    ],  # Using plain password directly
                    role=user_data["role"],
                    bio=user_data["bio"],
                )
                session.add(user)
                print(f"Created user: {user_data['email']}")

        # Commit the session
        await session.commit()
        print("✅ Users seeded successfully.")
