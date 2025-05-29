import { ChatProvider } from "@/lib/useChat";
import ChatList from "./chat-list";
import MessagesView from "./messages-view";
import { useState } from "react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";

export default function Chat() {
  const [inputUserId, setInputUserId] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  return (
    <>
      <div className="relative flex items-center">
        <Input
          value={inputUserId ?? ""}
          onChange={(e) => setInputUserId(e.target.value)}
          placeholder="Enter user ID"
          className="mb-4 max-w-xl ml-auto"
          disabled={!!userId}
        />
        <Button
          size={"sm"}
          variant={"outline"}
          onClick={() => {
            setUserId(inputUserId);
          }}
          className="absolute right-2 top-1"
        >
          {userId ? "Connected" : "Connect"}
        </Button>
      </div>
      {userId && (
        <ChatProvider userId={userId}>
          <div className="grid grid-cols-12 gap-6">
            <ChatList />
            <MessagesView />
          </div>
        </ChatProvider>
      )}
    </>
  );
}
