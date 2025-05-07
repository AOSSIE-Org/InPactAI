import React, { useEffect, useRef, useState } from "react";
import { useChat } from "@/lib/useChat";
import { cn } from "@/lib/utils";

interface VideoCallUIProps {
  currentUserId: string;
  targetUserId: string;
}

const VideoCallUI: React.FC<VideoCallUIProps> = ({
  currentUserId,
  targetUserId,
}) => {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const [micEnabled, setMicEnabled] = useState(true);
  const [camEnabled, setCamEnabled] = useState(true);

  const {
    localStreamRef,
    remoteStreamRef,
    handleCallEnd: onEndCall,
  } = useChat();
  const localStream = localStreamRef.current;
  const remoteStream = remoteStreamRef.current;

  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [localStream, remoteStream]);

  const toggleMic = () => {
    if (localStream) {
      localStream
        .getAudioTracks()
        .forEach((track) => (track.enabled = !micEnabled));
      setMicEnabled(!micEnabled);
    }
  };

  const toggleCam = () => {
    if (localStream) {
      localStream
        .getVideoTracks()
        .forEach((track) => (track.enabled = !camEnabled));
      setCamEnabled(!camEnabled);
    }
  };

  const localVideoLabel = currentUserId ? "You (Local)" : "Local User";
  const remoteVideoLabel = targetUserId ? "Remote User" : "Remote User";

  return (
    <div className="flex flex-col items-center">
      <div className="flex flex-col mb-4">
        <label className="text-center mb-2 font-bold">{localVideoLabel}</label>
        <video
          ref={localVideoRef}
          autoPlay
          muted
          playsInline
          className="w-80 h-60 border border-gray-300 bg-black"
          style={{
            position: "absolute",
            bottom: "1rem",
            right: "1rem",
            width: "20%",
            height: "20%",
            zIndex: 10,
          }}
        />
      </div>

      <div className="flex flex-col mb-4">
        <label className="text-center mb-2 font-bold">{remoteVideoLabel}</label>
        <video
          ref={remoteVideoRef}
          autoPlay
          playsInline
          className="w-full h-full border border-gray-300 bg-black"
          style={{ width: "100%", height: "60vh" }}
        />
      </div>

      <div className="flex justify-center mt-4">
        <button
          onClick={toggleMic}
          className="mx-2 px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
        >
          {micEnabled ? "Mute Mic" : "Unmute Mic"}
        </button>
        <button
          onClick={toggleCam}
          className="mx-2 px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
        >
          {camEnabled ? "Turn Off Cam" : "Turn On Cam"}
        </button>
        <button
          onClick={onEndCall}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
        >
          End Call
        </button>
      </div>
    </div>
  );
};

export default VideoCallUI;
