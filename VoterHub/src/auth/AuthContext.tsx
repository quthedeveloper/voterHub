import { createContext, useContext, useState, type ReactNode } from "react";

export type User = {
  id: string;
  fullName: string;
  email: string;
  role: "organizer" | "voter";
};

type LoginResponse = {
  accessToken: string;
  expiresIn: number;
  user: User;
};

type AuthContextValue = {
  user: User | null;
  accessToken: string | null;
  login: (email: string, password: string, remember: boolean) => Promise<User>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  // Lives only in memory. Wiped on refresh/new tab — that's expected,
  // since restoring it after a refresh is what /api/auth/refresh is for.
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);

  async function login(email: string, password: string, remember: boolean) {
    const res = await fetch("http://localhost:4000/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include", // required so the browser stores the refresh cookie
      body: JSON.stringify({ email, password, remember }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Login failed");

    const { accessToken: token, user: loggedInUser } = data as LoginResponse;

    setAccessToken(token);
    setUser(loggedInUser);

    return loggedInUser;
  }

  async function logout() {
    if (accessToken) {
      await fetch("http://localhost:4000/api/logout", {
        method: "POST",
        headers: { Authorization: `Bearer ${accessToken}` },
      }).catch(() => {}); // logout should still clear local state even if this fails
    }
    setAccessToken(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, accessToken, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}