import { useState, useEffect, useCallback } from "react";
import { fetchProfile } from "../api/client";

/**
 * Fetches and caches the user profile (models, limits).
 * Call refresh() after a chat to update queries_used_today.
 */
export function useProfile(token) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(() => {
    if (!token) return;
    setLoading(true);
    fetchProfile(token)
      .then(setProfile)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [token]);

  useEffect(() => {
    load();
  }, [load]);

  return { profile, loading, error, refresh: load };
}
