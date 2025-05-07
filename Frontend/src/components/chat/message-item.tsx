import { type Message } from "@/redux/chatSlice";
import { CheckCheckIcon, CheckIcon } from "lucide-react";

import React from "react";

export default function MessageItem({ message }: { message: Message }) {
  return (
    <>
      {message.isSent ? (
        <div className="flex justify-end">
          <div className="bg-purple-700 text-white rounded-lg p-3 max-w-md">
            <p>{message.message}</p>
            <div className="flex justify-end items-center text-xs mt-1 text-gray-200">
              <span className="mr-1">
                {new Date(message.createdAt).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
              {message.status === "sent" && (
                <span>
                  <CheckIcon className="h-3 w-3 inline" />
                </span>
              )}
              {message.status === "delivered" && (
                <span>
                  <CheckCheckIcon className="h-3 w-3 inline text-gray-300/70" />
                </span>
              )}
              {message.status === "seen" && (
                <span>
                  <CheckCheckIcon className="h-3 w-3 inline text-blue-300" />
                </span>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="flex justify-start">
          <div className="bg-gray-100 rounded-lg p-3 max-w-md">
            <p>{message.message}</p>
            <div className="flex justify-end items-center text-xs mt-1 text-gray-500">
              <span>
                {new Date(message.createdAt).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
