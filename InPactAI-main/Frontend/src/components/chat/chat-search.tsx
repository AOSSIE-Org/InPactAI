import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { setSelectedChat } from "@/redux/chatSlice";
import { Input } from "@/components/ui/input";
import { Search as SearchIcon } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

const ChatSearch = () => {
  const dispatch = useDispatch();
  const chats = useSelector((state: RootState) => state.chat.chats);
  const messages = useSelector((state: RootState) => state.chat.messages);

  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setSearchResults([]);
      return;
    }

    const results: any[] = [];
    const query = searchQuery.toLowerCase();

    // Search through chats for username matches
    Object.values(chats).forEach((chat) => {
      if (chat.receiver.username?.toLowerCase().includes(query)) {
        results.push({
          type: "chat",
          chatId: chat.id,
          username: chat.receiver.username,
          profileImage: chat.receiver.profileImage,
        });
      }

      // Search through messages in this chat
      const chatMessages = chat.messageIds
        .map((id) => messages[id])
        .filter((message) => message?.message.toLowerCase().includes(query));

      chatMessages.forEach((message) => {
        results.push({
          type: "message",
          chatId: chat.id,
          messageId: message.id,
          messagePreview: message.message,
          username: chat.receiver.username,
          profileImage: chat.receiver.profileImage,
        });
      });
    });

    setSearchResults(results);
  }, [searchQuery, chats, messages]);

  const handleResultClick = (chatId: string) => {
    dispatch(setSelectedChat(chatId));
    setIsOpen(false);
    setSearchQuery("");
  };

  const renderSearchResults = () => {
    if (searchResults.length === 0 && searchQuery.trim() !== "") {
      return (
        <div className="p-4 text-center text-muted-foreground">
          No results found
        </div>
      );
    }

    return searchResults.map((result, index) => (
      <Button
        key={`${result.type}-${index}`}
        variant="ghost"
        className="w-full justify-start p-2 hover:bg-accent"
        onClick={() => handleResultClick(result.chatId)}
      >
        <div className="flex items-center gap-3 w-full">
          <Avatar className="h-8 w-8">
            <AvatarImage src={result.profileImage} alt={result.username} />
            <AvatarFallback>
              {result.username ? result.username.charAt(0).toUpperCase() : "?"}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col text-left overflow-hidden">
            <span className="font-medium">{result.username || "Unknown"}</span>
            {result.type === "message" && (
              <span className="text-xs text-muted-foreground truncate">
                {result.messagePreview}
              </span>
            )}
          </div>
        </div>
      </Button>
    ));
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <div className="relative w-full max-w-md">
          <SearchIcon className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search chats and messages..."
            className="pl-9 pr-4"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              if (e.target.value.trim() !== "") {
                setIsOpen(true);
              }
            }}
            onFocus={() => {
              if (searchQuery.trim() !== "") {
                setIsOpen(true);
              }
            }}
          />
        </div>
      </PopoverTrigger>
      <PopoverContent
        className="w-[300px] p-0 max-h-[400px] overflow-y-auto"
        onOpenAutoFocus={(e) => e.preventDefault()} // This prevents the auto focus
      >
        <div className="py-2">{renderSearchResults()}</div>
      </PopoverContent>
    </Popover>
  );
};

export default ChatSearch;
