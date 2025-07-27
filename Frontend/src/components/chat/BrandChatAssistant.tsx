import React, { useState, useRef, useEffect } from "react";

// Message type for chat
export type ChatMessage = {
  sender: "user" | "ai";
  text: string;
  result?: any; // For future result rendering
  error?: string;
};

interface BrandChatAssistantProps {
  initialQuery: string;
  onClose: () => void;
  sessionId: string | null;
  setSessionId: (sessionId: string | null) => void;
}

const BrandChatAssistant: React.FC<BrandChatAssistantProps> = ({ 
  initialQuery, 
  onClose, 
  sessionId, 
  setSessionId 
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { sender: "user", text: initialQuery },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom on new message
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Send message to backend API
  const sendMessageToBackend = async (message: string, currentSessionId?: string) => {
    try {
      const response = await fetch('/api/ai/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(currentSessionId && { 'X-Session-ID': currentSessionId }),
        },
        body: JSON.stringify({
          query: message,
          brand_id: "550e8400-e29b-41d4-a716-446655440000", // Test brand ID - TODO: Get from auth context
          context: currentSessionId ? { session_id: currentSessionId } : undefined,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // Update session ID if provided
      if (data.session_id && !currentSessionId) {
        setSessionId(data.session_id);
      }

      return data;
    } catch (error) {
      console.error('Error calling AI API:', error);
      throw error;
    }
  };

  // Handle initial AI response
  useEffect(() => {
    if (messages.length === 1) {
      setLoading(true);
      sendMessageToBackend(initialQuery)
        .then((response) => {
          const aiMessage: ChatMessage = {
            sender: "ai",
            text: response.explanation || "I understand your request. Let me help you with that.",
            result: response.result,
          };
          setMessages((msgs) => [...msgs, aiMessage]);
        })
        .catch((error) => {
          const errorMessage: ChatMessage = {
            sender: "ai",
            text: "Sorry, I encountered an error processing your request. Please try again.",
            error: error.message,
          };
          setMessages((msgs) => [...msgs, errorMessage]);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, []);

  const sendMessage = async () => {
    if (!input.trim()) return;
    
    const userMsg: ChatMessage = { sender: "user", text: input };
    setMessages((msgs) => [...msgs, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const response = await sendMessageToBackend(input, sessionId || undefined);
      
      const aiMessage: ChatMessage = {
        sender: "ai",
        text: response.explanation || "I've processed your request.",
        result: response.result,
      };
      
      setMessages((msgs) => [...msgs, aiMessage]);
    } catch (error) {
      const errorMessage: ChatMessage = {
        sender: "ai",
        text: "Sorry, I encountered an error. Please try again.",
        error: error instanceof Error ? error.message : "Unknown error",
      };
      setMessages((msgs) => [...msgs, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="brand-chat-assistant-embedded"
      style={{
        width: "100%",
        maxWidth: "800px",
        height: "600px",
        background: "#18181b",
        borderRadius: 16,
        border: "1px solid #232329",
        display: "flex",
        flexDirection: "column",
        boxShadow: "0 8px 32px rgba(0,0,0,0.25)",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "16px 20px",
          borderBottom: "1px solid #232329",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: "#232329",
          borderTopLeftRadius: 16,
          borderTopRightRadius: 16,
        }}
      >
        <span style={{ color: "#fff", fontWeight: 600, fontSize: 18 }}>
          🤖 Brand AI Assistant
        </span>
        <button
          onClick={onClose}
          style={{
            background: "none",
            border: "none",
            color: "#fff",
            fontSize: 20,
            cursor: "pointer",
            padding: "4px",
            borderRadius: "4px",
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.1)"}
          onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
          aria-label="Close chat"
        >
          ×
        </button>
      </div>

      {/* Chat history */}
      <div
        className="chat-history"
        style={{
          flex: 1,
          overflowY: "auto",
          padding: 20,
          background: "#18181b",
        }}
      >
        {messages.map((msg, idx) => (
          <div
            key={idx}
            style={{
              display: "flex",
              justifyContent: msg.sender === "user" ? "flex-end" : "flex-start",
              marginBottom: 12,
            }}
          >
            <div
              style={{
                background: msg.sender === "user" ? "#6366f1" : "#232329",
                color: "#fff",
                padding: "12px 18px",
                borderRadius: 18,
                maxWidth: "75%",
                wordBreak: "break-word",
                fontSize: 15,
                border: msg.error ? "1px solid #ef4444" : "none",
              }}
            >
              {msg.text}
              {msg.result && (
                <div style={{ 
                  marginTop: "8px", 
                  padding: "8px", 
                  background: "rgba(59, 130, 246, 0.1)", 
                  borderRadius: "8px",
                  fontSize: "14px",
                  border: "1px solid rgba(59, 130, 246, 0.3)",
                }}>
                  <strong>Result:</strong> {JSON.stringify(msg.result, null, 2)}
                </div>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div style={{ 
            display: "flex", 
            alignItems: "center", 
            gap: "8px", 
            color: "#aaa", 
            margin: "8px 0",
            fontSize: "14px",
          }}>
            <div style={{
              width: "16px",
              height: "16px",
              border: "2px solid #aaa",
              borderTop: "2px solid transparent",
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
            }} />
            AI is typing…
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Input */}
      <div style={{ 
        display: "flex", 
        padding: 16, 
        background: "#232329", 
        borderBottomLeftRadius: 16, 
        borderBottomRightRadius: 16,
        gap: "12px",
      }}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder="Type your message…"
          style={{
            flex: 1,
            padding: 12,
            borderRadius: 10,
            border: "1px solid #333",
            background: "#222",
            color: "#fff",
            fontSize: 15,
            outline: "none",
          }}
          disabled={loading}
        />
        <button
          onClick={sendMessage}
          disabled={loading || !input.trim()}
          style={{
            padding: "0 22px",
            borderRadius: 10,
            background: loading || !input.trim() ? "#666" : "#6366f1",
            color: "#fff",
            border: "none",
            fontWeight: "bold",
            fontSize: 15,
            cursor: loading || !input.trim() ? "not-allowed" : "pointer",
            transition: "background-color 0.2s ease",
          }}
          onMouseEnter={(e) => {
            if (!loading && input.trim()) {
              e.currentTarget.style.background = "#4f46e5";
            }
          }}
          onMouseLeave={(e) => {
            if (!loading && input.trim()) {
              e.currentTarget.style.background = "#6366f1";
            }
          }}
        >
          Send
        </button>
      </div>

      {/* CSS for loading animation */}
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
};

export default BrandChatAssistant; 