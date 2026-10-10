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

/* ---------------- Polls & eligible voters ---------------- */

export type PollOption = { id: string; name: string; tagline: string | null };

export type Poll = {
  id: string;
  reference: string;
  title: string;
  description: string | null;
  question: string;
  status: string;
  oneVotePerVoter: boolean;
  requireLogin: boolean;
  showResults: boolean;
  pinRequired: boolean;
  startDate: string | null;
  endDate: string | null;
  eligibleVotersCount: number;
  open: boolean;
  options: PollOption[];
};

export type CreatePollPayload = {
  title: string;
  description?: string;
  question: string;
  options: { name: string; tagline?: string }[];
  settings: {
    oneVotePerVoter: boolean;
    requireLogin: boolean;
    showResults: boolean;
    votingPin?: string;
    startDate?: string;
    endDate?: string;
  };
  eligibleEmails: string[];
};

export type EligibleVoter = { id: string; email: string; hasVoted: boolean };

async function apiJson(path: string, options: RequestInit = {}) {
  const res = await apiFetch(path, options);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data?.error || "Something went wrong. Please try again.") as Error & {
      status: number;
    };
    err.status = res.status;
    throw err;
  }
  return data;
}

export const pollsApi = {
  create(payload: CreatePollPayload): Promise<{ poll: Poll }> {
    return apiJson("/api/polls", { method: "POST", body: JSON.stringify(payload) });
  },
  byReference(ref: string): Promise<{ poll: Poll }> {
    return apiJson(`/api/polls/reference/${encodeURIComponent(ref)}`);
  },
  byId(id: string): Promise<{ poll: Poll }> {
    return apiJson(`/api/polls/${encodeURIComponent(id)}`);
  },
  eligibility(
    id: string,
    params: { email?: string; pin?: string }
  ): Promise<{ restricted: boolean; eligible: boolean; hasVoted: boolean; needsEmail?: boolean }> {
    const q = new URLSearchParams();
    if (params.email) q.set("email", params.email);
    if (params.pin) q.set("pin", params.pin);
    return apiJson(`/api/polls/${encodeURIComponent(id)}/eligibility?${q.toString()}`);
  },
  vote(
    id: string,
    body: { optionId: string; email?: string; pin?: string; anonymousToken?: string }
  ): Promise<{ ok: boolean }> {
    return apiJson(`/api/polls/${encodeURIComponent(id)}/vote`, {
      method: "POST",
      body: JSON.stringify(body),
    });
  },
  results(id: string): Promise<{
    options: (PollOption & { votes: number; pct: number })[];
    totalVotes: number;
    eligibleVotersCount: number;
    turnoutPct: number | null;
  }> {
    return apiJson(`/api/polls/${encodeURIComponent(id)}/results`);
  },
  eligibleVoters(id: string): Promise<{ voters: EligibleVoter[]; total: number; voted: number }> {
    return apiJson(`/api/polls/${encodeURIComponent(id)}/eligible-voters`);
  },
  addEligibleVoters(id: string, emails: string[]): Promise<{ added: number; total: number }> {
    return apiJson(`/api/polls/${encodeURIComponent(id)}/eligible-voters`, {
      method: "POST",
      body: JSON.stringify({ emails }),
    });
  },
  removeEligibleVoter(id: string, evId: string): Promise<{ ok: boolean; total: number }> {
    return apiJson(`/api/polls/${encodeURIComponent(id)}/eligible-voters/${encodeURIComponent(evId)}`, {
      method: "DELETE",
    });
  },
  listMine(): Promise<{ polls: DashboardPoll[] }> {
    return apiJson("/api/polls");
  },
};

/* ---------------- Notifications ---------------- */

export type Notification = {
  id: string;
  type: string;
  title: string;
  body: string | null;
  pollId: string | null;
  pollReference: string | null;
  read: boolean;
  createdAt: string;
};

export type DashboardPoll = Omit<Poll, "options"> & {
  options: { id: string; name: string; tagline: string | null; votes: number; pct: number }[];
  totalVotes: number;
  turnoutPct: number | null;
};

export const notificationsApi = {
  list(): Promise<{ notifications: Notification[] }> {
    return apiJson("/api/notifications");
  },
  markRead(id: string): Promise<{ ok: boolean }> {
    return apiJson(`/api/notifications/${encodeURIComponent(id)}/read`, { method: "PATCH" });
  },
  markAllRead(): Promise<{ ok: boolean }> {
    return apiJson("/api/notifications/read-all", { method: "POST" });
  },
};

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
