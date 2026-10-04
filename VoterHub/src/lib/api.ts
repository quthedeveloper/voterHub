/*
 * Central API client for the VoterHub backend.
 *
 * - Base URL comes from VITE_API_URL, falling back to localhost for dev.
 * - The access token lives only in module memory (never localStorage).
 * - apiFetch attaches the token and retries once after a silent refresh on 401.
 */

export const API_BASE = (
  (import.meta.env.VITE_API_URL as string | undefined) || "http://localhost:4000"
).replace(/\/$/, "");

export type SessionUser = {
  id: string;
  fullName: string;
  email: string;
  role: "organizer" | "voter";
};

let accessToken: string | null = null;

export type Session = {
  accessToken: string;
  expiresIn: number;
  user: SessionUser;
};

let sessionListener: ((s: Session | null) => void) | null = null;

export function setAccessToken(token: string | null) {
  accessToken = token;
}

/** AuthContext registers here so a background refresh also updates React state. */
export function onSessionChange(cb: (s: Session | null) => void) {
  sessionListener = cb;
  return () => {
    if (sessionListener === cb) sessionListener = null;
  };
}

function notify(session: Session | null) {
  sessionListener?.(session);
}

export function homeForRole(role: SessionUser["role"]) {
  return role === "organizer" ? "/dashboard" : "/join-poll";
}

/** Silent refresh using the httpOnly cookie. Returns the new session or null. */
export async function refreshSession(): Promise<Session | null> {
  try {
    const res = await fetch(`${API_BASE}/api/refresh`, {
      method: "POST",
      credentials: "include",
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (!data?.accessToken || !data?.user) return null;
    const session: Session = {
      accessToken: data.accessToken,
      expiresIn: typeof data.expiresIn === "number" ? data.expiresIn : 3600,
      user: data.user,
    };
    setAccessToken(session.accessToken);
    notify(session);
    return session;
  } catch {
    return null;
  }
}

export function clearSession() {
  setAccessToken(null);
  notify(null);
}

/**
 * Authenticated fetch. Attaches the bearer token and, on a single 401,
 * attempts one silent refresh before retrying the request.
 */
export async function apiFetch(
  path: string,
  options: RequestInit = {},
  _retried = false
): Promise<Response> {
  const headers = new Headers(options.headers);
  if (accessToken) headers.set("Authorization", `Bearer ${accessToken}`);
  const hasBody = options.body !== undefined && options.body !== null;
  if (hasBody && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
    credentials: "include",
  });

  if (res.status === 401 && !_retried && accessToken) {
    const session = await refreshSession();
    if (session) return apiFetch(path, options, true);
  }
  return res;
}
