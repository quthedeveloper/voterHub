import { supabase } from "../index.js";

function shape(n) {
  return {
    id: n.id,
    type: n.type,
    title: n.title,
    body: n.body,
    pollId: n.poll_id,
    pollReference: n.polls?.reference ?? null,
    read: !!n.read,
    createdAt: n.created_at,
  };
}

async function tableMissing() {
  // Probe once: if the notifications table doesn't exist yet, all
  // endpoints degrade gracefully instead of 500ing.
  const { error } = await supabase.from("notifications").select("id", { head: true, count: "exact" }).limit(1);
  return !!error;
}

// GET /api/notifications
export async function listNotifications(req, res) {
  try {
    if (await tableMissing()) return res.json({ notifications: [] });
    const { data, error } = await supabase
      .from("notifications")
      .select("id, type, title, body, poll_id, read, created_at, polls(reference)")
      .eq("user_id", req.user.id)
      .order("created_at", { ascending: false })
      .limit(50);
    if (error) throw error;
    return res.json({ notifications: (data ?? []).map(shape) });
  } catch (err) {
    return res.status(500).json({ error: "Something went wrong. Please try again." });
  }
}

// PATCH /api/notifications/:id/read
export async function markRead(req, res) {
  try {
    if (await tableMissing()) return res.json({ ok: true });
    const { error } = await supabase
      .from("notifications")
      .update({ read: true })
      .eq("id", req.params.id)
      .eq("user_id", req.user.id);
    if (error) throw error;
    return res.json({ ok: true });
  } catch (err) {
    return res.status(500).json({ error: "Something went wrong. Please try again." });
  }
}

// POST /api/notifications/read-all
export async function markAllRead(req, res) {
  try {
    if (await tableMissing()) return res.json({ ok: true });
    const { error } = await supabase
      .from("notifications")
      .update({ read: true })
      .eq("user_id", req.user.id)
      .eq("read", false);
    if (error) throw error;
    return res.json({ ok: true });
  } catch (err) {
    return res.status(500).json({ error: "Something went wrong. Please try again." });
  }
}
