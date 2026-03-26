export interface MessagesReadResponse {
  chatListId: string;
  eventType: "MESSAGES_READ";
}

export interface NewMessageResponse {
  id: string;
  isSent: boolean;
  status?: "sent" | "delivered" | "seen";
  senderId?: string;
  chatListId?: string;
  message: string;
  createdAt: string;
  eventType?: string;
  username?: string;
}
