from fastapi import WebSocket, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.sql import select
from datetime import datetime, timezone
from app.models.models import User
from app.models.chat import ChatList, ChatMessage, MessageStatus
from typing import Dict
from redis.asyncio import Redis
import logging
import json

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class ChatService:
    def __init__(self):
        self.active_connections: Dict[str, WebSocket] = {}

    async def connect(
        self,
        user_id: str,
        websocket: WebSocket,
        db: AsyncSession,
    ):
        """Accept WebSocket connection and update user status to online."""
        await websocket.accept()
        # Mark user as online
        user = await db.get(User, user_id)
        if user:
            self.active_connections[user_id] = websocket
            user.is_online = True
            await db.commit()

            query = select(ChatMessage).where(
                (ChatMessage.receiver_id == user_id)
                & (ChatMessage.status == MessageStatus.SENT)
            )
            messages = (await db.execute(query)).scalars().all()
            # mark as delivered
            for message in messages:
                message.status = MessageStatus.DELIVERED
            await db.commit()
        else:
            logger.warning(f"User {user_id} not found in the database.")
            await websocket.close()

    async def disconnect(self, user_id: str, redis: Redis, db: AsyncSession):
        """Remove connection and update last seen."""
        self.active_connections.pop(user_id, None)

        # Mark user as offline and update last seen
        user = await db.get(User, user_id)
        if user:
            user.is_online = False
            user.last_seen = datetime.now(timezone.utc)
            await db.commit()
            await redis.set(
                f"user:{user_id}:last_seen", user.last_seen.isoformat(), ex=600
            )

    def get_canonical_user_pair(self, user1_id: str, user2_id: str):
        """Return user IDs in canonical (sorted) order for chat_list."""
        return (user1_id, user2_id) if user1_id < user2_id else (user2_id, user1_id)

    async def send_message(
        self,
        sender_id: str,
        receiver_id: str,
        message_text: str,
        db: AsyncSession,
        redis: Redis,
    ):
        """Send a message to the receiver if they are online."""

        if not message_text:
            raise HTTPException(status_code=400, detail="Message text is required")
        if sender_id == receiver_id:
            raise HTTPException(
                status_code=400, detail="Cannot send message to yourself"
            )

        # Canonical ordering for chat_list
        user1_id, user2_id = self.get_canonical_user_pair(sender_id, receiver_id)

        # Find or create chat list
        chat_list = await db.execute(
            select(ChatList).where(
                (ChatList.user1_id == user1_id) & (ChatList.user2_id == user2_id)
            )
        )
        chat_list = chat_list.scalar_one_or_none()

        is_chat_list_exists = chat_list is not None

        if not chat_list:
            chat_list = ChatList(user1_id=user1_id, user2_id=user2_id)
            db.add(chat_list)
            await db.commit()

        # Store message in DB
        new_message = ChatMessage(
            sender_id=sender_id,
            receiver_id=receiver_id,
            chat_list_id=chat_list.id,
            message=message_text,
            status=MessageStatus.SENT,
        )
        db.add(new_message)
        await db.commit()

        # Update last message time
        chat_list.last_message_time = datetime.now(timezone.utc)
        await db.commit()

        receiver_channel = f"to_user:{receiver_id}"
        sender_channel = f"to_user:{sender_id}"

        # Send message to receiver if online
        if receiver_id in self.active_connections:
            new_message.status = MessageStatus.DELIVERED
            await db.commit()

            if sender_id in self.active_connections:
                await redis.publish(
                    sender_channel,
                    json.dumps(
                        {
                            "eventType": "NEW_MESSAGE_DELIVERED",
                            "chatListId": chat_list.id,
                            "id": new_message.id,
                            "message": message_text,
                            "createdAt": new_message.created_at.isoformat(),
                            "isSent": True,
                            "status": "delivered",
                            "senderId": sender_id,
                        }
                    ),
                )

            # Send message to receiver
            await redis.publish(
                receiver_channel,
                json.dumps(
                    {
                        "eventType": "NEW_MESSAGE_RECEIVED",
                        "chatListId": chat_list.id,
                        "id": new_message.id,
                        "message": message_text,
                        "createdAt": new_message.created_at.isoformat(),
                        "isSent": False,
                        "senderId": sender_id,
                    }
                ),
            )

        else:
            if sender_id in self.active_connections:
                # Send delivered message to sender
                await redis.publish(
                    sender_channel,
                    json.dumps(
                        {
                            "eventType": "NEW_MESSAGE_SENT",
                            "chatListId": chat_list.id,
                            "id": new_message.id,
                            "message": message_text,
                            "createdAt": new_message.created_at.isoformat(),
                            "isSent": True,
                            "status": "sent",
                            "senderId": receiver_id,
                        }
                    ),
                )

        # used in create_new_chat_message
        return {
            "chatListId": chat_list.id,
            "isChatListExists": is_chat_list_exists,
        }

    async def get_chat_history(
        self, user_id: str, chat_list_id: str, last_fetched: int, db: AsyncSession
    ):
        """Fetch chat history between two users."""
        limit = 20
        last_fetched_date = (
            datetime.fromtimestamp(last_fetched / 1000, tz=timezone.utc)
            if last_fetched
            else datetime.now(timezone.utc)
        )
        chat_list = await db.execute(
            select(ChatList).where(
                ((ChatList.user1_id == user_id) | (ChatList.user2_id == user_id))
                & (ChatList.id == chat_list_id)
            )
        )
        chat_list = chat_list.scalar_one_or_none()

        if not chat_list:
            raise HTTPException(status_code=404, detail="Chat not found")

        messages = await db.execute(
            select(ChatMessage)
            .where(
                ChatMessage.chat_list_id == chat_list.id,
                ChatMessage.created_at < last_fetched_date,
            )
            .order_by(ChatMessage.created_at.desc())
            .limit(limit)
        )
        messages = messages.scalars().all()
        # Format messages removing user IDs and adding isSent flag
        formatted_messages = []
        for message in messages:
            formatted_message = {
                "id": message.id,
                "message": message.message,
                "status": message.status.value,
                "createdAt": message.created_at.isoformat(),
                "isSent": message.sender_id == user_id,
            }
            formatted_messages.append(formatted_message)

        return formatted_messages

    async def mark_message_as_read(
        self,
        user_id: str,
        chat_list_id: str,
        message_id: str,
        db: AsyncSession,
        redis: Redis,
    ):
        """Mark a specific message as read and notify sender."""
        # Get the specific message
        message = await db.get(ChatMessage, message_id)

        if not message:
            raise HTTPException(status_code=404, detail="Message not found")

        # Verify the message belongs to the specified chat list and user is the receiver
        if message.chat_list_id != chat_list_id or message.receiver_id != user_id:
            raise HTTPException(
                status_code=403, detail="Not authorized to mark this message as read"
            )

        # Update message status
        if message.status != MessageStatus.SEEN:
            message.status = MessageStatus.SEEN
            await db.commit()

        # Notify sender if they're online
        if message.sender_id in self.active_connections:
            # Send message read notification to sender
            await redis.publish(
                f"to_user:{message.sender_id}",
                json.dumps(
                    {
                        "eventType": "MESSAGE_READ",
                        "chatListId": chat_list_id,
                        "messageId": message_id,
                    }
                ),
            )

        return True

    async def mark_chat_as_read(
        self, user_id: str, chat_list_id: str, db: AsyncSession, redis: Redis
    ):
        """Mark messages as read and notify sender."""
        result = await db.execute(
            select(ChatMessage).where(
                (
                    (ChatMessage.sender_id == user_id)
                    | (ChatMessage.receiver_id == user_id)
                )
                & (ChatMessage.chat_list_id == chat_list_id)
                & (ChatMessage.status != MessageStatus.SEEN)
            )
        )
        messages = result.scalars().all()

        for message in messages:
            if message.sender_id == user_id:
                message.status = MessageStatus.SEEN

        await db.commit()

        receiver_id = (
            (
                messages[0].receiver_id
                if messages[0].sender_id == user_id
                else messages[0].sender_id
            )
            if len(messages)
            else None
        )

        # Notify receiver
        if receiver_id and (receiver_id in self.active_connections):
            await redis.publish(
                f"to_user:{receiver_id}",
                json.dumps(
                    {
                        "eventType": "CHAT_MESSAGES_READ",
                        "chatListId": chat_list_id,
                    }
                ),
            )

        return {"message": "Messages marked as read"}

    async def get_user_status(
        self, target_user_id: str, redis: Redis, db: AsyncSession
    ):
        """Check if user is online. If not, send their last seen time."""
        is_online = target_user_id in self.active_connections
        if not is_online:
            last_seen = await redis.get(f"user:{target_user_id}:last_seen")
            if not last_seen:
                user = await db.get(User, target_user_id)
                if user:
                    last_seen = user.last_seen
                    await redis.set(
                        f"user:{target_user_id}:last_seen",
                        last_seen.isoformat(),
                        ex=600,
                    )
            return {
                "isOnline": False,
                "lastSeen": last_seen,
            }

        return {
            "isOnline": is_online,
        }

    async def get_user_chat_list(
        self, user_id: str, last_message_time: str | None, db: AsyncSession
    ):
        """Get all chat lists for a user."""
        limit = 20
        last_message_date = (
            datetime.fromisoformat(last_message_time)
            if last_message_time
            else datetime.now(timezone.utc)
        )
        chat_lists = await db.execute(
            select(ChatList)
            .where(
                ((ChatList.user1_id == user_id) | (ChatList.user2_id == user_id))
                & (ChatList.last_message_time < last_message_date)
            )
            .order_by(ChatList.last_message_time.desc())
            .limit(limit)
        )
        chat_lists = chat_lists.scalars().all()

        formatted_chat_lists = []
        for chat_list in chat_lists:
            receiver_id = (
                chat_list.user1_id
                if chat_list.user2_id == user_id
                else chat_list.user2_id
            )

            receiver = await db.get(User, receiver_id)
            if not receiver:
                continue
            formatted_chat_list = {
                "chatListId": chat_list.id,
                "lastMessageTime": chat_list.last_message_time.isoformat(),
                "receiver": {
                    "id": receiver.id,
                    "username": receiver.username,
                    "profileImage": receiver.profile_image,
                },
            }
            formatted_chat_lists.append(formatted_chat_list)
        return formatted_chat_lists

    async def get_user_name(self, user_id: str, db: AsyncSession):
        """Get the username of a user."""
        user = await db.get(User, user_id)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        return {
            "username": user.username,
            "profileImage": user.profile_image,
        }

    async def create_new_chat_message(
        self,
        user_id: str,
        username: str,
        message_text: str,
        db: AsyncSession,
        redis: Redis,
    ):
        """Create a new chat message."""
        if not message_text:
            raise HTTPException(status_code=400, detail="Message text is required")

        receiver = await db.execute(select(User).where(User.username == username))
        receiver = receiver.scalar_one_or_none()
        if not receiver:
            raise HTTPException(status_code=404, detail="Receiver not found")
        if receiver.id == user_id:
            raise HTTPException(
                status_code=400, detail="Cannot send message to yourself"
            )

        # Canonical ordering for chat_list
        user1_id, user2_id = self.get_canonical_user_pair(user_id, receiver.id)

        chat_list = await db.execute(
            select(ChatList).where(
                (ChatList.user1_id == user1_id) & (ChatList.user2_id == user2_id)
            )
        )
        chat_list = chat_list.scalar_one_or_none()
        if chat_list:
            return {
                "chatListId": chat_list.id,
                "isChatListExists": True,
            }

        return await self.send_message(user_id, receiver.id, message_text, db, redis)


chat_service = ChatService()
