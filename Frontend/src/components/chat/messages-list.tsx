import { Message } from "@/redux/chatSlice";
import React, { JSX, useEffect } from "react";
import { format, isEqual, parseISO } from "date-fns";
import MessageItem from "./message-item";
import { useChat } from "@/lib/useChat";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";

export default function MessagesList({ messages }: { messages: Message[] }) {
  const [lastMarkedAsSeen, setLastMarkedAsSeen] = React.useState<string>(
    new Date().toISOString()
  );
  const selectedChatId = useSelector(
    (state: RootState) => state.chat.selectedChatId
  );

  const { markMessageAsSeen, sendMessage } = useChat();

  useEffect(() => {
    setLastMarkedAsSeen(new Date().toISOString());
  }, [selectedChatId]);

  useEffect(() => {
    const unseenMessages = messages.filter(
      (message) =>
        message.isSent === false &&
        new Date(message.createdAt).getTime() >
          new Date(lastMarkedAsSeen).getTime()
    );
    if (unseenMessages.length > 0) {
      unseenMessages.forEach((message) => {
        markMessageAsSeen(message.chatListId, message.id);
      });
      setLastMarkedAsSeen(new Date().toISOString());
    }
  }, [messages, lastMarkedAsSeen, markMessageAsSeen]);

  return (
    <div className="flex flex-col w-full px-4">
      {messages.length > 0 ? (
        <>
          {messages.reduce((acc: JSX.Element[], message, index, array) => {
            // Date Separator Logic
            const messageDate = parseISO(message.createdAt);
            if (index === 0) {
              acc.push(
                <div key={`date-first-${message.id}`} className="flex justify-center my-4">
                  <div className="bg-gray-100 px-3 py-1 rounded-full text-sm text-gray-500">
                    {format(messageDate, "PPP")}
                  </div>
                </div>
              );
            }

            // Push Message Item
            acc.push(
              <MessageItem 
                key={message.id} 
                message={message} 
                onSendMessage={sendMessage} 
              />
            );

            // Date separator for subsequent messages
            if (index < array.length - 1) {
              const nextDate = parseISO(array[index + 1].createdAt);
              if (!isEqual(
                new Date(messageDate.setHours(0,0,0,0)), 
                new Date(nextDate.setHours(0,0,0,0))
              )) {
                acc.push(
                  <div key={`date-${array[index+1].id}`} className="flex justify-center my-4">
                    <div className="bg-gray-100 px-3 py-1 rounded-full text-sm text-gray-500">
                      {format(nextDate, "PPP")}
                    </div>
                  </div>
                );
              }
            }

            return acc;
          }, [])}
        </>
      ) : (
        <div className="flex justify-center items-center h-64">
          <p className="text-gray-400 italic">No messages yet. Start a conversation!</p>
        </div>
      )}
    </div>
  );
}