import type { Request, Response, NextFunction } from "express";
import { GovernanceReportsService } from "./reports.service.js";
import { sendSuccess } from "../../utils/response.js";

export class GovernanceReportsController {
  static async getGovernanceReport(req: Request, res: Response, next: NextFunction) {
    try {
      const report = await GovernanceReportsService.getGovernanceReport();
      return sendSuccess(res, "Governance report retrieved successfully.", report);
    } catch (error) {
      next(error);
    }
  }
}
export default GovernanceReportsController;
