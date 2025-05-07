import React, { use, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { API_URL } from "@/lib/utils";
import axios from "axios";
import {
  markChatAsDelivered,
  setSelectedChat,
  updateReceiverStatus,
} from "@/redux/chatSlice";
import { formatDistanceToNow } from "date-fns";
import { Button } from "../ui/button";
import CallStarter from "../video-calling/call-starter";

interface UserStatusResponse {
  isOnline: boolean;
  lastSeen?: string;
}

function formatLastSeen(lastSeen: string | null) {
  if (!lastSeen) return "";
  const date = new Date(lastSeen);
  return `Last seen: ${formatDistanceToNow(date, { addSuffix: true })}`;
}

export default function SelectedUserCard() {
  const selectedChatId = useSelector(
    (state: RootState) => state.chat.selectedChatId
  );
  const receiver = useSelector(
    (state: RootState) => state.chat.chats[state.chat.selectedChatId!].receiver
  );
  const dispatch = useDispatch();

  useEffect(() => {
    if (!selectedChatId) return;

    const fetchUserStatus = async () => {
      try {
        const response = await axios.get<UserStatusResponse>(
          `${API_URL}/chat/user_status/${receiver.id}`
        );
        dispatch(
          updateReceiverStatus({
            chatListId: selectedChatId,
            isOnline: response.data.isOnline,
            lastSeen: response.data.lastSeen,
          })
        );
      } catch (error) {
        console.error("Error fetching user status:", error);
      }
    };
    const interval = setInterval(() => {
      fetchUserStatus();
    }, 20000);
    fetchUserStatus();
    return () => {
      clearInterval(interval);
    };
  }, [selectedChatId, dispatch, receiver.id]);

  useEffect(() => {
    if (receiver.isOnline && selectedChatId) {
      dispatch(
        markChatAsDelivered({
          chatListId: selectedChatId,
        })
      );
    }
  }, [receiver.isOnline, selectedChatId]);

  return (
    <div className="flex items-center gap-3">
      <Avatar className="h-10 w-10">
        <AvatarImage src={receiver.profileImage} alt="pfp" />
        <AvatarFallback>{receiver.username!.charAt(0)}</AvatarFallback>
      </Avatar>
      <div>
        <h3 className="font-medium text-gray-900">{receiver.username}</h3>
        <p className="text-sm text-gray-500">
          {receiver.isOnline ? "Online" : formatLastSeen(receiver.lastSeen)}
        </p>
      </div>
      <CallStarter />
      <Button
        variant={"ghost"}
        size={"sm"}
        className="ml-auto cursor-pointer rounded-full"
        onClick={() => {
          dispatch(setSelectedChat(null));
        }}
      >
        X
      </Button>
    </div>
  );
}
