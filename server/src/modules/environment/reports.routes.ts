import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware.js";
import { getEnvironmentReportController } from "./reports.controller.js";

export const reportsRouter = Router();

reportsRouter.use(authenticate);

reportsRouter.get("/environment", getEnvironmentReportController);
