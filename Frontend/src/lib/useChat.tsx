import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { useDispatch } from "react-redux";
import {
  addChats,
  addMessage,
  addOldMessages,
  Message,
  markChatAsSeen as reduxMarkChatAsSeen,
  updateUserDetails,
  markMessageAsSeen as reduxMarkMessageAsSeen,
  setSelectedChat,
} from "@/redux/chatSlice";
import { API_URL } from "@/lib/utils";
import axios from "axios";

interface ChatContextType {
  sendMessage: (receiverId: string, message: string) => void;
  isConnected: boolean;
  fetchChatList: () => Promise<void>;
  fetchChatMessages: (
    chatListId: string,
    lastFetched: number
  ) => Promise<boolean>;
  markChatAsSeen: (chatListId: string) => Promise<void>;
  fetchUserDetails: (targetUserId: string, chatListId: string) => Promise<void>;
  markMessageAsSeen: (chatListId: string, messageId: string) => Promise<void>;
  createChatWithMessage: (
    username: string,
    message: string
  ) => Promise<boolean>;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider: React.FC<{
  userId: string;
  children: React.ReactNode;
}> = ({ userId, children }) => {
  const ws = useRef<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const dispatch = useDispatch();

  useEffect(() => {
    if (!userId) return;

    const websocket = new WebSocket(
      `ws://${API_URL.replace(/^https?:\/\//, "")}/chat/ws/${userId}`
    );

    websocket.onopen = () => {
      console.log("WebSocket Connected");
      setIsConnected(true);
    };

    websocket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log("Message received:", data);

      if (
        data.eventType === "NEW_MESSAGE_RECEIVED" ||
        data.eventType === "NEW_MESSAGE_DELIVERED" ||
        data.eventType === "NEW_MESSAGE_SENT"
      ) {
        dispatch(
          addMessage({
            chatListId: data.chatListId,
            message: data,
          })
        );
      } else if (data.eventType === "CHAT_MESSAGES_READ") {
        dispatch(
          reduxMarkChatAsSeen({
            chatListId: data.chatListId,
          })
        );
      } else if (data.eventType === "MESSAGE_READ") {
        dispatch(
          reduxMarkMessageAsSeen({
            chatListId: data.chatListId,
            messageId: data.messageId,
          })
        );
      }
    };

    websocket.onclose = () => {
      console.log("WebSocket Disconnected");
      setIsConnected(false);
    };

    ws.current = websocket;

    return () => {
      if (ws.current) ws.current.close();
    };
  }, [userId, dispatch]);

  const sendMessage = (receiverId: string, message: string) => {
    if (ws.current && isConnected) {
      ws.current.send(
        JSON.stringify({
          event_type: "SEND_MESSAGE",
          receiver_id: receiverId,
          message: message,
        })
      );
    }
  };

  const fetchChatList = async () => {
    try {
      const response = await axios.get(`${API_URL}/chat/chat_list/${userId}`);
      dispatch(addChats(response.data));
    } catch (error) {
      console.error("Error fetching chat list:", error);
    }
  };

  const fetchChatMessages = async (chatListId: string, lastFetched: number) => {
    try {
      const response = await axios.get<Message[]>(
        `${API_URL}/chat/messages/${userId}/${chatListId}`,
        {
          params: {
            last_fetched: lastFetched,
          },
        }
      );
      dispatch(
        addOldMessages({
          chatListId: chatListId,
          messages: response.data,
        })
      );
      if (response.data.length === 0) return false;
      return true;
    } catch (error) {
      console.error("Error fetching chat messages:", error);
      return false;
    }
  };

  const markChatAsSeen = async (chatListId: string) => {
    try {
      await axios.put(API_URL + `/chat/read/${userId}/${chatListId}`);
    } catch (error) {
      console.error("Error marking chat as seen:", error);
    }
  };

  const fetchUserDetails = async (targetUserId: string, chatListId: string) => {
    try {
      const response = await axios.get(
        `${API_URL}/chat/user_name/${targetUserId}`
      );
      dispatch(
        updateUserDetails({
          chatListId: chatListId,
          username: response.data.username,
          profileImage: response.data.profileImage,
        })
      );
    } catch (error) {
      console.error("Error fetching username:", error);
    }
  };

  const markMessageAsSeen = async (chatListId: string, messageId: string) => {
    try {
      await axios.put(
        `${API_URL}/chat/read/${userId}/${chatListId}/${messageId}`
      );
    } catch (error) {
      console.error("Error marking message as seen:", error);
    }
  };

  const createChatWithMessage = async (username: string, message: string) => {
    try {
      const response = await axios.post(
        `${API_URL}/chat/new_chat/${userId}/${username}`,
        {
          message,
        }
      );
      const chatListId = response.data.chatListId;
      dispatch(setSelectedChat(chatListId));
      if (response.data.isChatListExists) {
        return false;
      }
      return true;
    } catch (error) {
      console.error("Error creating chat with message:", error);

      return false;
    }
  };

  return (
    <ChatContext.Provider
      value={{
        sendMessage,
        isConnected,
        fetchChatList,
        fetchChatMessages,
        markChatAsSeen,
        fetchUserDetails,
        markMessageAsSeen,
        createChatWithMessage,
      }}
    >
      {isConnected ? children : null}
    </ChatContext.Provider>
  );
};

export const useChat = (): ChatContextType => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
};
