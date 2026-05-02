import { useState } from "react";
import { ThumbsUp, ThumbsDown, Check, Loader2 } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { sendFeedback } from "../../api/client";

export default function MaskingVisualizer({ maskData }) {
  const { mapping, masked_prompt } = maskData;
  const entries = Object.entries(mapping);
  const { auth } = useAuth();
  const [feedbackStates, setFeedbackStates] = useState({});

  if (entries.length === 0) return null;

  async function handleFeedback(value, shouldMask) {
    setFeedbackStates((prev) => ({ ...prev, [value]: { loading: true } }));
    try {
      await sendFeedback(auth.token, value, shouldMask);
      setFeedbackStates((prev) => ({
        ...prev,
        [value]: { saved: true, shouldMask },
      }));
    } catch {
      setFeedbackStates((prev) => ({
        ...prev,
        [value]: { error: true },
      }));
    }
  }

  return (
    <div className="mask-viz">
      <div className="mask-viz-header">
        <span> PII Mapping Table</span>
      </div>

      <table className="mask-viz-table">
        <thead>
          <tr>
            <th>Token</th>
            <th>Type</th>
            <th>Original Value</th>
            <th>Feedback</th>
          </tr>
        </thead>
        <tbody>
          {entries.map(([token, original]) => {
            const typeMatch = token.match(/\[\[(\w+)_\d+\]\]/);
            const entityType = typeMatch ? typeMatch[1] : "UNKNOWN";
            const state = feedbackStates[original];
            return (
              <tr key={token}>
                <td><span className="mask-token">{token}</span></td>
                <td style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                  {entityType}
                </td>
                <td><span className="mask-original">{original}</span></td>
                <td>
                  {state?.saved ? (
                    <span className="feedback-saved-inline">
                      <Check size={11} />
                      {state.shouldMask ? "Always mask" : "Never mask"}
                    </span>
                  ) : state?.loading ? (
                    <span className="feedback-loading-inline">
                      <Loader2 size={11} className="feedback-spinner" />
                    </span>
                  ) : (
                    <div className="feedback-inline-actions">
                      <button
                        className="feedback-btn-sm never-mask"
                        onClick={() => handleFeedback(original, false)}
                        title="Don't mask this"
                      >
                        <ThumbsDown size={10} />
                      </button>
                      <button
                        className="feedback-btn-sm always-mask"
                        onClick={() => handleFeedback(original, true)}
                        title="Always mask this"
                      >
                        <ThumbsUp size={10} />
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <div className="mask-viz-section">
        <div className="mask-viz-section-title">
          Masked Prompt Sent to LLM
        </div>
        <div className="mask-viz-prompt">{masked_prompt}</div>
      </div>
    </div>
  );
}
