# VoterHub Backend

Express API for VoterHub. Auth is handled by Supabase Auth; the API keeps a
`profiles` row in sync and manages sessions with an httpOnly refresh cookie.

## Setup

```bash
npm install
cp .env.example .env   # then fill in your Supabase credentials
npm run dev            # or: npm start
```

Health check: `GET /health`

## Auth flow

- `POST /api/register` — creates the Supabase Auth user (service role), then upserts the matching `profiles` row. Rolls back the auth user if the profile write fails.
- `POST /api/login` — verifies credentials, sets an httpOnly `refresh_token` cookie (scoped to `/api`), returns `{ accessToken, expiresIn, user }`. The access token lives in frontend memory only.
- `POST /api/refresh` — rotates the refresh cookie and returns a fresh access token + user. Called on page load and before the access token expires.
- `POST /api/logout` — revokes the session server-side and clears the cookie.
- `GET /api/me` — requires `Authorization: Bearer <accessToken>`, returns the profile.
- `POST /api/forgot-password` — always responds 200 (no email enumeration); sends a Supabase recovery email linking to `<FRONTEND_URL>/reset-password`.
- `POST /api/reset-password` — accepts `{ recoveryToken, newPassword }`, verifies the token, updates the password.

## Polls & eligible voters

- `POST /api/polls` — organizer only. Body: `{ title, description, question, options: [{ name, tagline? }], settings: { oneVotePerVoter, requireLogin, showResults, votingPin?, startDate?, endDate? }, eligibleEmails: [] }`. Creates the poll, its options, and one `eligible_voters` row per email. Returns the poll with a generated reference (e.g. `VTH-2026-X7K2`).
- `GET /api/polls/reference/:ref` — public lookup for the join flow. Never leaks the PIN or invite list.
- `GET /api/polls/:id` — public poll + options.
- `GET /api/polls/:id/eligibility?email=&pin=` — can this email vote right now? Returns `{ restricted, eligible, hasVoted }`.
- `POST /api/polls/:id/vote` — casts a ballot (rate-limited). Body: `{ optionId, email?, pin?, anonymousToken? }`. The server enforces: poll open, PIN correct, email on the invite list for restricted polls, no double voting. Sets `has_voted` on the voter's invite row.
- `GET /api/polls/:id/results` — public when the poll shows results, otherwise organizer-owner only. Returns per-option votes, totals, and turnout %.
- `GET /api/polls/:id/eligible-voters` — organizer-owner only. Invite list with voted/pending flags.
- `POST /api/polls/:id/eligible-voters` — organizer-owner only. Body: `{ emails: [] }`. Adds invites, skipping duplicates.
- `DELETE /api/polls/:id/eligible-voters/:evId` — organizer-owner only. Removes an invite (blocked once they've voted).

Notes: all generated row IDs are UUID strings, so `eligible_voters.id` values fit the uuid-typed `Votes.voter_id` column. Recommended Supabase hardening: a unique constraint on `eligible_voters(poll_id, email)`.

## Production checklist

- Set `NODE_ENV=production` (secure cookies, correct proxy handling).
- Set `FRONTEND_URL` to your deployed frontend origin(s), comma-separated.
- In the Supabase dashboard (Authentication -> URL Configuration), add `<FRONTEND_URL>/reset-password` to **Redirect URLs**, or the recovery email link won't work.
- Rate limits: login/register/refresh = 20 per 15 min per IP; forgot/reset password = 5 per hour per IP. Tighten in `middlewares/rateLimits.js` if needed.
- `trust proxy` is set to 1 — correct for Render/Railway/Heroku. Adjust if you run multiple proxies.
- Email confirmation is currently skipped (`email_confirm: true` in register). Turn it on if you want verified emails before login.
