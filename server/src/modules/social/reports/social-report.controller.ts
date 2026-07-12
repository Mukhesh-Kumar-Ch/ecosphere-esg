import type { Request, Response, NextFunction } from "express";
import { SocialReportService } from "./social-report.service.js";
import { sendSuccess } from "../../../utils/response.js";

export class SocialReportController {
  static async getSocialReport(req: Request, res: Response, next: NextFunction) {
    try {
      const report = await SocialReportService.getSocialReport();
      return sendSuccess(res, "Social report retrieved successfully.", report);
    } catch (error) {
      next(error);
    }
  }
}
export default SocialReportController;
