import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Shield,
  AlertCircle,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  Cpu,
  BarChart3,
} from "lucide-react";
import { loginApi } from "../api/client";
import { useAuth } from "../context/AuthContext";
import "../styles/login.css";

/* ── Animated masking demo data ──────────────────────────── */
const DEMO_LINES = [
  {
    original: 'Send report to john.doe@acme.com',
    masked:   'Send report to [[EMAIL_ADDRESS_1]]',
    entity:   'EMAIL_ADDRESS',
  },
  {
    original: 'Call Sarah at +1-555-0199 tomorrow',
    masked:   'Call [[PERSON_1]] at [[PHONE_NUMBER_1]] tomorrow',
    entity:   'PERSON, PHONE',
  },
  {
    original: 'Invoice for James Wilson, card 4111-XXXX',
    masked:   'Invoice for [[PERSON_1]], card [[CREDIT_CARD_1]]',
    entity:   'PERSON, CREDIT_CARD',
  },
];

function MaskingDemo() {
  const [activeIdx, setActiveIdx] = useState(0);
  const [phase, setPhase] = useState("original"); // original → scanning → masked

  useEffect(() => {
    const cycle = () => {
      setPhase("original");
      const t1 = setTimeout(() => setPhase("scanning"), 1500);
      const t2 = setTimeout(() => setPhase("masked"), 3000);
      const t3 = setTimeout(() => {
        setActiveIdx((i) => (i + 1) % DEMO_LINES.length);
      }, 5000);
      return [t1, t2, t3];
    };

    const timers = cycle();
    const interval = setInterval(() => {
      cycle();
    }, 5000);

    return () => {
      timers.forEach(clearTimeout);
      clearInterval(interval);
    };
  }, [activeIdx]);

  const line = DEMO_LINES[activeIdx];

  return (
    <div className="hero-demo">
      <div className="hero-demo-label">
        <span className={`hero-demo-phase ${phase}`}>
          {phase === "original" && "Raw Prompt"}
          {phase === "scanning" && "Scanning PII…"}
          {phase === "masked" && "Masked Output"}
        </span>
      </div>
      <div className={`hero-demo-text ${phase}`}>
        <code>{phase === "masked" ? line.masked : line.original}</code>
        {phase === "scanning" && <div className="hero-demo-scanline" />}
      </div>
      {phase === "masked" && (
        <div className="hero-demo-entity">
          <ShieldCheck size={12} />
          Detected: {line.entity}
        </div>
      )}
    </div>
  );
}

/* ── Login Page ──────────────────────────────────────────── */

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await loginApi(username, password);
      login(data);
      navigate("/chat");
    } catch (err) {
      setError(err.message || "Invalid username or password");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-page">
      {/* ── Left: Hero ──────────────────────────────── */}
      <div className="login-hero">
        <div className="login-hero-bg" />

        <div className="login-hero-content">
          <div className="login-hero-badge">
            <Shield size={14} />
            Privacy-First AI Proxy
          </div>

          <h1 className="login-hero-title">
            Your prompts.
            <br />
            <span>Their privacy.</span>
          </h1>

          <p className="login-hero-subtitle">
            SentinelProxy intercepts every prompt, detects personally
            identifiable information using NLP, and replaces it with
            deterministic tokens before it ever reaches the LLM.
          </p>

          <MaskingDemo />

          <div className="login-hero-features">
            <div className="login-hero-feature">
              <div className="login-hero-feature-icon" style={{ background: "var(--accent-subtle)", color: "var(--accent)" }}>
                <ShieldCheck size={18} />
              </div>
              <div>
                <strong>PII Masking</strong>
                <span>Names, emails, phones, cards — masked in real time</span>
              </div>
            </div>
            <div className="login-hero-feature">
              <div className="login-hero-feature-icon" style={{ background: "var(--cyan-bg)", color: "var(--cyan)" }}>
                <Cpu size={18} />
              </div>
              <div>
                <strong>Role-Based Models</strong>
                <span>Each role gets access to specific Gemini models</span>
              </div>
            </div>
            <div className="login-hero-feature">
              <div className="login-hero-feature-icon" style={{ background: "var(--amber-bg)", color: "var(--amber)" }}>
                <BarChart3 size={18} />
              </div>
              <div>
                <strong>Audit Dashboard</strong>
                <span>Full observability with charts and CSV export</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Right: Login Form ───────────────────────── */}
      <div className="login-right">
        <form className="login-card" onSubmit={handleSubmit}>
          <div className="login-brand">
            <div className="login-brand-icon">
              <Shield size={24} />
            </div>
            <h2>Welcome back</h2>
            <p>Sign in to SentinelProxy</p>
          </div>

          <div className="login-field">
            <label htmlFor="login-username">Username</label>
            <input
              id="login-username"
              className="login-input"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoFocus
            />
          </div>

          <div className="login-field">
            <label htmlFor="login-password">Password</label>
            <div className="login-input-wrap">
              <input
                id="login-password"
                className="login-input"
                type={showPw ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                className="login-pw-toggle"
                onClick={() => setShowPw((v) => !v)}
                tabIndex={-1}
              >
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {error && (
            <div className="login-error">
              <AlertCircle size={14} />
              {error}
            </div>
          )}

          <button
            id="login-submit"
            className="login-btn"
            type="submit"
            disabled={loading || !username || !password}
          >
            {loading ? "Authenticating…" : "Sign In"}
            {!loading && <ArrowRight size={16} />}
          </button>

          <div className="login-footer">
            <Lock size={11} />
            Protected by role-based access control
          </div>
        </form>
      </div>
    </div>
  );
}
