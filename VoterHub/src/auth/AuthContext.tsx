import {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback,
  type ReactNode,
} from "react";
import {
  apiFetch,
  refreshSession as silentRefresh,
  setAccessToken as setModuleToken,
  onSessionChange,
  API_BASE,
  type Session,
  type SessionUser,
} from "../lib/api";

export type User = SessionUser;

type AuthContextValue = {
  user: User | null;
  /** False until the initial session-restore attempt has finished. */
  initialized: boolean;
  login: (email: string, password: string, remember: boolean) => Promise<User>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

// Refresh a minute before the access token expires.
const REFRESH_SKEW_MS = 60 * 1000;

export function AuthProvider({ children }: { children: ReactNode }) {
  // The token itself lives in the api module (memory only, never localStorage).
  const [user, setUser] = useState<User | null>(null);
  const [initialized, setInitialized] = useState(false);
  const refreshTimer = useRef<number | null>(null);

  const clearTimer = useCallback(() => {
    if (refreshTimer.current !== null) {
      window.clearTimeout(refreshTimer.current);
      refreshTimer.current = null;
    }
  }, []);

  const applySession = useCallback(
    (session: Session | null) => {
      clearTimer();
      if (!session) {
        setModuleToken(null);
        setUser(null);
        return;
      }
      setModuleToken(session.accessToken);
      setUser(session.user);
      // Proactively refresh before the access token expires.
      const delay = Math.max(session.expiresIn * 1000 - REFRESH_SKEW_MS, 10_000);
      refreshTimer.current = window.setTimeout(() => {
        silentRefresh().then((s) => {
          if (!s) applySession(null);
          // On success, onSessionChange fires and re-arms the timer via applySession.
        });
      }, delay);
    },
    [clearTimer]
  );

  // Restore the session on page load via the httpOnly refresh cookie, and
  // keep React state in sync with background refreshes (e.g. 401 retries).
  useEffect(() => {
    let cancelled = false;
    const unsubscribe = onSessionChange((session) => {
      if (!cancelled) applySession(session);
    });
    silentRefresh().then((session) => {
      if (cancelled) return;
      applySession(session);
      setInitialized(true);
    });
    return () => {
      cancelled = true;
      unsubscribe();
      clearTimer();
    };
  }, [applySession, clearTimer]);

  async function login(email: string, password: string, remember: boolean) {
    const res = await fetch(`${API_BASE}/api/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include", // required so the browser stores the refresh cookie
      body: JSON.stringify({ email, password, remember }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Login failed");

    const session: Session = {
      accessToken: data.accessToken,
      expiresIn: data.expiresIn,
      user: data.user as User,
    };
    applySession(session);
    return session.user;
  }

  async function logout() {
    try {
      await apiFetch("/api/logout", { method: "POST" });
    } catch {
      // Logout clears local state even if the request fails.
    } finally {
      applySession(null);
    }
  }

  return (
    <AuthContext.Provider value={{ user, initialized, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
