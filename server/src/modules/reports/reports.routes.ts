import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware.js";
import { getEnvironmentReport } from "../environment/reports.service.js";
import { SocialReportService } from "../social/reports/social-report.service.js";
import { GovernanceReportsService } from "../governance/reports.service.js";
import { EsgSummaryReportController } from "./esg-summary/esg-summary.controller.js";
import { CustomReportController } from "./custom/custom-report.controller.js";
import { sendSuccess } from "../../utils/response.js";

export const reportsRouter = Router();

reportsRouter.use(authenticate);

// 1. Environmental Report
reportsRouter.get("/environment", async (req, res, next) => {
  try {
    const report = await getEnvironmentReport();
    return sendSuccess(res, "Environmental report retrieved successfully.", report);
  } catch (error) {
    next(error);
  }
});

// 2. Social Report
reportsRouter.get("/social", async (req, res, next) => {
  try {
    const report = await SocialReportService.getSocialReport();
    return sendSuccess(res, "Social report retrieved successfully.", report);
  } catch (error) {
    next(error);
  }
});

// 3. Governance Report
reportsRouter.get("/governance", async (req, res, next) => {
  try {
    const report = await GovernanceReportsService.getGovernanceReport();
    return sendSuccess(res, "Governance report retrieved successfully.", report);
  } catch (error) {
    next(error);
  }
});

// 4. ESG Summary Report
reportsRouter.get("/esg-summary", EsgSummaryReportController.getEsgSummaryReport);

// 5. Custom Report Builder
reportsRouter.post("/custom", CustomReportController.generateCustomReport);

export default reportsRouter;
