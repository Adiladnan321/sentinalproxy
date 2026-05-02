import { Link } from "react-router-dom";
import { LogOut, LayoutDashboard, Zap } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import ModelSelector from "./ModelSelector";

export default function TopBar({ profile, selectedModel, onModelChange }) {
  const { auth, logout } = useAuth();

  const limitText =
    profile?.query_limit === -1
      ? "Unlimited"
      : `${profile?.queries_used_today ?? 0} / ${profile?.query_limit ?? 0}`;

  return (
    <div className="topbar">
      <div className="topbar-left">
        <div className="topbar-brand">
          <div className="topbar-brand-dot" />
          SentinelProxy
        </div>
        <div className="topbar-divider" />
        {profile && (
          <ModelSelector
            models={profile.allowed_models}
            selected={selectedModel}
            onSelect={onModelChange}
          />
        )}
      </div>

      <div className="topbar-right">
        <div className="topbar-limit" title="Daily query usage">
          <Zap size={12} />
          <span className="topbar-limit-count">{limitText}</span>
          <span>queries</span>
        </div>

        {auth?.role === "admin" && (
          <Link to="/admin" className="topbar-admin-btn">
            <LayoutDashboard size={14} />
            Dashboard
          </Link>
        )}

        <div className="topbar-profile">
          <div className="topbar-avatar">
            {auth?.username?.charAt(0) || "?"}
          </div>
          <div className="topbar-user-info">
            <span className="topbar-username">{auth?.username}</span>
            <span className="topbar-role">{auth?.role}</span>
          </div>
        </div>

        <button
          id="logout-btn"
          className="topbar-logout"
          onClick={logout}
          title="Sign out"
        >
          <LogOut size={16} />
        </button>
      </div>
    </div>
  );
}
