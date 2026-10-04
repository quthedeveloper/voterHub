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

## Production checklist

- Set `NODE_ENV=production` (secure cookies, correct proxy handling).
- Set `FRONTEND_URL` to your deployed frontend origin(s), comma-separated.
- In the Supabase dashboard (Authentication -> URL Configuration), add `<FRONTEND_URL>/reset-password` to **Redirect URLs**, or the recovery email link won't work.
- Rate limits: login/register/refresh = 20 per 15 min per IP; forgot/reset password = 5 per hour per IP. Tighten in `middlewares/rateLimits.js` if needed.
- `trust proxy` is set to 1 — correct for Render/Railway/Heroku. Adjust if you run multiple proxies.
- Email confirmation is currently skipped (`email_confirm: true` in register). Turn it on if you want verified emails before login.
