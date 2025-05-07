from fastapi import (
    APIRouter,
    WebSocket,
    Depends,
    WebSocketDisconnect,
    Request,
    HTTPException,
)
from sqlalchemy.ext.asyncio import AsyncSession
from db.db import get_db
from services.chat_services import chat_service
from redis.asyncio import Redis
from services.redis_client import get_redis
import asyncio
from services.chat_pubsub import listen_to_channel

router = APIRouter(prefix="/chat", tags=["Chat"])


@router.websocket("/ws/{user_id}")
async def websocket_endpoint(
    websocket: WebSocket,
    user_id: str,
    redis: Redis = Depends(get_redis),
    db: AsyncSession = Depends(get_db),
):
    await chat_service.connect(user_id, websocket, db)

    listener_task = asyncio.create_task(listen_to_channel(user_id, websocket, redis))

    try:
        while True:
            data = await websocket.receive_json()
            event_type = data.get("event_type", "")
            if event_type == "SEND_MESSAGE":
                receiver_id = data.get("receiver_id")
                sender_id = user_id
                message_text = data.get("message")
                await chat_service.send_message(
                    sender_id, receiver_id, message_text, db, redis
                )
            elif event_type in {
                "VIDEO_OFFER",
                "VIDEO_ANSWER",
                "ICE_CANDIDATE",
                "CALL_ENDED",
            }:
                receiver_id = data.get("receiver_id")
                payload = data.get("payload")
                await chat_service.send_video_signal(
                    user_id, receiver_id, event_type, payload, redis
                )

    except WebSocketDisconnect:
        listener_task.cancel()
        await chat_service.disconnect(user_id, redis, db)

    except Exception as e:
        listener_task.cancel()
        await chat_service.disconnect(user_id, redis, db)
        # Optionally log the error
        print(f"Error in websocket for user {user_id}: {e}")


@router.get("/user_name/{user_id}")
async def get_user_name(user_id: str, db: AsyncSession = Depends(get_db)):
    return await chat_service.get_user_name(user_id, db)


@router.get("/chat_list/{user_id}")
async def get_user_chat_list(
    user_id: str,
    last_message_time: str | None = None,
    db: AsyncSession = Depends(get_db),
):
    return await chat_service.get_user_chat_list(user_id, last_message_time, db)


@router.get("/user_status/{target_user_id}")
async def get_user_status(
    target_user_id: str,
    redis: Redis = Depends(get_redis),
    db: AsyncSession = Depends(get_db),
):
    return await chat_service.get_user_status(target_user_id, redis, db)


@router.get("/messages/{user_id}/{chat_list_id}")
async def get_chat_history(
    user_id: str,
    chat_list_id: str,
    last_fetched: int = 0,
    db: AsyncSession = Depends(get_db),
):
    return await chat_service.get_chat_history(user_id, chat_list_id, last_fetched, db)


@router.put("/read/{user_id}/{chat_list_id}/{message_id}")
async def mark_message_as_read(
    user_id: str,
    chat_list_id: str,
    message_id: str,
    db: AsyncSession = Depends(get_db),
    redis: Redis = Depends(get_redis),
):
    if not message_id:
        raise HTTPException(status_code=400, detail="message_id is required")

    return await chat_service.mark_message_as_read(
        user_id, chat_list_id, message_id, db, redis
    )


@router.put("/read/{user_id}/{chat_list_id}")
async def mark_chat_as_read(
    user_id: str,
    chat_list_id: str,
    db: AsyncSession = Depends(get_db),
    redis: Redis = Depends(get_redis),
):
    if not chat_list_id:
        raise HTTPException(status_code=400, detail="chat_list_id is required")

    return await chat_service.mark_chat_as_read(user_id, chat_list_id, db, redis)


@router.post("/new_chat/{user_id}/{username}")
async def create_new_chat_message(
    user_id: str,
    username: str,
    request: Request,
    db: AsyncSession = Depends(get_db),
    redis: Redis = Depends(get_redis),
):
    body = await request.json()
    message = body.get("message")
    return await chat_service.create_new_chat_message(
        user_id, username, message, db, redis
    )
