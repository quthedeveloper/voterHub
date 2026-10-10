import { supabase } from "../index.js";
import { createAuthClient } from "../utils/auth.js";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// First origin wins if FRONTEND_URL is a comma-separated list.
const FRONTEND_URL = (process.env.FRONTEND_URL || "http://localhost:5173").split(",")[0].trim();

// Starts a password reset. Always responds 200 with the same message so the
// endpoint can never be used to find out which emails have accounts.
// NOTE: `${FRONTEND_URL}/reset-password` must be allowlisted in the Supabase
// dashboard under Authentication -> URL Configuration -> Redirect URLs.
export async function forgotPassword(req, res) {
  try {
    const email = typeof req.body?.email === "string" ? req.body.email.trim().toLowerCase() : "";
    const done = { message: "If an account exists for that email, a reset link is on its way." };
    if (!EMAIL_RE.test(email)) return res.json(done);

    await createAuthClient().auth.resetPasswordForEmail(email, {
      redirectTo: `${FRONTEND_URL}/reset-password`,
    });
    return res.json(done);
  } catch (err) {
    return res.json({ message: "If an account exists for that email, a reset link is on its way." });
  }
}

// Completes a password reset. The frontend sends the recovery access token
// that Supabase put in the email link's URL hash.
export async function resetPassword(req, res) {
  try {
    const { recoveryToken, newPassword } = req.body ?? {};

    if (typeof recoveryToken !== "string" || !recoveryToken) {
      return res.status(400).json({ error: "This reset link is invalid or has expired." });
    }
    if (typeof newPassword !== "string" || newPassword.length < 8) {
      return res.status(400).json({ error: "Password must be at least 8 characters." });
    }

    // Verify the recovery token really belongs to a user before touching anything.
    const { data, error } = await supabase.auth.getUser(recoveryToken);
    if (error || !data?.user) {
      return res.status(400).json({ error: "This reset link is invalid or has expired." });
    }

    const { error: updateError } = await supabase.auth.admin.updateUserById(data.user.id, {
      password: newPassword,
    });
    if (updateError) {
      return res.status(400).json({ error: updateError.message });
    }

    return res.json({ message: "Password updated. You can now log in." });
  } catch (err) {
    return res.status(500).json({ error: "Something went wrong. Please try again." });
  }
}

// Changes the password for the logged-in user. The current password is
// verified by re-authenticating, so a stolen session alone can't lock the
// user out of their own account.
export async function changePassword(req, res) {
  try {
    const currentPassword = req.body?.currentPassword;
    const newPassword = req.body?.newPassword;

    if (typeof newPassword !== "string" || newPassword.length < 8) {
      return res.status(400).json({ error: "New password must be at least 8 characters." });
    }
    if (typeof currentPassword !== "string" || !currentPassword) {
      return res.status(400).json({ error: "Enter your current password." });
    }
    if (newPassword === currentPassword) {
      return res.status(400).json({ error: "New password must be different from the current one." });
    }

    const email = req.user?.email;
    if (!email) return res.status(400).json({ error: "No email on this account." });

    // Re-authenticate: wrong current password fails here.
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password: currentPassword,
    });
    if (signInError) {
      return res.status(401).json({ error: "Current password is incorrect." });
    }

    const { error: updateError } = await supabase.auth.admin.updateUserById(req.user.id, {
      password: newPassword,
    });
    if (updateError) throw updateError;

    return res.json({ ok: true });
  } catch (err) {
    return res.status(500).json({ error: "Something went wrong. Please try again." });
  }
}
