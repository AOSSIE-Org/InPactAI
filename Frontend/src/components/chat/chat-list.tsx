"use client";
import { useEffect, useState } from "react";
import { Input } from "../ui/input";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { Chat, setSelectedChat } from "@/redux/chatSlice";

import { useChat } from "@/lib/useChat";
import ChatItem from "./chat-item";
import { CreateNewChat } from "./create-new-chat";
import ChatSearch from "./chat-search";

export default function ChatList() {
  const chats = useSelector((state: RootState) => state.chat.chats);
  const [sortedChatList, setSortedChatList] = useState<Chat[]>([]);
  const dispatch = useDispatch();
  const { fetchChatList } = useChat();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetchChatList().finally(() => {
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    const sortedList = Object.values(chats).sort((a, b) => {
      return (
        new Date(b.lastMessageTime).getTime() -
        new Date(a.lastMessageTime).getTime()
      );
    });
    setSortedChatList(sortedList);
  }, [chats]);

  const handleChatClick = (chatId: string) => {
    dispatch(setSelectedChat(chatId));
  };

  return (
    <div className="col-span-4 bg-white rounded-lg h-[calc(100vh-289px)] border border-gray-300 dark:bg-nightS dark:text-nightTS dark:border-nightP ml-4">
      <div className="p-4 border-neutral-200 flex items-center gap-2">
        <ChatSearch />
        <CreateNewChat />
      </div>
      <div className="overflow-y-auto h-[calc(100%-60px)] dark:bg-nightS dark:text-nightTS">
        {loading && (
          <div className="flex justify-center py-2  dark:bg-nightS dark:text-nightTS">
            <div className="text-gray-500 dark:text-nightTP">Loading chats...</div>
          </div>
        )}
        {!loading && sortedChatList.length === 0 && (
          <div className="flex justify-center py-2 dark:bg-nightS dark:text-nightTS">
            <div className="text-gray-500 dark:text-nightTP">No chats available</div>
          </div>
        )}
        {sortedChatList.map((chat) => (
          <ChatItem
            chat={chat}
            handleChatClick={handleChatClick}
            key={chat.id}
          />
        ))}
      </div>
    </div>
  );
}
