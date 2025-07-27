import redis.asyncio as redis
import os
import json

REDIS_HOST = os.getenv("REDIS_HOST", "your-redis-cloud-host")
REDIS_PORT = int(os.getenv("REDIS_PORT", 12345))  # replace with your port
REDIS_PASSWORD = os.getenv("REDIS_PASSWORD", "your-redis-cloud-password")

redis_client = redis.Redis(
    host=REDIS_HOST,
    port=REDIS_PORT,
    password=REDIS_PASSWORD,
    decode_responses=True,
    ssl=False  # Redis Cloud connection works without SSL
)

SESSION_TTL = 1800  # 30 minutes

async def get_session_state(session_id: str):
    state = await redis_client.get(f"session:{session_id}")
    return json.loads(state) if state else {}

async def save_session_state(session_id: str, state: dict):
    await redis_client.set(f"session:{session_id}", json.dumps(state), ex=SESSION_TTL)


async def get_redis():
    return redis_client
