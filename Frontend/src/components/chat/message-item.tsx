import { type Message } from "@/redux/chatSlice";
import { CheckCheckIcon, CheckIcon } from "lucide-react";
import React from "react";
import QuickRefineToolbar from "./QuickRefineToolbar";

interface MessageItemProps {
  message: Message;
  onSendMessage?: (msg: string) => void;
}

export default function MessageItem({ message, onSendMessage }: MessageItemProps) {
  return (
    <>
      {message.isSent ? (
        /* User Messages */
        <div className="flex justify-end mb-4">
          <div className="bg-purple-700 text-white rounded-lg p-3 max-w-md shadow-sm">
            <p className="text-sm">{message.message}</p>
            <div className="flex justify-end items-center text-xs mt-1 text-gray-200">
              <span className="mr-1">
                {new Date(message.createdAt).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
              {message.status === "sent" && <CheckIcon className="h-3 w-3 inline" />}
              {message.status === "delivered" && (
                <CheckCheckIcon className="h-3 w-3 inline text-gray-300/70" />
              )}
              {message.status === "seen" && (
                <CheckCheckIcon className="h-3 w-3 inline text-blue-300" />
              )}
            </div>
          </div>
        </div>
      ) : (
        /* AI Messages - Added 'group' for hover logic */
        <div className="flex justify-start mb-4 group">
          <div className="flex flex-col items-start max-w-md">
            <div className="bg-gray-100 rounded-lg p-3 shadow-sm border border-gray-200">
              <p className="text-sm text-gray-800">{message.message}</p>
              <div className="flex justify-end items-center text-xs mt-1 text-gray-500">
                <span>
                  {new Date(message.createdAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            </div>

            {/* Toolbar only appears for AI responses on hover */}
            {onSendMessage && (
              <QuickRefineToolbar onRefine={onSendMessage} />
            )}
          </div>
        </div>
      )}
    </>
  );
}