import { Router } from "express";
import { register } from "../controllers/register.js";
import { login ,logout ,me,refresh} from "../controllers/login.js";
import { requireAuth } from "../middlewares/requireAuth.js";

const SessionRouter = Router();

SessionRouter.post("/login", login);
SessionRouter.post("/logout", logout);
SessionRouter.get("/me", requireAuth, me);
SessionRouter.post("/register", register);
SessionRouter.post("/refresh", refresh);

export default SessionRouter;