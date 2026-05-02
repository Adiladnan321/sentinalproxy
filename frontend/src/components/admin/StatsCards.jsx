import { Activity, ShieldAlert, CheckCircle, Clock } from "lucide-react";

export default function StatsCards({ logs }) {
  const total = logs.length;
  const pii = logs.filter((l) => l.pii_detected).length;
  const success = logs.filter((l) => l.status === "success").length;
  const avgMs = total
    ? Math.round(logs.reduce((s, l) => s + l.response_time_ms, 0) / total)
    : 0;

  const cards = [
    {
      label: "Total Queries",
      value: total,
      icon: Activity,
      color: "var(--accent)",
      bg: "var(--accent-subtle)",
    },
    {
      label: "PII Detected",
      value: pii,
      icon: ShieldAlert,
      color: "var(--warning)",
      bg: "var(--warning-bg)",
    },
    {
      label: "Successful",
      value: success,
      icon: CheckCircle,
      color: "var(--success)",
      bg: "var(--success-bg)",
    },
    {
      label: "Avg Response (ms)",
      value: avgMs,
      icon: Clock,
      color: "var(--cyan)",
      bg: "var(--cyan-bg)",
    },
  ];

  return (
    <div className="stats-grid">
      {cards.map((c) => (
        <div
          key={c.label}
          className="stat-card"
          style={{ animationDelay: `${cards.indexOf(c) * 80}ms` }}
        >
          <div className="stat-card-header">
            <span className="stat-card-label">{c.label}</span>
            <div
              className="stat-card-icon"
              style={{ background: c.bg, color: c.color }}
            >
              <c.icon size={18} />
            </div>
          </div>
          <div className="stat-card-value" style={{ color: c.color }}>
            {c.value.toLocaleString()}
          </div>
        </div>
      ))}
    </div>
  );
}
