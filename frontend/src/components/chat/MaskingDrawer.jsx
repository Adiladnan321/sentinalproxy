import { X, ArrowRight, Shield, FileText, Code } from "lucide-react";

export default function MaskingDrawer({ maskData, onClose }) {
  if (!maskData) return null;

  const { mapping, masked_prompt, raw_llm_reply, model_used, pii_detected } = maskData;
  const entries = Object.entries(mapping);

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

          {/* Mapping Table */}
          {entries.length > 0 && (
            <div className="drawer-section">
              <div className="drawer-section-title">
                <Code size={14} /> Token Mapping
              </div>
              <div className="drawer-card">
                {entries.map(([token, original]) => (
                  <div className="drawer-mapping-row" key={token}>
                    <span className="mask-original">{original}</span>
                    <span className="drawer-mapping-arrow"><ArrowRight size={12} /></span>
                    <span className="mask-token">{token}</span>
                  </div>
                ))}
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
