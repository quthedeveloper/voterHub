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
