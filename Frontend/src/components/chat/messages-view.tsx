import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import SelectedUserCard from "./selected-user-card";
import MessageInput from "./message-input";
import MessagesList from "./messages-list";
import { useChat } from "@/lib/useChat";
import { Loader2 } from "lucide-react";

export default function MessagesView() {
    const selectedChatId = useSelector(
        (state: RootState) => state.chat.selectedChatId
    );
    const dispatch = useDispatch();
    const [lastFetchedTime, setLastFetchedTime] = useState<number>(
        new Date().getTime()
    );
    const [loading, setLoading] = useState<boolean>(false);
    const [hasMore, setHasMore] = useState<boolean>(true);
    const messagesContainerRef = useRef<HTMLDivElement>(null);
    const initialLoadPerformedRef = useRef<boolean>(false);

    const chatMessageIds = useSelector((state: RootState) =>
        selectedChatId ? state.chat.chats[selectedChatId]?.messageIds || [] : []
    );

    const { fetchChatMessages, markChatAsSeen } = useChat();

    const messages = useSelector((state: RootState) =>
        chatMessageIds.map((messageId) => state.chat.messages[messageId])
    );

    // Load messages function (used for both initial and scroll-based loading)
    const loadMessages = (timestamp: number = 0) => {
        if (!selectedChatId || loading || (!hasMore && timestamp !== 0)) return;

        setLoading(true);

        fetchChatMessages(selectedChatId, timestamp)
            .then((fetchedMessages) => {
                // If no messages or empty array, we've reached the end
                if (!fetchedMessages) {
                    setHasMore(false);
                }

                // Mark messages as seen on initial load
                if (timestamp === 0) {
                    markChatAsSeen(selectedChatId);
                    // Scroll to bottom after loading old messages
                    setTimeout(() => {
                        if (messagesContainerRef.current) {
                            messagesContainerRef.current.scrollTop =
                                messagesContainerRef.current.scrollHeight;
                        }
                    }, 1000);
                }
            })
            .finally(() => {
                setLoading(false);
            });
    };

    // Reset state when chat changes
    useEffect(() => {
        if (selectedChatId) {
            setHasMore(true);
            setLastFetchedTime(new Date().getTime());
            initialLoadPerformedRef.current = false;
            setTimeout(() => {
                if (messagesContainerRef.current) {
                    messagesContainerRef.current.scrollTop =
                        messagesContainerRef.current.scrollHeight;
                }
            }, 10);
        }
    }, [selectedChatId]);

    // Perform initial load if needed
    useEffect(() => {
        if (
            selectedChatId &&
            chatMessageIds.length === 0 &&
            !initialLoadPerformedRef.current
        ) {
            initialLoadPerformedRef.current = true;
            loadMessages(0);
        }
    }, [selectedChatId, chatMessageIds.length]);

    // Update lastFetchedTime when messages change
    useEffect(() => {
        if (messages.length > 0) {
            const oldestMessageTime = new Date(messages[0].createdAt).getTime();
            // Only update if we have a new oldest message
            if (oldestMessageTime < lastFetchedTime) {
                setLastFetchedTime(oldestMessageTime);
            }
        }
    }, [messages, lastFetchedTime]);

    // Handle scroll to load more messages
    const handleScroll = () => {
        if (!messagesContainerRef.current) return;

        const { scrollTop } = messagesContainerRef.current;

        // Check if scrolled to top (with a small threshold)
        if (scrollTop < 10 && !loading && hasMore && selectedChatId) {
            loadMessages(lastFetchedTime);
        }
    };

    // Maintain scroll position when adding old messages
    useEffect(() => {
        if (loading && messagesContainerRef.current) {
            const container = messagesContainerRef.current;
            const oldScrollHeight = container.scrollHeight;

            setTimeout(() => {
                const newScrollHeight = container.scrollHeight;
                container.scrollTop = newScrollHeight - oldScrollHeight;
            }, 0);
        }
    }, [messages, loading]);

    if (!selectedChatId) {
        return (
            <div className="col-span-8 bg-white rounded-lg h-[calc(100vh-300px)] flex items-center justify-center border border-gray-300 dark:bg-nightS dark:text-nightTS dark:border-nightP mr-4">
                <p className="text-gray-500 dark:text-nightTP">Select a chat to view messages</p>
            </div>
        );
    }

    return (
        <div className="col-span-8 bg-white rounded-lg h-[calc(100vh-300px)] flex flex-col border border-gray-300">
            <div className="p-4 border-neutral-200">
                <SelectedUserCard />
            </div>

            <div
                ref={messagesContainerRef}
                className="flex-1 overflow-y-auto p-4 space-y-4"
                onScroll={handleScroll}
            >
                {loading && (
                    <div className="flex justify-center py-2">
                        <Loader2 className="w-6 h-6 animate-spin text-gray-500" />
                    </div>
                )}
                {!hasMore && messages.length > 0 && (
                    <div className="text-center text-sm text-gray-500 py-2">
                        No more messages
                    </div>
                )}
                <MessagesList messages={messages} />
            </div>

            <MessageInput containerRef={messagesContainerRef} />
        </div>
    );
}
