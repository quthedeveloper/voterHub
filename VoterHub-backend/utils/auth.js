import { createClient } from "@supabase/supabase-js";

const isProd = process.env.NODE_ENV === "production";
const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000;

// A fresh client per call. Signing in on your shared service-role client
// would swap its credentials and break your other queries.
export const createAuthClient = () =>
  createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

// The refresh cookie is scoped to /api so the browser sends it back to
// /api/refresh (and only to API routes, never to other paths).
const REFRESH_COOKIE_PATH = "/api";

const cookieBase = {
  httpOnly: true,
  secure: isProd,
  sameSite: "lax",
  path: REFRESH_COOKIE_PATH,
};

export function setRefreshCookie(res, refreshToken, remember = true) {
  const persistent = { maxAge: THIRTY_DAYS };

  res.cookie("refresh_token", refreshToken, { ...cookieBase, ...persistent });
  res.cookie("remember", remember ? "1" : "0", { ...cookieBase, ...persistent });
}

export function clearRefreshCookie(res) {
  res.clearCookie("refresh_token", cookieBase);
  res.clearCookie("remember", cookieBase);
}

// Reads "Authorization: Bearer <token>" and returns just the token
export function getBearerToken(req) {
  const [scheme, token] = (req.headers.authorization ?? "").split(" ");
  return scheme === "Bearer" && token ? token : null;
}