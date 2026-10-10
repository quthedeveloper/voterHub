import { supabase } from "../index.js";
import { requireAuth } from "./requireAuth.js";

// requireAuth first, then confirms the user has the organizer role.
// On success sets req.profile = { id, role }.
export function requireOrganizer(req, res, next) {
  requireAuth(req, res, async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, role, full_name")
        .eq("id", req.user.id)
        .single();

      if (error || !data || data.role !== "organizer") {
        return res.status(403).json({ error: "Organizer access required" });
      }
      req.profile = data;
      next();
    } catch (err) {
      console.error("Organizer middleware error:", err);
      return res.status(500).json({ error: "Something went wrong. Please try again." });
    }
  });
}
