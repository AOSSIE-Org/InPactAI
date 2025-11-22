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

  useEffect(() => {
    setLastMarkedAsSeen(new Date().toISOString());
  }, [selectedChatId]);

  const { markMessageAsSeen } = useChat();

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
  }, [messages]);

  return (
    <>
      {messages.length > 0 ? (
        <>
          {messages.reduce((acc: JSX.Element[], message, index, array) => {
            // Add date separator for first message
            if (index === 0) {
              const firstDate = parseISO(message.createdAt);
              acc.push(
                <div
                  key={`date-first-${message.id}`}
                  className="flex justify-center my-4"
                >
                  <div className="bg-gray-100 px-3 py-1 rounded-full text-sm text-gray-500">
                    {format(firstDate, "PPP")}
                  </div>
                </div>
              );
            }

            // Add the message component
            acc.push(<MessageItem key={message.id} message={message} />);

            // Check if the next message is from a different date
            if (index < array.length - 1) {
              const currentDate = parseISO(message.createdAt);
              const nextDate = parseISO(array[index + 1].createdAt);

              // Check if dates are different
              if (
                !isEqual(
                  new Date(
                    currentDate.getFullYear(),
                    currentDate.getMonth(),
                    currentDate.getDate()
                  ),
                  new Date(
                    nextDate.getFullYear(),
                    nextDate.getMonth(),
                    nextDate.getDate()
                  )
                )
              ) {
                acc.push(
                  <div
                    key={`date-${message.id}`}
                    className="flex justify-center my-4"
                  >
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
        <div className="flex justify-center items-center h-full">
          <p className="text-gray-500">No messages yet</p>
        </div>
      )}
    </>
  );
}
