from fastapi import WebSocket
from redis.asyncio import Redis
import json


async def listen_to_channel(user_id: str, websocket: WebSocket, redis_client: Redis):
    pubsub = redis_client.pubsub()
    await pubsub.subscribe(f"to_user:{user_id}")

    try:
        async for message in pubsub.listen():
            if message["type"] == "message":
                await websocket.send_json(json.loads(message["data"]))
    finally:
        await pubsub.unsubscribe(f"to_user:{user_id}")
        await pubsub.close()
