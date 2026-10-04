import { supabase } from "../index.js";
import { getBearerToken } from "../utils/auth.js";

// Put this in front of any route that needs a logged-in user.
// Expects the header:  Authorization: Bearer <accessToken>
// On success it sets req.user.
export async function requireAuth(req, res, next) {
  try {
    const token = getBearerToken(req);
    if (!token) return res.status(401).json({ error: "Not authenticated" });

    // Supabase verifies the signature and expiry
    const { data, error } = await supabase.auth.getUser(token);
    if (error || !data?.user) {
      return res.status(401).json({ error: "Invalid or expired token" });
    }

    req.user = data.user;
    next();
  } catch (err) {
    console.error("Auth middleware error:", err);
    return res.status(500).json({ error: "Something went wrong. Please try again." });
  }
}