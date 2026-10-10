import { Router } from "express";
import { requireAuth } from "../middlewares/requireAuth.js";
import { listNotifications, markRead, markAllRead } from "../controllers/notifications.js";

const NotificationsRouter = Router();

NotificationsRouter.get("/notifications", requireAuth, listNotifications);
NotificationsRouter.patch("/notifications/:id/read", requireAuth, markRead);
NotificationsRouter.post("/notifications/read-all", requireAuth, markAllRead);

export default NotificationsRouter;
