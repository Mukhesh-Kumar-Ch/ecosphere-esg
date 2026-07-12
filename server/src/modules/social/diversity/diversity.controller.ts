import type { Request, Response, NextFunction } from "express";
import { DiversityService } from "./diversity.service.js";
import { setMetricSchema } from "./diversity.schemas.js";

export class DiversityController {
  static async getMetrics(req: Request, res: Response, next: NextFunction) {
    try {
      const metrics = await DiversityService.getMetrics();
      res.json({ metrics });
    } catch (error) {
      next(error);
    }
  }

  static async setMetric(req: Request, res: Response, next: NextFunction) {
    try {
      const { category, label, value } = setMetricSchema.parse(req.body);
      const metric = await DiversityService.setMetric(category, label, Number(value));
      res.status(200).json({ metric });
    } catch (error) {
      next(error);
    }
  }

  static async deleteMetric(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params['id'] as string;
      await DiversityService.deleteMetric(id);
      res.json({ success: true, message: "Diversity metric deleted successfully." });
    } catch (error) {
      next(error);
    }
  }
}
export default DiversityController;
