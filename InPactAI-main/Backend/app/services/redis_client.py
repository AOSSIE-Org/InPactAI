import redis.asyncio as redis

redis_client = redis.Redis(host="localhost", port=6379, decode_responses=True)


async def get_redis():
    return redis_client
