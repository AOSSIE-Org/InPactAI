import React, { useEffect, useRef, useState } from "react";

const VideoCall: React.FC = () => {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [roomId, setRoomId] = useState("");
  const [peerConnection, setPeerConnection] =
    useState<RTCPeerConnection | null>(null);

  useEffect(() => {
    // Initialize local video stream
    const initLocalStream = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        setLocalStream(stream);

        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error("Error accessing media devices:", error);
      }
    };

    initLocalStream();

    // Cleanup on component unmount
    return () => {
      localStream?.getTracks().forEach((track) => track.stop());
      peerConnection?.close();
    };
  }, []);

  const createPeerConnection = () => {
    const pc = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });

    localStream?.getTracks().forEach((track) => {
      pc.addTrack(track, localStream);
    });

    pc.ontrack = (event) => {
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = event.streams[0];
      }
    };

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        console.log("New ICE candidate:", event.candidate);
      }
    };

    pc.onconnectionstatechange = () => {
      if (pc.connectionState === "connected") {
        setIsConnected(true);
      } else if (
        ["disconnected", "failed", "closed"].includes(pc.connectionState)
      ) {
        setIsConnected(false);
      }
    };

    setPeerConnection(pc);
    return pc;
  };

  const createRoom = async () => {
    const pc = createPeerConnection();
    try {
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      setRoomId(`room-${Math.floor(Math.random() * 1000000)}`);
      console.log("Room created with offer:", offer);
    } catch (error) {
      console.error("Error creating room:", error);
    }
  };

  const joinRoom = async () => {
    if (!roomId) {
      alert("Please enter a room ID");
      return;
    }
    createPeerConnection();
    console.log("Joining room:", roomId);
  };

  const toggleMute = () => {
    if (localStream) {
      localStream.getAudioTracks().forEach((track) => {
        track.enabled = !track.enabled;
      });
    }
  };

  const toggleVideo = () => {
    if (localStream) {
      localStream.getVideoTracks().forEach((track) => {
        track.enabled = !track.enabled;
      });
    }
  };

  const endCall = () => {
    peerConnection?.close();
    setPeerConnection(null);
    setIsConnected(false);
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold text-center mb-6">Video Calling</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="relative">
          <video
            ref={localVideoRef}
            autoPlay
            muted
            playsInline
            className="w-full h-64 object-cover bg-gray-800 rounded-lg"
          />
          <div className="absolute bottom-2 left-2 bg-black/50 text-white px-2 py-1 rounded">
            You
          </div>
        </div>

        <div className="relative">
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="w-full h-64 object-cover bg-gray-800 rounded-lg"
          />
          <div className="absolute bottom-2 left-2 bg-black/50 text-white px-2 py-1 rounded">
            Remote User
          </div>
        </div>
      </div>

      {!isConnected ? (
        <div className="flex flex-col gap-4">
          <button
            onClick={createRoom}
            className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded"
          >
            Create Room
          </button>

          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              placeholder="Enter Room ID"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              className="flex-1 border border-gray-300 p-2 rounded"
            />
            <button
              onClick={joinRoom}
              className="bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-4 rounded"
            >
              Join Room
            </button>
          </div>

          {roomId && (
            <div className="bg-gray-100 p-3 rounded flex justify-between items-center mt-2">
              <p>
                Your Room ID:{" "}
                <span className="font-mono font-medium">{roomId}</span>
              </p>
              <button
                onClick={() => navigator.clipboard.writeText(roomId)}
                className="bg-gray-200 hover:bg-gray-300 px-3 py-1 rounded text-sm"
              >
                Copy
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="flex justify-center gap-4">
          <button
            onClick={toggleMute}
            className="bg-gray-500 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded"
          >
            Toggle Mute
          </button>
          <button
            onClick={toggleVideo}
            className="bg-gray-500 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded"
          >
            Toggle Video
          </button>
          <button
            onClick={endCall}
            className="bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-4 rounded"
          >
            End Call
          </button>
        </div>
      )}
    </div>
  );
};

export default VideoCall;
