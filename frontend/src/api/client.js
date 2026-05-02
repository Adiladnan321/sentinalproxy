const BASE = "http://localhost:8000";

/**
 * Login and return { access_token, username, role, user_id }.
 */
export async function loginApi(username, password) {
  const res = await fetch(`${BASE}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Invalid credentials");
  }
  return res.json();
}

/**
 * Fetch current user profile (models, limits, usage).
 */
export async function fetchProfile(token) {
  const res = await fetch(`${BASE}/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Failed to fetch profile");
  return res.json();
}

/**
 * Send a chat prompt. Returns reply + masking details.
 */
export async function sendChat(token, prompt, model) {
  const res = await fetch(`${BASE}/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ prompt, model }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Chat request failed");
  }
  return res.json();
}

/**
 * Fetch audit logs (admin only).
 */
export async function fetchLogs(token) {
  const res = await fetch(`${BASE}/export?fmt=json`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Failed to fetch logs");
  return res.json();
}

/**
 * Download audit logs as CSV (admin only).
 */
export async function downloadCSV(token) {
  const res = await fetch(`${BASE}/export?fmt=csv`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Failed to download CSV");
  const text = await res.text();

  const blob = new Blob([text], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "sentinel_audit.csv";
  a.click();
  URL.revokeObjectURL(url);
}
