import type { Request, Response, NextFunction } from "express";
import { DiversityService } from "./diversity.service.js";
import { setMetricSchema } from "./diversity.schemas.js";
import { sendSuccess } from "../../../utils/response.js";

export class DiversityController {
  static async getMetrics(req: Request, res: Response, next: NextFunction) {
    try {
      const metrics = await DiversityService.getMetrics();
      return sendSuccess(res, "Diversity metrics retrieved successfully.", { metrics });
    } catch (error) {
      next(error);
    }
  }

  static async setMetric(req: Request, res: Response, next: NextFunction) {
    try {
      const { category, label, value } = setMetricSchema.parse(req.body);
      const metric = await DiversityService.setMetric(category, label, Number(value));
      return sendSuccess(res, "Diversity metric set successfully.", { metric });
    } catch (error) {
      next(error);
    }
  }

  static async deleteMetric(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params['id'] as string;
      await DiversityService.deleteMetric(id);
      return sendSuccess(res, "Diversity metric deleted successfully.", { success: true });
    } catch (error) {
      next(error);
    }
  }
}
export default DiversityController;
