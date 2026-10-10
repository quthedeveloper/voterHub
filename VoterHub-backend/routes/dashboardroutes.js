import { Router } from "express";
import { requireAuth } from "../middlewares/requireAuth.js";
import { getDashboardInfo } from "../controllers/dashboardInfo.js";




const DashboardRouter = Router();

DashboardRouter.get("/dashboard", requireAuth, getDashboardInfo);


export default DashboardRouter;