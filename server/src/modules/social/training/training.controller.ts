import type { Request, Response, NextFunction } from "express";
import { TrainingService } from "./training.service.js";
import { createTrainingSchema, updateProgressSchema } from "./training.schemas.js";
import type { TrainingStatus } from "@prisma/client";
import { sendSuccess } from "../../../utils/response.js";

export class TrainingController {
  static async getTrainings(req: Request, res: Response, next: NextFunction) {
    try {
      const filters: any = {};
      const userVal = req.query['userId'];
      const statusVal = req.query['status'];

      if (typeof userVal === "string" && userVal) {
        filters.userId = userVal;
      }
      if (typeof statusVal === "string" && statusVal) {
        filters.status = statusVal as TrainingStatus;
      }

      const trainings = await TrainingService.getTrainings(filters);
      return sendSuccess(res, "Trainings retrieved successfully.", { trainings });
    } catch (error) {
      next(error);
    }
  }

  static async createTraining(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = createTrainingSchema.parse(req.body);
      
      const input: any = {
        userId: validated.userId,
        title: validated.title,
      };
      if (validated.description !== undefined) {
        input.description = validated.description || null;
      }

      const training = await TrainingService.createTraining(input);
      return sendSuccess(res, "Training created successfully.", { training }, 201);
    } catch (error) {
      next(error);
    }
  }

  static async updateProgress(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params['id'] as string;
      const { progress } = updateProgressSchema.parse(req.body);

      const training = await TrainingService.updateTrainingProgress(id, progress);
      return sendSuccess(res, "Training progress updated successfully.", { training });
    } catch (error) {
      next(error);
    }
  }

  static async deleteTraining(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params['id'] as string;
      await TrainingService.deleteTraining(id);
      return sendSuccess(res, "Training course deleted successfully.", { success: true });
    } catch (error) {
      next(error);
    }
  }
}
export default TrainingController;
