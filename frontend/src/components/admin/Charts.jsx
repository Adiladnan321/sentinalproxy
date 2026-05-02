import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area,
  ResponsiveContainer,
} from "recharts";
import { BarChart3, PieChart as PieChartIcon, TrendingUp, Shield } from "lucide-react";

const COLORS = ["#6c63ff", "#06b6d4", "#22c55e", "#f59e0b", "#f43f5e", "#8b5cf6"];

const tooltipStyle = {
  contentStyle: {
    background: "#1a1a26",
    border: "1px solid #2a2a3c",
    borderRadius: "8px",
    fontSize: "12px",
    color: "#e8e8ed",
  },
};

export default function Charts({ logs }) {
  /* Queries per user */
  const userCounts = Object.entries(
    logs.reduce((acc, l) => {
      acc[l.user_id] = (acc[l.user_id] || 0) + 1;
      return acc;
    }, {})
  ).map(([user_id, count]) => ({ user_id, count }));

  /* Role distribution */
  const roleCounts = Object.entries(
    logs.reduce((acc, l) => {
      acc[l.role] = (acc[l.role] || 0) + 1;
      return acc;
    }, {})
  ).map(([name, value]) => ({ name, value }));

  /* Model usage */
  const modelCounts = Object.entries(
    logs.reduce((acc, l) => {
      acc[l.model] = (acc[l.model] || 0) + 1;
      return acc;
    }, {})
  ).map(([name, value]) => ({ name, value }));

  /* PII trend (last 10 entries) */
  const piiTrend = logs.slice(0, 20).reverse().map((l, i) => ({
    idx: i + 1,
    pii: l.pii_detected ? 1 : 0,
    responseTime: l.response_time_ms,
  }));

  return (
    <div className="charts-grid">
      {/* Queries per User */}
      <div className="chart-card">
        <div className="chart-card-title">
          <BarChart3 size={14} /> Queries per User
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={userCounts}>
            <XAxis dataKey="user_id" stroke="#5a5a72" fontSize={12} />
            <YAxis stroke="#5a5a72" fontSize={12} />
            <Tooltip {...tooltipStyle} />
            <Bar dataKey="count" fill="#6c63ff" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Role Distribution */}
      <div className="chart-card">
        <div className="chart-card-title">
          <PieChartIcon size={14} /> Role Distribution
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie
              data={roleCounts}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={80}
              label={({ name, percent }) =>
                `${name} ${(percent * 100).toFixed(0)}%`
              }
              labelLine={false}
            >
              {roleCounts.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip {...tooltipStyle} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Model Usage */}
      <div className="chart-card">
        <div className="chart-card-title">
          <TrendingUp size={14} /> Model Usage
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={modelCounts} layout="vertical">
            <XAxis type="number" stroke="#5a5a72" fontSize={12} />
            <YAxis
              dataKey="name"
              type="category"
              stroke="#5a5a72"
              fontSize={11}
              width={130}
            />
            <Tooltip {...tooltipStyle} />
            <Bar dataKey="value" fill="#06b6d4" radius={[0, 6, 6, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* PII & Response Time */}
      <div className="chart-card">
        <div className="chart-card-title">
          <Shield size={14} /> PII Detection & Response Time
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={piiTrend}>
            <XAxis dataKey="idx" stroke="#5a5a72" fontSize={12} />
            <YAxis stroke="#5a5a72" fontSize={12} />
            <Tooltip {...tooltipStyle} />
            <Area
              type="monotone"
              dataKey="responseTime"
              stroke="#8b5cf6"
              fill="rgba(139,92,246,0.15)"
              name="Response (ms)"
            />
            <Area
              type="stepAfter"
              dataKey="pii"
              stroke="#f59e0b"
              fill="rgba(245,158,11,0.1)"
              name="PII Detected"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
