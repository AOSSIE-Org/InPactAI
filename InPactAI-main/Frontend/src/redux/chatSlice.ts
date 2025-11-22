import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { NewMessageResponse } from "@/types/chat";

// Define the shape of a message
export interface Message {
  id: string;
  chatListId: string;
  isSent: boolean;
  createdAt: string;
  message: string;
  status?: "sent" | "delivered" | "seen";
}

// Define the shape of a receiver
interface Receiver {
  id: string;
  username?: string;
  profileImage?: string;
  isOnline: boolean;
  lastSeen: string | null;
}

// Define the shape of a chat
export interface Chat {
  id: string;
  receiver: Receiver;
  messageIds: string[]; // Array of message IDs
  lastMessageTime: string;
}

// Define the shape of the chat state
interface ChatState {
  chats: { [chatListId: string]: Chat }; // Normalized chats
  messages: { [message_id: string]: Message }; // Normalized messages
  selectedChatId: string | null; // Currently selected chat
}

// Initial state
const initialState: ChatState = {
  chats: {},
  messages: {},
  selectedChatId: null,
};

// Create the chat slice
const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    // Add a new chat
    addChat: (
      state,
      action: PayloadAction<{
        chatListId: string;
        lastMessageTime: string;
        receiver: Receiver;
      }>
    ) => {
      const { chatListId, receiver, lastMessageTime } = action.payload;
      if (!state.chats[chatListId]) {
        state.chats[chatListId] = {
          id: chatListId,
          receiver,
          messageIds: [],
          lastMessageTime: new Date(lastMessageTime).toISOString(),
        };
      }
    },

    addChats: (
      state,
      action: PayloadAction<
        { chatListId: string; lastMessageTime: string; receiver: Receiver }[]
      >
    ) => {
      action.payload.forEach(({ chatListId, lastMessageTime, receiver }) => {
        if (!state.chats[chatListId]) {
          state.chats[chatListId] = {
            id: chatListId,
            receiver,
            messageIds: [],
            lastMessageTime: new Date(lastMessageTime).toISOString(),
          };
        }
      });
    },

    // Add a message to a chat
    addMessage: (
      state,
      action: PayloadAction<{ chatListId: string; message: NewMessageResponse }>
    ) => {
      const { chatListId, message } = action.payload;

      const newMessage: Message = {
        id: message.id,
        chatListId: chatListId,
        isSent: message.isSent,
        createdAt: new Date(message.createdAt).toISOString(),
        message: message.message,
        status: message.status,
      };

      // Add the message to the normalized messages
      state.messages[newMessage.id] = newMessage;

      // Add the message ID to the chat's messageIds array
      if (state.chats[chatListId]) {
        state.chats[chatListId].messageIds.push(message.id);
        state.chats[chatListId].lastMessageTime = newMessage.createdAt;
      } else {
        // If the chat doesn't exist, create it
        state.chats[chatListId] = {
          id: chatListId,
          receiver: {
            id: message.senderId || "",
            isOnline: false,
            lastSeen: null,
          },
          messageIds: [message.id],
          lastMessageTime: newMessage.createdAt,
        };
      }
    },

    // Update receiver status
    updateReceiverStatus: (
      state,
      action: PayloadAction<{
        chatListId: string;
        isOnline: boolean;
        lastSeen?: string;
      }>
    ) => {
      const { chatListId, isOnline, lastSeen } = action.payload;
      if (state.chats[chatListId]) {
        state.chats[chatListId].receiver.isOnline = isOnline;
        if (lastSeen) {
          state.chats[chatListId].receiver.lastSeen = lastSeen;
        }
      }
    },

    // Remove a chat
    removeChat: (state, action: PayloadAction<string>) => {
      const chatListId = action.payload;

      // Remove the chat
      delete state.chats[chatListId];

      // Remove all messages associated with the chat
      const messageIds = state.chats[chatListId]?.messageIds || [];
      messageIds.forEach((messageId) => {
        delete state.messages[messageId];
      });
    },

    // Set the selected chat
    setSelectedChat: (state, action: PayloadAction<string | null>) => {
      state.selectedChatId = action.payload;
    },

    addOldMessages: (
      state,
      action: PayloadAction<{ chatListId: string; messages: Message[] }>
    ) => {
      const { chatListId, messages } = action.payload;

      // Add each message to the normalized messages
      messages.forEach((message) => {
        state.messages[message.id] = message;
        // Add the message ID to the chat's messageIds array
        if (state.chats[chatListId]) {
          state.chats[chatListId].messageIds.unshift(message.id);
        }
      });
    },

    markChatAsDelivered: (
      state,
      action: PayloadAction<{ chatListId: string }>
    ) => {
      const { chatListId } = action.payload;
      if (state.chats[chatListId]) {
        state.chats[chatListId].messageIds.forEach((messageId) => {
          if (state.messages[messageId]) {
            if (
              state.messages[messageId].status == "sent" &&
              state.messages[messageId].isSent
            ) {
              state.messages[messageId].status = "delivered";
            }
          }
        });
      }
    },

    markChatAsSeen: (state, action: PayloadAction<{ chatListId: string }>) => {
      const { chatListId } = action.payload;
      if (state.chats[chatListId]) {
        state.chats[chatListId].messageIds.forEach((messageId) => {
          if (state.messages[messageId]) {
            if (state.messages[messageId].isSent) {
              if (state.messages[messageId].status !== "seen")
                state.messages[messageId].status = "seen";
            }
          }
        });
      }
    },

    markMessageAsSeen: (
      state,
      action: PayloadAction<{ chatListId: string; messageId: string }>
    ) => {
      const { chatListId, messageId } = action.payload;
      if (state.chats[chatListId]) {
        if (state.messages[messageId]) {
          if (state.messages[messageId].isSent) {
            if (state.messages[messageId].status !== "seen")
              state.messages[messageId].status = "seen";
          }
        }
      }
    },

    updateUserDetails: (
      state,
      action: PayloadAction<{
        chatListId: string;
        username: string;
        profileImage: string | undefined;
      }>
    ) => {
      const { chatListId, username, profileImage } = action.payload;
      if (state.chats[chatListId]) {
        state.chats[chatListId].receiver.username = username;
        state.chats[chatListId].receiver.profileImage = profileImage;
      }
    },
  },
});

export const {
  addChat,
  addChats,
  addMessage,
  updateReceiverStatus,
  removeChat,
  setSelectedChat,
  addOldMessages,
  markChatAsDelivered,
  markChatAsSeen,
  updateUserDetails,
  markMessageAsSeen,
} = chatSlice.actions;
export default chatSlice.reducer;
