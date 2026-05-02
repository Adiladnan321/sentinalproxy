import { useState } from "react";
import { X, ArrowRight, Shield, FileText, Code, ThumbsUp, ThumbsDown, Check, Loader2 } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { sendFeedback } from "../../api/client";

export default function MaskingDrawer({ maskData, onClose }) {
  if (!maskData) return null;

  const { auth } = useAuth();
  const { mapping, masked_prompt, raw_llm_reply, model_used, pii_detected } = maskData;
  const entries = Object.entries(mapping);

  const [feedbackStates, setFeedbackStates] = useState({});

  async function handleFeedback(value, shouldMask) {
    const key = value;
    setFeedbackStates((prev) => ({ ...prev, [key]: { loading: true } }));
    try {
      await sendFeedback(auth.token, value, shouldMask);
      setFeedbackStates((prev) => ({
        ...prev,
        [key]: { saved: true, shouldMask },
      }));
    } catch {
      setFeedbackStates((prev) => ({
        ...prev,
        [key]: { error: true },
      }));
    }
  }

  return (
    <>
      <div className="drawer-overlay" onClick={onClose} />
      <div className="drawer">
        <div className="drawer-header">
          <div className="drawer-title">🛡️ Masking Details</div>
          <button className="drawer-close" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <div className="drawer-body">
          {/* Summary */}
          <div className="drawer-section">
            <div className="drawer-section-title">
              <Shield size={14} /> Summary
            </div>
            <div className="drawer-card">
              <div style={{ display: "flex", flexDirection: "column", gap: "8px", fontSize: "13px" }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "var(--text-muted)" }}>Model</span>
                  <span style={{ color: "var(--text-primary)", fontWeight: 600 }}>{model_used}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "var(--text-muted)" }}>PII Detected</span>
                  <span style={{ color: pii_detected ? "var(--warning)" : "var(--success)", fontWeight: 600 }}>
                    {pii_detected ? "Yes" : "No"}
                  </span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "var(--text-muted)" }}>Entities Masked</span>
                  <span style={{ color: "var(--accent)", fontWeight: 600 }}>{entries.length}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Mapping Table with Feedback */}
          {entries.length > 0 && (
            <div className="drawer-section">
              <div className="drawer-section-title">
                <Code size={14} /> Token Mapping & Feedback
              </div>
              <div className="drawer-card">
                {entries.map(([token, original]) => {
                  const state = feedbackStates[original];
                  return (
                    <div className="drawer-mapping-row-feedback" key={token}>
                      <div className="drawer-mapping-top">
                        <span className="mask-original">{original}</span>
                        <span className="drawer-mapping-arrow"><ArrowRight size={12} /></span>
                        <span className="mask-token">{token}</span>
                      </div>
                      <div className="drawer-feedback-actions">
                        {state?.saved ? (
                          <div className="feedback-saved">
                            <Check size={12} />
                            <span>
                              {state.shouldMask
                                ? "Will always mask"
                                : "Won't mask next time"}
                            </span>
                          </div>
                        ) : state?.loading ? (
                          <div className="feedback-loading">
                            <Loader2 size={12} className="feedback-spinner" />
                            <span>Saving…</span>
                          </div>
                        ) : state?.error ? (
                          <div className="feedback-error">
                            <span>Failed — try again</span>
                          </div>
                        ) : (
                          <>
                            <button
                              className="feedback-btn never-mask"
                              onClick={() => handleFeedback(original, false)}
                              title="Don't mask this value in future prompts"
                            >
                              <ThumbsDown size={11} />
                              <span>Don't Mask</span>
                            </button>
                            <button
                              className="feedback-btn always-mask"
                              onClick={() => handleFeedback(original, true)}
                              title="Always mask this value"
                            >
                              <ThumbsUp size={11} />
                              <span>Always Mask</span>
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Masked Prompt */}
          <div className="drawer-section">
            <div className="drawer-section-title">
              <FileText size={14} /> Masked Prompt
            </div>
            <div className="drawer-code-block">{masked_prompt}</div>
          </div>

          {/* Raw LLM Reply */}
          <div className="drawer-section">
            <div className="drawer-section-title">
              <FileText size={14} /> Raw LLM Reply (Before Restore)
            </div>
            <div className="drawer-code-block">{raw_llm_reply}</div>
          </div>
        </div>
      </div>
    </>
  );
}
