import { useState } from "react";
import { ShieldCheck, ShieldAlert, Cpu, Eye, EyeOff } from "lucide-react";
import MaskingVisualizer from "./MaskingVisualizer";

export default function MessageBubble({ message, onOpenDrawer }) {
  const { role, text, maskData } = message;
  const [showMasked, setShowMasked] = useState(false);
  const isUser = role === "user";

  return (
    <div className={`message-row ${isUser ? "user" : "assistant"}`}>
      <div className="message-inner">
        <div className={`message-avatar ${isUser ? "user" : "assistant"}`}>
          {isUser ? "U" : "S"}
        </div>
        <div className="message-content">
          <div className="message-text">
            {showMasked && maskData ? maskData.raw_llm_reply : text}
          </div>

          {/* Meta badges for assistant messages */}
          {!isUser && maskData && (
            <>
              <div className="message-meta">
                {maskData.pii_detected ? (
                  <span className="message-badge pii">
                    <ShieldAlert size={12} /> PII Detected & Masked
                  </span>
                ) : (
                  <span className="message-badge safe">
                    <ShieldCheck size={12} /> No PII Found
                  </span>
                )}
                <span className="message-badge model">
                  <Cpu size={12} /> {maskData.model_used}
                </span>

                {maskData.pii_detected && (
                  <>
                    <button
                      className="mask-toggle-btn"
                      onClick={() => setShowMasked((v) => !v)}
                    >
                      {showMasked ? (
                        <><EyeOff size={12} /> Hide Raw</>
                      ) : (
                        <><Eye size={12} /> Show Raw LLM Reply</>
                      )}
                    </button>
                    <button
                      className="mask-toggle-btn"
                      onClick={() => onOpenDrawer(maskData)}
                    >
                      <Eye size={12} /> Masking Details
                    </button>
                  </>
                )}
              </div>

              {/* Inline visualizer */}
              {maskData.pii_detected && Object.keys(maskData.mapping).length > 0 && (
                <MaskingVisualizer maskData={maskData} />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
