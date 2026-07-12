import type { Request, Response, NextFunction } from "express";
import { SocialReportService } from "./social-report.service.js";

export class SocialReportController {
  static async getSocialReport(req: Request, res: Response, next: NextFunction) {
    try {
      const report = await SocialReportService.getSocialReport();
      res.json(report);
    } catch (error) {
      next(error);
    }
  }
}
export default SocialReportController;
