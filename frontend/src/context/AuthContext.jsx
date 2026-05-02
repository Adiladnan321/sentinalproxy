import { createContext, useContext, useState, useCallback } from "react";

const AuthContext = createContext(null);

/**
 * Provides auth state (token, user info) to the whole app.
 * Stores in sessionStorage so a refresh doesn't lose state.
 */
export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(() => {
    const stored = sessionStorage.getItem("sp_auth");
    return stored ? JSON.parse(stored) : null;
  });

  const login = useCallback((data) => {
    const payload = {
      token: data.access_token,
      username: data.username,
      role: data.role,
      userId: data.user_id,
    };
    sessionStorage.setItem("sp_auth", JSON.stringify(payload));
    setAuth(payload);
  }, []);

  const logout = useCallback(() => {
    sessionStorage.removeItem("sp_auth");
    setAuth(null);
  }, []);

  return (
    <AuthContext.Provider value={{ auth, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
