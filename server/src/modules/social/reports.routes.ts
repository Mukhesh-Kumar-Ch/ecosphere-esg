import { Router } from "express";
import { SocialReportController } from "./reports/social-report.controller.js";
import { authenticate } from "../../middlewares/auth.middleware.js";

export const reportsRouter = Router();

reportsRouter.get("/social", authenticate, SocialReportController.getSocialReport);

export default reportsRouter;
