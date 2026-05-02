import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Download, Loader, RefreshCw } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { fetchLogs, downloadCSV } from "../api/client";
import StatsCards from "../components/admin/StatsCards";
import Charts from "../components/admin/Charts";
import AuditTable from "../components/admin/AuditTable";
import "../styles/admin.css";

export default function AdminPage() {
  const { auth } = useAuth();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  function loadLogs() {
    setLoading(true);
    fetchLogs(auth.token)
      .then(setLogs)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadLogs();
    const interval = setInterval(() => {
      fetchLogs(auth.token).then(setLogs).catch(() => {});
    }, 15000);
    return () => clearInterval(interval);
  }, [auth.token]);

  if (loading && logs.length === 0) {
    return (
      <div className="admin-layout">
        <AdminHeader auth={auth} />
        <div className="admin-loading">
          <Loader size={18} className="spinning" /> Loading dashboard…
        </div>
      </div>
    );
  }

  if (error && logs.length === 0) {
    return (
      <div className="admin-layout">
        <AdminHeader auth={auth} />
        <div className="admin-error">{error}</div>
      </div>
    );
  }

  return (
    <div className="admin-layout">
      <AdminHeader
        auth={auth}
        onExport={() => downloadCSV(auth.token)}
        onRefresh={loadLogs}
      />
      <div className="admin-body">
        <StatsCards logs={logs} />
        <Charts logs={logs} />
        <AuditTable logs={logs} />
      </div>
    </div>
  );
}

function AdminHeader({ auth, onExport, onRefresh }) {
  return (
    <div className="admin-header">
      <div className="admin-header-left">
        <Link to="/chat" className="admin-back-btn">
          <ArrowLeft size={14} /> Back to Chat
        </Link>
        <span className="admin-title">Admin Dashboard</span>
      </div>
      <div style={{ display: "flex", gap: "8px" }}>
        {onRefresh && (
          <button className="admin-export-btn" onClick={onRefresh} style={{ background: "var(--bg-tertiary)", color: "var(--text-secondary)", border: "1px solid var(--border-default)" }}>
            <RefreshCw size={14} /> Refresh
          </button>
        )}
        {onExport && (
          <button id="export-csv" className="admin-export-btn" onClick={onExport}>
            <Download size={14} /> Export CSV
          </button>
        )}
      </div>
    </div>
  );
}
