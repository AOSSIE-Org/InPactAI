from sqlalchemy import Column, String, ForeignKey, DateTime, Enum, UniqueConstraint
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from db.db import Base
import uuid
import enum


def generate_uuid():
    return str(uuid.uuid4())


class MessageStatus(enum.Enum):
    SENT = "sent"
    DELIVERED = "delivered"
    SEEN = "seen"


class ChatList(Base):
    __tablename__ = "chat_list"

    id = Column(String, primary_key=True, default=generate_uuid)
    user1_id = Column(String, ForeignKey("users.id"), nullable=False)
    user2_id = Column(String, ForeignKey("users.id"), nullable=False)
    last_message_time = Column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )

    user1 = relationship("User", foreign_keys=[user1_id], backref="chatlist_user1")
    user2 = relationship("User", foreign_keys=[user2_id], backref="chatlist_user2")

    __table_args__ = (UniqueConstraint("user1_id", "user2_id", name="unique_chat"),)


class ChatMessage(Base):
    __tablename__ = "chat_messages"

    id = Column(String, primary_key=True, default=generate_uuid)
    sender_id = Column(String, ForeignKey("users.id"), nullable=False)
    receiver_id = Column(String, ForeignKey("users.id"), nullable=False)
    message = Column(String, nullable=False)
    status = Column(
        Enum(MessageStatus), default=MessageStatus.SENT
    )  # Using the enum class
    created_at = Column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )

    sender = relationship("User", foreign_keys=[sender_id], backref="sent_messages")
    receiver = relationship(
        "User", foreign_keys=[receiver_id], backref="received_messages"
    )
    chat_list_id = Column(String, ForeignKey("chat_list.id"), nullable=False)
    chat = relationship("ChatList", backref="messages")
