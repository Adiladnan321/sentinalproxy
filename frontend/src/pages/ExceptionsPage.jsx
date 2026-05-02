import { useState, useEffect, useCallback } from "react";
import { Shield, Trash2, ArrowLeft, ShieldCheck, ShieldOff, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { fetchExceptions, deleteException } from "../api/client";
import "../styles/exceptions.css";

export default function ExceptionsPage() {
  const { auth } = useAuth();
  const [exceptions, setExceptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);

  const load = useCallback(async () => {
    try {
      const data = await fetchExceptions(auth.token);
      setExceptions(data.exceptions || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [auth.token]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleDelete(value) {
    setDeleting(value);
    try {
      await deleteException(auth.token, value);
      setExceptions((prev) => prev.filter((e) => e.value !== value));
    } catch (err) {
      console.error(err);
    } finally {
      setDeleting(null);
    }
  }

  const neverMask = exceptions.filter((e) => !e.should_mask);
  const alwaysMask = exceptions.filter((e) => e.should_mask);

  return (
    <div className="exceptions-layout">
      <div className="exceptions-topbar">
        <Link to="/chat" className="exceptions-back">
          <ArrowLeft size={16} />
          <span>Back to Chat</span>
        </Link>
        <div className="exceptions-title">
          <Shield size={18} />
          <span>My Masking Rules</span>
        </div>
        <div className="exceptions-count">
          {exceptions.length} rule{exceptions.length !== 1 ? "s" : ""}
        </div>
      </div>

      <div className="exceptions-content">
        {loading ? (
          <div className="exceptions-loading">
            <Loader2 size={24} className="feedback-spinner" />
            <span>Loading your rules…</span>
          </div>
        ) : exceptions.length === 0 ? (
          <div className="exceptions-empty">
            <div className="exceptions-empty-icon">
              <ShieldCheck size={32} />
            </div>
            <h2>No custom rules yet</h2>
            <p>
              When the PII scanner masks something you'd rather keep visible
              (or vice-versa), use the feedback buttons in the masking details
              drawer to create rules. They'll appear here.
            </p>
          </div>
        ) : (
          <div className="exceptions-grid">
            {/* Never Mask section */}
            {neverMask.length > 0 && (
              <div className="exceptions-section">
                <div className="exceptions-section-header">
                  <ShieldOff size={14} />
                  <span>Never Mask</span>
                  <span className="exceptions-section-count">{neverMask.length}</span>
                </div>
                <div className="exceptions-list">
                  {neverMask.map((exc) => (
                    <div className="exception-card never-mask" key={exc.value}>
                      <div className="exception-value">{exc.value}</div>
                      <div className="exception-label">Won't be masked</div>
                      <button
                        className="exception-delete"
                        onClick={() => handleDelete(exc.value)}
                        disabled={deleting === exc.value}
                        title="Remove this rule"
                      >
                        {deleting === exc.value ? (
                          <Loader2 size={13} className="feedback-spinner" />
                        ) : (
                          <Trash2 size={13} />
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Always Mask section */}
            {alwaysMask.length > 0 && (
              <div className="exceptions-section">
                <div className="exceptions-section-header">
                  <ShieldCheck size={14} />
                  <span>Always Mask</span>
                  <span className="exceptions-section-count">{alwaysMask.length}</span>
                </div>
                <div className="exceptions-list">
                  {alwaysMask.map((exc) => (
                    <div className="exception-card always-mask" key={exc.value}>
                      <div className="exception-value">{exc.value}</div>
                      <div className="exception-label">Will always be masked</div>
                      <button
                        className="exception-delete"
                        onClick={() => handleDelete(exc.value)}
                        disabled={deleting === exc.value}
                        title="Remove this rule"
                      >
                        {deleting === exc.value ? (
                          <Loader2 size={13} className="feedback-spinner" />
                        ) : (
                          <Trash2 size={13} />
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
