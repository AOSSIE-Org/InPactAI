import { useState } from "react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import VideoCallUi from "./video-call-ui";
import { useChat } from "@/lib/useChat";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";

const CallStarter = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { currentUserId, sendVideoSignal, startCall } = useChat();
  const targetUserId = useSelector(
    (state: RootState) =>
      state.chat.chats[state.chat.selectedChatId!].receiver.id
  );

  const handleStartCall = () => {
    setIsOpen(true);
    // Initiate the call by sending an offer signal
    // sendVideoSignal(targetUserId, "VIDEO_OFFER", {}); // Empty payload for offer initiation
    startCall(targetUserId);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="default"
          className="start-call-btn"
          onClick={handleStartCall}
        >
          Start Video Call
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[800px]">
        <VideoCallUi
          currentUserId={currentUserId}
          targetUserId={targetUserId}
        />
      </DialogContent>
    </Dialog>
  );
};

export default CallStarter;
