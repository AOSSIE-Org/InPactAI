from datetime import datetime
from app.db.db import AsyncSessionLocal, is_database_connected
from app.models.models import User
import logging

logger = logging.getLogger(__name__)


async def seed_db():
    """Seed database with initial data - handles errors gracefully"""
    
    # Check if database is connected
    if not is_database_connected() or not AsyncSessionLocal:
        logger.warning("⚠️ Skipping database seeding - database not connected")
        return
    
    users = [
        {
            "id": "aabb1fd8-ba93-4e8c-976e-35e5c40b809c",
            "username": "creator1",
            "email": "creator1@example.com",
            "password": "password123",
            "role": "creator",
            "bio": "Lifestyle and travel content creator",
            "profile_image": None,
            "created_at": datetime.utcnow()
        },
        {
            "id": "6dbfcdd5-795f-49c1-8f7a-a5538b8c6f6f",
            "username": "brand1",
            "email": "brand1@example.com",
            "password": "password123",
            "role": "brand",
            "bio": "Sustainable fashion brand looking for influencers",
            "profile_image": None,
            "created_at": datetime.utcnow()
        },
    ]

    try:
        # Insert or update the users
        async with AsyncSessionLocal() as session:
            for user_data in users:
                try:
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
                            id=user_data["id"],
                            username=user_data["username"],
                            email=user_data["email"],
                            role=user_data["role"],
                            profile_image=user_data["profile_image"],
                            bio=user_data["bio"],
                            created_at=user_data["created_at"]
                        )
                        session.add(user)
                        logger.info(f"Created user: {user_data['email']}")
                except Exception as e:
                    logger.error(f"Failed to seed user {user_data.get('email')}: {e}")
                    continue

            # Commit the session
            await session.commit()
            logger.info("✅ Users seeded successfully")
    except Exception as e:
        logger.error(f"❌ Database seeding failed: {e}")
        # Don't re-raise - seeding failure shouldn't crash the server
