import { Chat } from "@/redux/chatSlice";
import React, { useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { cn } from "@/lib/utils";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { useChat } from "@/lib/useChat";
import { formatDistanceToNow } from "date-fns";

function formatChatDate(lastSeen: string | null) {
  if (!lastSeen) return "";
  const date = new Date(lastSeen);
  return formatDistanceToNow(date, { addSuffix: true });
}

export default function ChatItem({
  chat,
  handleChatClick,
}: {
  chat: Chat;
  handleChatClick: (chatId: string) => void;
}) {
  const selectedChatId = useSelector(
    (state: RootState) => state.chat.selectedChatId
  );

  const lastMessage = useSelector((state: RootState) =>
    chat.messageIds.length
      ? state.chat.messages[chat.messageIds[chat.messageIds.length - 1]].message
      : null
  );

  const { fetchUserDetails } = useChat();

  useEffect(() => {
    if (!chat.receiver.username) {
      fetchUserDetails(chat.receiver.id, chat.id);
    }
  }, [chat.receiver.username]);

  if (!chat.receiver.username) return null;

  return (
    <div
      className={`p-4 border-neutral-200 hover:bg-gray-50 cursor-pointer ${
        chat.id === selectedChatId ? "bg-purple-100" : ""
      }`}
      onClick={() => handleChatClick(chat.id)}
    >
      <div className={cn("flex items-center gap-3")}>
        <Avatar className="h-10 w-10">
          <AvatarImage
            src={chat.receiver.profileImage}
            alt={chat.receiver.username}
          />
          <AvatarFallback>{chat.receiver.username?.[0] || "U"}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="flex justify-between items-start">
            <h3 className="font-medium text-gray-900">
              {chat.receiver.username}
            </h3>
            <span className="text-xs text-gray-500">
              {formatChatDate(chat.lastMessageTime)}
            </span>
          </div>
          <p className="text-sm text-gray-500 truncate">{lastMessage}</p>
        </div>
      </div>
    </div>
  );
}
