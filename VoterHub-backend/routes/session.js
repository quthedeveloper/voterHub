import { Router } from "express";
import { register } from "../controllers/register.js";
import { login, logout, me, refresh } from "../controllers/login.js";
import { forgotPassword, resetPassword, changePassword } from "../controllers/password.js";
import { requireAuth } from "../middlewares/requireAuth.js";
import { authLimiter, passwordLimiter } from "../middlewares/rateLimits.js";

const SessionRouter = Router();

SessionRouter.post("/login", authLimiter, login);
SessionRouter.post("/logout", logout);
SessionRouter.get("/me", requireAuth, me);
SessionRouter.post("/register", authLimiter, register);
SessionRouter.post("/refresh", authLimiter, refresh);
SessionRouter.post("/forgot-password", passwordLimiter, forgotPassword);
SessionRouter.post("/reset-password", passwordLimiter, resetPassword);
SessionRouter.post("/me/password", passwordLimiter, requireAuth, changePassword);

export default SessionRouter;
