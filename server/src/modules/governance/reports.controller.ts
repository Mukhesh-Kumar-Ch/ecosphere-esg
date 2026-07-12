import type { Request, Response, NextFunction } from "express";
import { GovernanceReportsService } from "./reports.service.js";

export class GovernanceReportsController {
  static async getGovernanceReport(req: Request, res: Response, next: NextFunction) {
    try {
      const report = await GovernanceReportsService.getGovernanceReport();
      res.json(report);
    } catch (error) {
      next(error);
    }
  }
}
export default GovernanceReportsController;
