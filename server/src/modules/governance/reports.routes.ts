import { Router } from "express";
import { GovernanceReportsController } from "./reports.controller.js";
import { authenticate } from "../../middlewares/auth.middleware.js";

export const reportsRouter = Router();

reportsRouter.use(authenticate);

reportsRouter.get("/governance", GovernanceReportsController.getGovernanceReport);

export default reportsRouter;
