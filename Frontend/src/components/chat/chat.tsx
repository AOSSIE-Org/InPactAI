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
      <div className="relative m-4 max-w-xl ml-auto">
        <Input
          value={inputUserId ?? ""}
          onChange={(e) => setInputUserId(e.target.value)}
          placeholder="Enter user ID"
          className="pr-28 rounded-full dark:bg-[#364152] dark:text-nightTS"
          disabled={!!userId}
        />
        <Button
          size={"sm"}
          variant={"outline"}
          onClick={() => {
            setUserId(inputUserId);
          }}
          className="absolute rounded-full right-2 top-1/2 -translate-y-1/2 dark:border-purple-700 dark:bg-purple-600 dark:text-nightTS dark:hover:bg-purple-700"
        >
          {userId ? "Connected" : "Connect"}
        </Button>
      </div>
      {userId && (
        <ChatProvider userId={userId}>
          <div className="grid grid-cols-12 gap-6 dark:bg-nightP dark:text-nightTS">
            <ChatList />
            <MessagesView />
          </div>
        </ChatProvider>
      )}
    </>
  );
}
