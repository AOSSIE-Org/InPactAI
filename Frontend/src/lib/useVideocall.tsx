import { useRef, useState } from "react";
type IncomingCall = {
  from: string;
  offer: RTCSessionDescriptionInit;
};

export default function useVideocall(
  ws: React.MutableRefObject<WebSocket | null>
) {
  // WebRTC state
  const peerRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const remoteStreamRef = useRef<MediaStream | null>(null);

  const [incomingCalls, setIncomingCalls] = useState<IncomingCall[]>([]);

  const sendVideoSignal = (
    receiverId: string,
    eventType: string,
    payload: any
  ) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      const message = JSON.stringify({
        event_type: eventType,
        receiver_id: receiverId,
        payload: payload,
      });
      console.log("Sending WebSocket message:", message); // Log the stringified message
      ws.current.send(message);
    }
  };

  const handleOffer = async (
    offer: RTCSessionDescriptionInit,
    from: string
  ) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      localStreamRef.current = stream;

      const peer = new RTCPeerConnection({
        iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
      });
      peerRef.current = peer;

      stream.getTracks().forEach((track) => peer.addTrack(track, stream));

      peer.onicecandidate = (e) => {
        if (e.candidate) {
          sendVideoSignal(from, "ICE_CANDIDATE", e.candidate);
        }
      };

      peer.ontrack = (e) => {
        remoteStreamRef.current = e.streams[0];
      };

      await peer.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await peer.createAnswer();
      await peer.setLocalDescription(answer);

      sendVideoSignal(from, "VIDEO_ANSWER", answer);
    } catch (error) {
      console.error("Error handling offer:", error);
      // Handle errors appropriately (e.g., display a message to the user)
    }
  };

  const handleAnswer = async (answer: RTCSessionDescriptionInit) => {
    if (peerRef.current) {
      try {
        await peerRef.current.setRemoteDescription(
          new RTCSessionDescription(answer)
        );
      } catch (error) {
        console.error("Error handling answer:", error);
        // Handle errors
      }
    }
  };

  const handleCandidate = async (candidate: RTCIceCandidateInit) => {
    if (peerRef.current) {
      try {
        await peerRef.current.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (error) {
        console.error("Error handling candidate:", error);
        // Handle errors
      }
    }
  };

  const handleCallEnd = () => {
    if (peerRef.current) {
      peerRef.current.close();
      peerRef.current = null;
    }
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
    }
    remoteStreamRef.current = null;
  };

  const startCall = async (receiverId: string) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      localStreamRef.current = stream;

      const peer = new RTCPeerConnection({
        iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
      });
      peerRef.current = peer;

      stream.getTracks().forEach((track) => peer.addTrack(track, stream));

      peer.onicecandidate = (e) => {
        if (e.candidate) {
          sendVideoSignal(receiverId, "ICE_CANDIDATE", e.candidate);
        }
      };

      peer.ontrack = (e) => {
        remoteStreamRef.current = e.streams[0];
      };

      const offer = await peer.createOffer();
      await peer.setLocalDescription(offer);

      sendVideoSignal(receiverId, "VIDEO_OFFER", offer);
    } catch (error) {
      console.error("Error starting call:", error);
      // Handle errors (e.g., display a message to the user)
    }
  };

  //   const acceptCall = async (callerId: string) => {
  //     const call = incomingCalls.find(c => c.from === callerId);
  //     if (!call) return;

  //     await peer.setRemoteDescription(new RTCSessionDescription(call.offer));
  //     const answer = await peer.createAnswer();
  //     await peer.setLocalDescription(answer);

  //     sendVideoSignal(callerId, "VIDEO_ANSWER", answer);
  //     setIncomingCalls((prev) => prev.filter(c => c.from !== callerId));
  //   };

  //   const rejectCall = (callerId: string) => {
  //     sendVideoSignal(callerId, "CALL_REJECTED", {});
  //     setIncomingCalls((prev) => prev.filter(c => c.from !== callerId));
  //   };

  return {
    sendVideoSignal,
    handleOffer,
    handleAnswer,
    handleCandidate,
    handleCallEnd,
    startCall,
    localStreamRef,
    remoteStreamRef,
    peerRef,
  };
}
