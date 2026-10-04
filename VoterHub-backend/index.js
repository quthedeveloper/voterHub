import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;
const { SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_KEY } = process.env;

// Comma-separated list of allowed frontend origins, e.g.
// FRONTEND_URL=https://votehub.app,https://www.votehub.app
const FRONTEND_URLS = (process.env.FRONTEND_URL || "http://localhost:5173")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

// Trust the first proxy (Render, Railway, etc.) so rate limiting and
// secure cookies see the real client IP / protocol.
app.set("trust proxy", 1);

app.use(helmet());
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    credentials: true,
    origin: FRONTEND_URLS,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    optionsSuccessStatus: 200,
  })
);

const missing = [
  ["SUPABASE_URL", SUPABASE_URL],
  ["SUPABASE_ANON_KEY", SUPABASE_ANON_KEY],
  ["SUPABASE_SERVICE_KEY", SUPABASE_SERVICE_KEY],
].filter(([, v]) => !v);

if (missing.length > 0) {
  console.error(
    `Missing environment variables: ${missing.map(([k]) => k).join(", ")}. See .env.example.`
  );
  process.exit(1);
}

// Routes
import SessionRouter from "./routes/session.js";
app.use("/api", SessionRouter);

// Health check (no auth)
app.get("/health", (_req, res) => res.json({ ok: true }));

// 404 for unknown API routes
app.use("/api", (_req, res) => res.status(404).json({ error: "Not found" }));

// Generic error handler (catches anything that slips past try/catch)
app.use((err, _req, res, _next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ error: "Something went wrong. Please try again." });
});

export const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

app.listen(PORT, () => console.log(`voterHub backend running on port ${PORT}`));
