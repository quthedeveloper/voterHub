import { supabase } from "../index.js";
import {
  createAuthClient,
  setRefreshCookie,
  clearRefreshCookie,
  getBearerToken,
} from "../utils/auth.js";

// Looks up the profile row and shapes it for the frontend
async function getProfile(userId) {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name, email, role")
    .eq("id", userId)
    .single();

  if (error) throw error;

  return { id: data.id, fullName: data.full_name, email: data.email, role: data.role };
}

export async function login(req, res) {
  try {
    const { email, password, remember = true } = req.body ?? {};
    const cleanEmail = typeof email === "string" ? email.trim().toLowerCase() : "";

    if (!cleanEmail || typeof password !== "string" || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    // Supabase checks the password and issues the access + refresh tokens
    const { data, error } = await createAuthClient().auth.signInWithPassword({
      email: cleanEmail,
      password,
    });

    if (error || !data.session) {
      // Same message for a wrong email or a wrong password, so nobody can
      // use this endpoint to find out which emails have accounts
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const user = await getProfile(data.user.id);

    // Refresh token -> httpOnly cookie. Access token -> JSON body.
    setRefreshCookie(res, data.session.refresh_token, Boolean(remember));

    console.log(`User ${user.email} logged in (remember=${Boolean(remember)})`);
    return res.json({
      accessToken: data.session.access_token,
      expiresIn: data.session.expires_in, // seconds
      user,
    });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ error: "Something went wrong. Please try again." });
  }
}

// Swaps the refresh cookie for a new access token.
// The frontend calls this on page load and whenever the access token expires.
export async function refresh(req, res) {
  try {
    const refreshToken = req.cookies.refresh_token;
    if (!refreshToken) return res.status(401).json({ error: "Not authenticated" });

    const { data, error } = await createAuthClient().auth.refreshSession({
      refresh_token: refreshToken,
    });

    if (error || !data.session) {
      clearRefreshCookie(res);
      return res.status(401).json({ error: "Session expired. Please log in again." });
    }

    // Supabase rotates refresh tokens: the old one is now dead, so save the new one
    setRefreshCookie(res, data.session.refresh_token, req.cookies.remember === "1");

    return res.json({
      accessToken: data.session.access_token,
      expiresIn: data.session.expires_in,
      user: await getProfile(data.user.id),
    });
  } catch (err) {
    console.error("Refresh error:", err);
    return res.status(500).json({ error: "Something went wrong. Please try again." });
  }
}

export async function logout(req, res) {
  try {
    // Revoke this session on Supabase's side if we were sent a valid access token
    const accessToken = getBearerToken(req);
    if (accessToken) await supabase.auth.admin.signOut(accessToken, "local");
  } catch (err) {
    console.error("Logout error:", err);
  } finally {
    clearRefreshCookie(res);
    res.json({ message: "Logged out" });
  }
}

// Returns the logged-in user's profile (requireAuth runs first and sets req.user)
export async function me(req, res) {
  try {
    return res.json({ user: await getProfile(req.user.id) });
  } catch (err) {
    console.error("Me error:", err);
    return res.status(500).json({ error: "Something went wrong. Please try again." });
  }
}