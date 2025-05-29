import React, { useState } from "react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Send } from "lucide-react";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { useChat } from "@/lib/useChat";

export default function MessageInput({
  containerRef,
}: {
  containerRef: React.RefObject<HTMLDivElement | null>;
}) {
  const [message, setMessage] = useState("");
  const receiverId = useSelector(
    (state: RootState) =>
      state.chat.chats[state.chat.selectedChatId!].receiver.id
  );
  const { sendMessage } = useChat();
  const handleSendMessage = () => {
    if (message.trim() === "") return;
    sendMessage(receiverId, message);
    setMessage("");
    // Scroll to the bottom of the container
    setTimeout(() => {
      if (containerRef.current) {
        containerRef.current.scrollTop = containerRef.current.scrollHeight;
      }
    }, 1000);
  };
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Enter") {
      event.preventDefault();
      handleSendMessage();
    }
  };
  return (
    <div className="p-4 border-t">
      <div className="flex gap-2">
        <Input
          placeholder="Type your message..."
          className="flex-1"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <Button
          className="bg-purple-700 hover:bg-purple-800 text-white"
          onClick={handleSendMessage}
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
