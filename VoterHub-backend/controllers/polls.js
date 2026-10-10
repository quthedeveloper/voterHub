import { randomUUID } from "crypto";
import { supabase } from "../index.js";
import { createNotification, registeredProfiles } from "../utils/notifications.js";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_INVITES = 5000;

const cleanEmail = (v) => (typeof v === "string" ? v.trim().toLowerCase() : "");
const isEmail = (v) => EMAIL_RE.test(v);

/** Normalizes, validates, and dedupes a raw email list. */
function normalizeEmails(raw) {
  const seen = new Set();
  const out = [];
  for (const item of Array.isArray(raw) ? raw : []) {
    const email = cleanEmail(item);
    if (!email || !isEmail(email) || seen.has(email)) continue;
    seen.add(email);
    out.push(email);
    if (out.length >= MAX_INVITES) break;
  }
  return out;
}

function generateReference() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let suffix = "";
  for (let i = 0; i < 4; i++) suffix += chars[Math.floor(Math.random() * chars.length)];
  return `VTH-${new Date().getFullYear()}-${suffix}`;
}

async function getPoll(id) {
  const { data, error } = await supabase.from("polls").select("*").eq("id", id).single();
  if (error) return null;
  return data;
}

async function getOptions(pollId) {
  const { data, error } = await supabase
    .from("Poll_Options")
    .select("id, name, tagline, display_order")
    .eq("poll_id", pollId)
    .order("display_order", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

/** Public shape of a poll: never leaks the PIN value or the invite list. */
function shapePoll(poll, options) {
  return {
    id: poll.id,
    reference: poll.reference,
    title: poll.title,
    description: poll.description,
    question: poll.question,
    status: poll.status,
    oneVotePerVoter: !!poll.one_vote_per_voter,
    requireLogin: !!poll.require_login,
    showResults: !!poll.show_results,
    pinRequired: !!poll.voting_pin,
    startDate: poll.start_date,
    endDate: poll.end_date,
    eligibleVotersCount: Number(poll.eligible_voters_count ?? 0),
    createdAt: poll.created_at ?? null,
    open: isPollOpen(poll),
    options: (options ?? []).map((o) => ({ id: o.id, name: o.name, tagline: o.tagline })),
  };
}

function isPollOpen(poll) {
  if (!poll) return false;
  if (poll.status !== "active" && poll.status !== "open") return false;
  const now = Date.now();
  if (poll.start_date) {
    const start = new Date(poll.start_date).getTime();
    if (!Number.isNaN(start) && now < start) return false;
  }
  if (poll.end_date) {
    const end = new Date(poll.end_date).getTime();
    if (!Number.isNaN(end) && now > end) return false;
  }
  return true;
}

function checkPin(poll, pin) {
  if (!poll.voting_pin) return true;
  return typeof pin === "string" && pin === poll.voting_pin;
}

/**
 * Drops an in-app notification for every invitee who already has an account.
 * Fire-and-forget: never blocks or breaks the request that triggered it.
 */
async function notifyInvitees({ poll, organizerName, emails }) {
  try {
    const registered = await registeredProfiles(emails);
    await Promise.allSettled(
      [...registered.entries()].map(async ([email, userId]) => {
        await createNotification({
          userId,
          type: "poll_invite",
          title: "New poll invite",
          body: `${organizerName} invited you to vote in "${poll.title}" (ref ${poll.reference}).`,
          pollId: poll.id,
        });
      })
    );
  } catch (err) {
    console.error("Invite notification error:", err);
  }
}

// POST /api/polls — organizer creates a poll with options and an invite list.
export async function createPoll(req, res) {
  try {
    const { title, description, question, options, settings, eligibleEmails } = req.body ?? {};

    const cleanTitle = typeof title === "string" ? title.trim() : "";
    const cleanQuestion = typeof question === "string" ? question.trim() : "";
    if (!cleanTitle || cleanTitle.length > 120) {
      return res.status(400).json({ error: "A poll title (max 120 characters) is required." });
    }
    if (!cleanQuestion || cleanQuestion.length > 300) {
      return res.status(400).json({ error: "A poll question (max 300 characters) is required." });
    }

    const cleanOptions = (Array.isArray(options) ? options : [])
      .map((o) => ({
        name: typeof o?.name === "string" ? o.name.trim() : typeof o === "string" ? o.trim() : "",
        tagline: typeof o?.tagline === "string" ? o.tagline.trim().slice(0, 140) : null,
      }))
      .filter((o) => o.name.length > 0 && o.name.length <= 80)
      .slice(0, 20);
    if (cleanOptions.length < 2) {
      return res.status(400).json({ error: "Add at least two options." });
    }

    const s = settings ?? {};
    const votingPin = typeof s.votingPin === "string" && s.votingPin.trim() ? s.votingPin.trim().slice(0, 20) : null;
    const emails = normalizeEmails(eligibleEmails);

    // Reference must be unique; retry a few times on the (unlikely) collision.
    let reference = null;
    for (let i = 0; i < 5 && !reference; i++) {
      const candidate = generateReference();
      const { data } = await supabase.from("polls").select("id").eq("reference", candidate).limit(1);
      if (!data || data.length === 0) reference = candidate;
    }
    if (!reference) return res.status(500).json({ error: "Could not generate a poll reference. Try again." });

    const pollId = randomUUID();
    const { error: pollError } = await supabase.from("polls").insert({
      id: pollId,
      reference,
      creator_id: req.profile.id,
      title: cleanTitle,
      description: typeof description === "string" ? description.trim().slice(0, 2000) || null : null,
      question: cleanQuestion,
      status: "active",
      one_vote_per_voter: s.oneVotePerVoter !== false,
      require_login: !!s.requireLogin,
      show_results: s.showResults !== false,
      voting_pin: votingPin,
      start_date: typeof s.startDate === "string" && s.startDate ? s.startDate : null,
      end_date: typeof s.endDate === "string" && s.endDate ? s.endDate : null,
      eligible_voters_count: emails.length,
      created_at: new Date().toISOString(),
    });
    if (pollError) throw pollError;

    try {
      const { error: optError } = await supabase.from("Poll_Options").insert(
        cleanOptions.map((o, i) => ({
          id: randomUUID(),
          poll_id: pollId,
          name: o.name,
          tagline: o.tagline,
          display_order: i,
        }))
      );
      if (optError) throw optError;

      if (emails.length > 0) {
        // IDs are UUID strings so they also fit the uuid-typed Votes.voter_id column.
        const { error: evError } = await supabase.from("eligible_voters").insert(
          emails.map((email) => ({ id: randomUUID(), poll_id: pollId, email, has_voted: false }))
        );
        if (evError) throw evError;
      }
    } catch (err) {
      // Best-effort rollback so a half-created poll never lingers.
      await supabase.from("polls").delete().eq("id", pollId);
      throw err;
    }

    const poll = await getPoll(pollId);
    const shaped = shapePoll(poll, await getOptions(pollId));

    if (emails.length > 0) {
      // Don't hold up the response waiting on notifications.
      notifyInvitees({
        poll: shaped,
        organizerName: req.profile.full_name || "An organizer",
        emails,
      }).catch((err) => console.error("Invite notification error:", err));
    }

    return res.status(201).json({ poll: shaped });
  } catch (err) {
    console.error("Create poll error:", err);
    return res.status(500).json({ error: "Something went wrong. Please try again." });
  }
}

// GET /api/polls/reference/:ref — public poll lookup for the join flow.
export async function getPollByReference(req, res) {
  try {
    const ref = typeof req.params.ref === "string" ? req.params.ref.trim() : "";
    if (!ref) return res.status(400).json({ error: "A poll reference is required." });
    const { data, error } = await supabase.from("polls").select("*").eq("reference", ref).single();
    if (error || !data) return res.status(404).json({ error: "No poll found with that reference." });
    return res.json({ poll: shapePoll(data, await getOptions(data.id)) });
  } catch (err) {
    console.error("Get poll error:", err);
    return res.status(500).json({ error: "Something went wrong. Please try again." });
  }
}

// GET /api/polls/:id — public poll + options (no PIN, no invite list).
export async function getPollPublic(req, res) {
  try {
    const poll = await getPoll(req.params.id);
    if (!poll) return res.status(404).json({ error: "Poll not found." });
    return res.json({ poll: shapePoll(poll, await getOptions(poll.id)) });
  } catch (err) {
    console.error("Get poll error:", err);
    return res.status(500).json({ error: "Something went wrong. Please try again." });
  }
}

// GET /api/polls/:id/eligibility?email=&pin= — can this email vote right now?
export async function checkEligibility(req, res) {
  try {
    const poll = await getPoll(req.params.id);
    if (!poll) return res.status(404).json({ error: "Poll not found." });
    if (!isPollOpen(poll)) return res.status(403).json({ error: "This poll is not open for voting." });
    if (!checkPin(poll, req.query.pin)) return res.status(403).json({ error: "Incorrect PIN." });

    const restricted = Number(poll.eligible_voters_count ?? 0) > 0;
    if (!restricted) return res.json({ restricted: false, eligible: true, hasVoted: false });

    const email = cleanEmail(req.query.email);
    if (!email) {
      // Step 1 of the join flow probes PIN/open status before the voter has
      // typed an email. Don't fail here — just say the email is still needed.
      return res.json({ restricted: true, eligible: false, hasVoted: false, needsEmail: true });
    }
    if (!isEmail(email)) {
      return res.status(400).json({ error: "Enter a valid email address." });
    }
    const { data } = await supabase
      .from("eligible_voters")
      .select("id, has_voted")
      .eq("poll_id", poll.id)
      .eq("email", email)
      .single();

    if (!data) return res.json({ restricted: true, eligible: false, hasVoted: false });
    return res.json({ restricted: true, eligible: true, hasVoted: !!data.has_voted });
  } catch (err) {
    console.error("Eligibility check error:", err);
    return res.status(500).json({ error: "Something went wrong. Please try again." });
  }
}

// POST /api/polls/:id/vote — casts a ballot. The server enforces every rule.
export async function castVote(req, res) {
  try {
    const poll = await getPoll(req.params.id);
    if (!poll) return res.status(404).json({ error: "Poll not found." });
    if (!isPollOpen(poll)) return res.status(403).json({ error: "This poll is not open for voting." });
    if (!checkPin(poll, req.body?.pin)) return res.status(403).json({ error: "Incorrect PIN." });

    const { optionId } = req.body ?? {};
    const options = await getOptions(poll.id);
    const option = options.find((o) => o.id === optionId);
    if (!option) return res.status(400).json({ error: "Choose a valid option." });

    // Who's calling? The join UI blocks anonymous voters for login-required
    // polls, but the rule has to be enforced here too — this endpoint is public.
    let authUserId = null;
    const bearer = (req.headers.authorization || "").replace(/^Bearer\s+/i, "");
    if (bearer) {
      const { data } = await supabase.auth.getUser(bearer);
      if (data?.user) authUserId = data.user.id;
    }
    if (poll.require_login && !authUserId) {
      return res.status(401).json({ error: "Log in to vote in this poll." });
    }

    const restricted = Number(poll.eligible_voters_count ?? 0) > 0;
    let voterId = null;
    let eligibleVoterId = null;
    let anonymousToken = null;

    if (restricted) {
      let email = cleanEmail(req.body?.email);
      if (poll.require_login) {
        // Bind the ballot to the logged-in identity: otherwise any logged-in
        // voter could burn another invitee's vote by typing their email.
        const { data: profile } = await supabase
          .from("profiles")
          .select("email")
          .eq("id", authUserId)
          .single();
        const sessionEmail = cleanEmail(profile?.email);
        if (!sessionEmail) {
          return res.status(401).json({ error: "Log in to vote in this poll." });
        }
        if (email && email !== sessionEmail) {
          return res.status(403).json({ error: "Vote with your own login email on this poll." });
        }
        email = sessionEmail;
      }
      if (!email || !isEmail(email)) {
        return res.status(400).json({ error: "A valid email address is required for this poll." });
      }
      const { data: row } = await supabase
        .from("eligible_voters")
        .select("id, has_voted")
        .eq("poll_id", poll.id)
        .eq("email", email)
        .single();
      if (!row) {
        return res.status(403).json({ error: "This email is not on the invite list for this poll." });
      }
      if (row.has_voted && poll.one_vote_per_voter) {
        return res.status(409).json({ error: "This voter has already voted in this poll." });
      }
      eligibleVoterId = row.id;
      // Votes.voter_id has a foreign key to profiles(id), so it can only
      // reference a registered account. Unregistered invitees vote with
      // voter_id NULL — their eligible_voters.has_voted flag below is the
      // double-vote guard for them.
      if (poll.require_login) {
        voterId = authUserId; // == profiles.id; profile row proven above
      } else {
        try {
          const { data: profile } = await supabase
            .from("profiles")
            .select("id")
            .eq("email", email)
            .maybeSingle();
          if (profile?.id) voterId = profile.id;
        } catch {
          voterId = null;
        }
      }
    } else if (poll.one_vote_per_voter) {
      anonymousToken = typeof req.body?.anonymousToken === "string" ? req.body.anonymousToken.slice(0, 64) : null;
      if (anonymousToken) {
        const { data: existing } = await supabase
          .from("Votes")
          .select("id")
          .eq("poll_id", poll.id)
          .eq("anonymous_voter_token", anonymousToken)
          .limit(1);
        if (existing && existing.length > 0) {
          return res.status(409).json({ error: "A vote has already been cast from this device." });
        }
      }
    }

    const { error: voteError } = await supabase.from("Votes").insert({
      id: randomUUID(),
      poll_id: poll.id,
      option_id: option.id,
      voter_id: voterId,
      anonymous_voter_token: anonymousToken,
    });
    if (voteError) throw voteError;

    if (eligibleVoterId) {
      await supabase.from("eligible_voters").update({ has_voted: true }).eq("id", eligibleVoterId);
    }

    return res.status(201).json({ ok: true });
  } catch (err) {
    console.error("Cast vote error:", err);
    return res.status(500).json({ error: "Something went wrong. Please try again." });
  }
}

// Organizer endpoints below. The poll must belong to the organizer.

async function getOwnedPoll(pollId, organizerId) {
  const poll = await getPoll(pollId);
  if (!poll || poll.creator_id !== organizerId) return null;
  return poll;
}

// GET /api/polls/:id/eligible-voters
export async function listEligibleVoters(req, res) {
  try {
    const poll = await getOwnedPoll(req.params.id, req.profile.id);
    if (!poll) return res.status(404).json({ error: "Poll not found." });
    const { data, error } = await supabase
      .from("eligible_voters")
      .select("id, email, has_voted")
      .eq("poll_id", poll.id)
      .order("email", { ascending: true });
    if (error) throw error;
    const voters = (data ?? []).map((v) => ({ id: v.id, email: v.email, hasVoted: !!v.has_voted }));
    return res.json({
      voters,
      total: voters.length,
      voted: voters.filter((v) => v.hasVoted).length,
    });
  } catch (err) {
    console.error("List eligible voters error:", err);
    return res.status(500).json({ error: "Something went wrong. Please try again." });
  }
}

// POST /api/polls/:id/eligible-voters { emails: [] }
export async function addEligibleVoters(req, res) {
  try {
    const poll = await getOwnedPoll(req.params.id, req.profile.id);
    if (!poll) return res.status(404).json({ error: "Poll not found." });

    const emails = normalizeEmails(req.body?.emails);
    if (emails.length === 0) return res.status(400).json({ error: "Add at least one valid email." });

    const { data: existing } = await supabase
      .from("eligible_voters")
      .select("email")
      .eq("poll_id", poll.id);
    const existingSet = new Set((existing ?? []).map((r) => r.email));
    const fresh = emails.filter((e) => !existingSet.has(e));
    if (fresh.length === 0) return res.status(409).json({ error: "Everyone on that list is already invited." });

    const { error } = await supabase.from("eligible_voters").insert(
      fresh.map((email) => ({ id: randomUUID(), poll_id: poll.id, email, has_voted: false }))
    );
    if (error) throw error;

    const total = existingSet.size + fresh.length;
    await supabase.from("polls").update({ eligible_voters_count: total }).eq("id", poll.id);

    if (fresh.length > 0) {
      const { data: full } = await supabase.from("polls").select("*").eq("id", poll.id).single();
      notifyInvitees({
        poll: shapePoll(full ?? poll, []),
        organizerName: req.profile.full_name || "An organizer",
        emails: fresh,
      }).catch((err) => console.error("Invite notification error:", err));
    }

    return res.status(201).json({ added: fresh.length, total });
  } catch (err) {
    console.error("Add eligible voters error:", err);
    return res.status(500).json({ error: "Something went wrong. Please try again." });
  }
}

// DELETE /api/polls/:id/eligible-voters/:evId
export async function removeEligibleVoter(req, res) {
  try {
    const poll = await getOwnedPoll(req.params.id, req.profile.id);
    if (!poll) return res.status(404).json({ error: "Poll not found." });

    const { data: row } = await supabase
      .from("eligible_voters")
      .select("id, has_voted")
      .eq("id", req.params.evId)
      .eq("poll_id", poll.id)
      .single();
    if (!row) return res.status(404).json({ error: "Voter not found." });
    if (row.has_voted) {
      return res.status(409).json({ error: "This voter already voted and can't be removed." });
    }

    const { error } = await supabase.from("eligible_voters").delete().eq("id", row.id);
    if (error) throw error;

    const { count } = await supabase
      .from("eligible_voters")
      .select("id", { count: "exact", head: true })
      .eq("poll_id", poll.id);
    await supabase.from("polls").update({ eligible_voters_count: count ?? 0 }).eq("id", poll.id);
    return res.json({ ok: true, total: count ?? 0 });
  } catch (err) {
    console.error("Remove eligible voter error:", err);
    return res.status(500).json({ error: "Something went wrong. Please try again." });
  }
}

// GET /api/polls/:id/results — public when the poll shows results, else organizer-only.
async function getPollStats(poll) {
  const options = await getOptions(poll.id);
  const { data: votes, error } = await supabase.from("Votes").select("option_id").eq("poll_id", poll.id);
  if (error) throw error;

  const counts = {};
  for (const v of votes ?? []) counts[v.option_id] = (counts[v.option_id] ?? 0) + 1;
  const totalVotes = (votes ?? []).length;
  const results = options.map((o) => ({
    id: o.id,
    name: o.name,
    tagline: o.tagline,
    votes: counts[o.id] ?? 0,
    pct: totalVotes > 0 ? Math.round(((counts[o.id] ?? 0) / totalVotes) * 1000) / 10 : 0,
  }));
  const eligible = Number(poll.eligible_voters_count ?? 0);

  return {
    options: results,
    totalVotes,
    eligibleVotersCount: eligible,
    turnoutPct: eligible > 0 ? Math.round((totalVotes / eligible) * 1000) / 10 : null,
  };
}

export async function getResults(req, res) {
  try {
    const poll = await getPoll(req.params.id);
    if (!poll) return res.status(404).json({ error: "Poll not found." });

    let isOwner = false;
    const token = (req.headers.authorization || "").replace(/^Bearer\s+/i, "");
    if (token) {
      const { data } = await supabase.auth.getUser(token);
      isOwner = !!data?.user && poll.creator_id === data.user.id;
      if (isOwner) {
        const { data: profile } = await supabase.from("profiles").select("role").eq("id", data.user.id).single();
        isOwner = profile?.role === "organizer";
      }
    }
    if (!poll.show_results && !isOwner) {
      return res.status(403).json({ error: "Results are not public for this poll." });
    }

    const stats = await getPollStats(poll);

    return res.json({
      options: stats.options,
      totalVotes: stats.totalVotes,
      eligibleVotersCount: stats.eligibleVotersCount,
      turnoutPct: stats.turnoutPct,
    });
  } catch (err) {
    console.error("Get results error:", err);
    return res.status(500).json({ error: "Something went wrong. Please try again." });
  }
}

// GET /api/polls — the signed-in organizer's polls, each with live stats + results
export async function listMyPolls(req, res) {
  try {
    const { data: polls, error } = await supabase
      .from("polls")
      .select("*")
      .eq("creator_id", req.profile.id)
      .order("created_at", { ascending: false });
    if (error) throw error;

    const items = await Promise.all(
      (polls ?? []).map(async (p) => {
        const stats = await getPollStats(p);
        return { ...shapePoll(p, await getOptions(p.id)), ...stats };
      })
    );
    return res.json({ polls: items });
  } catch (err) {
    console.error("List polls error:", err);
    return res.status(500).json({ error: "Something went wrong. Please try again." });
  }
}
