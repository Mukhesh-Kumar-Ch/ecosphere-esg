import type { Request, Response, NextFunction } from "express";
import { CustomReportService } from "./custom-report.service.js";
import { customReportSchema } from "./custom-report.schemas.js";
import { sendSuccess } from "../../../utils/response.js";

export class CustomReportController {
  static async generateCustomReport(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = customReportSchema.parse(req.body);
      const filters: any = {};

      if (validated.departmentId) filters.departmentId = validated.departmentId;
      if (validated.startDate) filters.startDate = validated.startDate;
      if (validated.endDate) filters.endDate = validated.endDate;
      if (validated.module) filters.module = validated.module;
      if (validated.userId) filters.userId = validated.userId;
      if (validated.challengeId) filters.challengeId = validated.challengeId;
      if (validated.categoryId) filters.categoryId = validated.categoryId;

      const report = await CustomReportService.generateCustomReport(filters);
      return sendSuccess(res, "Custom report generated successfully.", report);
    } catch (error) {
      next(error);
    }
  }
}
export default CustomReportController;
