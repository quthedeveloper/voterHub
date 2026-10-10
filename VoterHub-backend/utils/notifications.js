import { supabase } from "../index.js";

/**
 * Writes an in-app notification. If the `notifications` table doesn't exist
 * yet (Bryan hasn't run the SQL), this logs a warning instead of throwing,
 * so poll creation never breaks.
 */
export async function createNotification({ userId, type, title, body, pollId }) {
  try {
    const { error } = await supabase.from("notifications").insert({
      user_id: userId,
      type,
      title,
      body: body ?? null,
      poll_id: pollId ?? null,
      read: false,
    });
    if (error) throw error;
  } catch {
    // notifications table may not exist yet — skip silently
  }
}

/** Returns the profile ids for whichever of these emails have accounts. */
export async function registeredProfiles(emails) {
  if (emails.length === 0) return new Map();
  try {
    const { data, error } = await supabase.from("profiles").select("id, email").in("email", emails);
    if (error) throw error;
    return new Map((data ?? []).map((p) => [p.email.toLowerCase(), p.id]));
  } catch (err) {
    return new Map();
  }
}
