import { useState, useRef, useEffect } from "react";
import { Shield, AlertCircle, X } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useProfile } from "../hooks/useProfile";
import { sendChat, scanPrompt } from "../api/client";
import TopBar from "../components/layout/TopBar";
import ChatInput from "../components/chat/ChatInput";
import MessageBubble from "../components/chat/MessageBubble";
import MaskingDrawer from "../components/chat/MaskingDrawer";
import ProcessingVisualizer from "../components/chat/ProcessingVisualizer";
import ReviewBlock from "../components/chat/ReviewBlock";
import "../styles/chat.css";

export default function ChatPage() {
  const { auth } = useAuth();
  const { profile, refresh: refreshProfile } = useProfile(auth?.token);

  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedModel, setSelectedModel] = useState("");
  const [drawerData, setDrawerData] = useState(null);

  // Review state
  const [pendingPrompt, setPendingPrompt] = useState(null);
  const [reviewData, setReviewData] = useState(null);

  const scrollRef = useRef(null);

  useEffect(() => {
    if (profile?.allowed_models?.length && !selectedModel) {
      setSelectedModel(profile.allowed_models[0]);
    }
  }, [profile, selectedModel]);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, loading, reviewData]);

  // Step 1: Scan
  async function handleScan(prompt) {
    setError(null);
    setLoading(true);
    setReviewData(null);
    try {
      const data = await scanPrompt(auth.token, prompt);
      setPendingPrompt(prompt);
      setReviewData(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  // Step 2: Confirm and send to LLM
  async function handleConfirmSend(promptToConfirm) {
    setReviewData(null);
    setPendingPrompt(null);
    
    const userMsg = { id: Date.now(), role: "user", text: promptToConfirm };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      const data = await sendChat(auth.token, promptToConfirm, selectedModel);
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

      {error && (
        <div className="chat-error">
          <AlertCircle size={16} />
          <span>{error}</span>
          <button className="chat-error-dismiss" onClick={() => setError(null)}>
            <X size={12} /> Dismiss
          </button>
        </div>
      )}

      <div className="chat-messages" ref={scrollRef}>
        {messages.length === 0 && !loading && !reviewData && (
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

        {loading && !reviewData && <ProcessingVisualizer />}

        {reviewData && (
          <ReviewBlock 
            prompt={pendingPrompt}
            data={reviewData}
            onConfirm={handleConfirmSend}
            onCancel={() => {
              setPendingPrompt(null);
              setReviewData(null);
            }}
            onReload={async () => {
              // Rescan using the pending prompt
              const data = await scanPrompt(auth.token, pendingPrompt);
              setReviewData(data);
            }}
          />
        )}
      </div>

      <ChatInput onSend={handleScan} disabled={loading || !!reviewData} />

      {drawerData && (
        <MaskingDrawer
          maskData={drawerData}
          onClose={() => setDrawerData(null)}
        />
      )}
    </div>
  );
}
