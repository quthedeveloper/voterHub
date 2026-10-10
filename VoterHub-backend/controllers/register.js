import { supabase } from "../index.js";

const ROLES = ["organizer", "voter"];
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function register(req, res) {
  try {
    const { fullName, email, password, role } = req.body ?? {};

    const name = typeof fullName === "string" ? fullName.trim() : "";
    const cleanEmail = typeof email === "string" ? email.trim().toLowerCase() : "";

    // 1. Validate input (never trust the frontend)
    if (!name) return res.status(400).json({ error: "Full name is required" });
    if (!EMAIL_RE.test(cleanEmail)) return res.status(400).json({ error: "Enter a valid email address" });
    if (typeof password !== "string" || password.length < 8) {
      return res.status(400).json({ error: "Password must be at least 8 characters" });
    }
    if (!ROLES.includes(role)) return res.status(400).json({ error: "Role must be organizer or voter" });

    // 2. Create the login in Supabase Auth (it hashes the password for you)
    const { data, error: authError } = await supabase.auth.admin.createUser({
      email: cleanEmail,
      password,
      email_confirm: true, // skips the confirmation email; remove if you want verification
      user_metadata: { full_name: name, role },
    });

    if (authError) {
      const duplicate = /already|registered|exists/i.test(authError.message);
      return res
        .status(duplicate ? 409 : 400)
        .json({ error: duplicate ? "An account with this email already exists" : authError.message });
    }

    const user = data.user;

    // 3. Create the matching profiles row (upsert so a DB trigger won't clash)
    const { error: profileError } = await supabase
      .from("profiles")
      .upsert({ id: user.id, full_name: name, email: cleanEmail, role });

    if (profileError) {
      // Roll back so you don't leave a login with no profile
      await supabase.auth.admin.deleteUser(user.id);
      return res.status(500).json({ error: "Could not create your account. Please try again." });
    }

    // 4. Respond without ever sending the password back
    return res.status(201).json({
      user: { id: user.id, fullName: name, email: cleanEmail, role },
    });
  } catch (err) {
    // Anything unexpected (network failure, bad config, a thrown error)
    return res.status(500).json({ error: "Something went wrong. Please try again." });
  }
}