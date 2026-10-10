import rateLimit from "express-rate-limit";

// General guard for login / register / refresh: 20 attempts per 15 minutes per IP.
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { error: "Too many attempts. Please try again in a few minutes." },
});

// Stricter guard for password reset endpoints: 5 attempts per hour per IP.
export const passwordLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 5,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { error: "Too many attempts. Please try again in an hour." },
});

// Anti ballot-stuffing guard for the public vote endpoint: 60 votes per hour per IP.
export const voteLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 60,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { error: "Too many votes from this address. Please try again later." },
});
