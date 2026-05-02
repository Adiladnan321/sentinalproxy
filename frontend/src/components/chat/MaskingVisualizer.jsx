import { ArrowRight } from "lucide-react";

export default function MaskingVisualizer({ maskData }) {
  const { mapping, masked_prompt } = maskData;
  const entries = Object.entries(mapping);
  if (entries.length === 0) return null;

  return (
    <div className="mask-viz">
      <div className="mask-viz-header">
        <span>🛡️ PII Mapping Table</span>
      </div>

      <table className="mask-viz-table">
        <thead>
          <tr>
            <th>Token</th>
            <th>Type</th>
            <th>Original Value</th>
          </tr>
        </thead>
        <tbody>
          {entries.map(([token, original]) => {
            const typeMatch = token.match(/\[\[(\w+)_\d+\]\]/);
            const entityType = typeMatch ? typeMatch[1] : "UNKNOWN";
            return (
              <tr key={token}>
                <td><span className="mask-token">{token}</span></td>
                <td style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                  {entityType}
                </td>
                <td><span className="mask-original">{original}</span></td>
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
