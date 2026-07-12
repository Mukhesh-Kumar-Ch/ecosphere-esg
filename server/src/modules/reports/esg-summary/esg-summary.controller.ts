import type { Request, Response, NextFunction } from "express";
import { EsgSummaryReportService } from "./esg-summary.service.js";
import { sendSuccess } from "../../../utils/response.js";

export class EsgSummaryReportController {
  static async getEsgSummaryReport(req: Request, res: Response, next: NextFunction) {
    try {
      const report = await EsgSummaryReportService.getEsgSummaryReport();
      return sendSuccess(res, "ESG summary report retrieved successfully.", report);
    } catch (error) {
      next(error);
    }
  }
}
export default EsgSummaryReportController;
