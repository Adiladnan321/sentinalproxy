export default function AuditTable({ logs }) {
  return (
    <div className="audit-card">
      <div className="audit-card-header">
        <span className="audit-card-title">Audit Log Feed</span>
        <span className="audit-count">{logs.length} entries</span>
      </div>
      <div style={{ overflowX: "auto" }}>
        <table className="audit-table">
          <thead>
            <tr>
              <th>Time</th>
              <th>User</th>
              <th>Role</th>
              <th>Model</th>
              <th>PII</th>
              <th>Status</th>
              <th>Response</th>
              <th>Masked Prompt</th>
            </tr>
          </thead>
          <tbody>
            {logs.slice(0, 30).map((log) => (
              <tr key={log.id}>
                <td style={{ whiteSpace: "nowrap" }}>
                  {new Date(log.timestamp).toLocaleString()}
                </td>
                <td>{log.user_id}</td>
                <td style={{ textTransform: "capitalize" }}>{log.role}</td>
                <td style={{ fontSize: "12px", fontFamily: "var(--font-mono)" }}>
                  {log.model}
                </td>
                <td>
                  <span className={`audit-badge ${log.pii_detected ? "pii-yes" : "pii-no"}`}>
                    {log.pii_detected ? "Yes" : "No"}
                  </span>
                </td>
                <td>
                  <span className={`audit-badge ${log.status === "success" ? "success" : "error"}`}>
                    {log.status === "success" ? "Success" : "Error"}
                  </span>
                </td>
                <td>{log.response_time_ms}ms</td>
                <td
                  style={{
                    maxWidth: "250px",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    fontSize: "12px",
                    fontFamily: "var(--font-mono)",
                    color: "var(--text-muted)",
                  }}
                  title={log.masked_prompt}
                >
                  {log.masked_prompt}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
