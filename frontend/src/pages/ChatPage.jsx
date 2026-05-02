import { useState, useRef, useEffect } from "react";
import { Shield, AlertCircle, X } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useProfile } from "../hooks/useProfile";
import { sendChat } from "../api/client";
import TopBar from "../components/layout/TopBar";
import ChatInput from "../components/chat/ChatInput";
import MessageBubble from "../components/chat/MessageBubble";
import MaskingDrawer from "../components/chat/MaskingDrawer";
import ProcessingVisualizer from "../components/chat/ProcessingVisualizer";
import "../styles/chat.css";

export default function ChatPage() {
  const { auth } = useAuth();
  const { profile, refresh: refreshProfile } = useProfile(auth?.token);

  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedModel, setSelectedModel] = useState("");
  const [drawerData, setDrawerData] = useState(null);

  const scrollRef = useRef(null);

  /* Set default model when profile loads */
  useEffect(() => {
    if (profile?.allowed_models?.length && !selectedModel) {
      setSelectedModel(profile.allowed_models[0]);
    }
  }, [profile, selectedModel]);

  /* Auto-scroll to bottom */
  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, loading]);

  async function handleSend(prompt) {
    setError(null);
    const userMsg = { id: Date.now(), role: "user", text: prompt };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      const data = await sendChat(auth.token, prompt, selectedModel);
      const assistantMsg = {
        id: Date.now() + 1,
        role: "assistant",
        text: data.reply,
        maskData: {
          masked_prompt: data.masked_prompt,
          pii_detected: data.pii_detected,
          mapping: data.mapping,
          raw_llm_reply: data.raw_llm_reply,
          model_used: data.model_used,
        },
      };
      setMessages((prev) => [...prev, assistantMsg]);
      refreshProfile();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="chat-layout">
      <TopBar
        profile={profile}
        selectedModel={selectedModel}
        onModelChange={setSelectedModel}
      />

      {/* Error banner */}
      {error && (
        <div className="chat-error">
          <AlertCircle size={16} />
          <span>{error}</span>
          <button className="chat-error-dismiss" onClick={() => setError(null)}>
            <X size={12} /> Dismiss
          </button>
        </div>
      )}

      {/* Messages area */}
      <div className="chat-messages" ref={scrollRef}>
        {messages.length === 0 && !loading && (
          <div className="chat-empty">
            <div className="chat-empty-icon">
              <Shield size={28} />
            </div>
            <h2>SentinelProxy Chat</h2>
            <p>
              Send a message to get started. All personally identifiable
              information (PII) will be automatically detected, masked, and
              restored — keeping your data safe.
            </p>
          </div>
        )}

        {messages.map((msg) => (
          <MessageBubble
            key={msg.id}
            message={msg}
            onOpenDrawer={setDrawerData}
          />
        ))}

        {loading && <ProcessingVisualizer />}
      </div>

      <ChatInput onSend={handleSend} disabled={loading} />

      {/* Right drawer */}
      {drawerData && (
        <MaskingDrawer
          maskData={drawerData}
          onClose={() => setDrawerData(null)}
        />
      )}
    </div>
  );
}
