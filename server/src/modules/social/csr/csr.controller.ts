import type { Request, Response, NextFunction } from "express";
import { CsrService } from "./csr.service.js";
import { createCsrActivitySchema, updateCsrActivitySchema, joinCsrActivitySchema, approveCsrActivitySchema } from "./csr.schemas.js";
import type { ActivityStatus, ApprovalStatus } from "@prisma/client";
import { sendSuccess } from "../../../utils/response.js";

export class CsrController {
  static async getActivities(req: Request, res: Response, next: NextFunction) {
    try {
      const filters: any = {};
      const searchVal = req.query['search'];
      const statusVal = req.query['status'];
      const deptVal = req.query['departmentId'];
      const catVal = req.query['categoryId'];

      if (typeof searchVal === "string" && searchVal) {
        filters.search = searchVal;
      }
      if (typeof statusVal === "string" && statusVal) {
        filters.status = statusVal as ActivityStatus;
      }
      if (typeof deptVal === "string" && deptVal) {
        filters.departmentId = deptVal;
      }
      if (typeof catVal === "string" && catVal) {
        filters.categoryId = catVal;
      }

      const activities = await CsrService.getActivities(filters);
      return sendSuccess(res, "CSR activities retrieved successfully.", { activities });
    } catch (error) {
      next(error);
    }
  }

  static async getActivityById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params['id'] as string;
      const activity = await CsrService.getActivityById(id);
      return sendSuccess(res, "CSR activity retrieved successfully.", { activity });
    } catch (error) {
      next(error);
    }
  }

  static async createActivity(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = createCsrActivitySchema.parse(req.body);
      const userId = (req as any).user.id as string;

      const input: any = {
        title: validated.title,
        departmentId: validated.departmentId,
        categoryId: validated.categoryId,
        startDate: validated.startDate,
        endDate: validated.endDate,
      };
      if (validated.description !== undefined) {
        input.description = validated.description || null;
      }
      if (validated.status !== undefined) {
        input.status = validated.status;
      }

      const activity = await CsrService.createActivity(input, userId);
      return sendSuccess(res, "CSR activity created successfully.", { activity }, 201);
    } catch (error) {
      next(error);
    }
  }

  static async updateActivity(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params['id'] as string;
      const validated = updateCsrActivitySchema.parse(req.body);
      const userId = (req as any).user.id as string;

      const input: any = {};
      if (validated.title !== undefined) input.title = validated.title;
      if (validated.description !== undefined) input.description = validated.description || null;
      if (validated.departmentId !== undefined) input.departmentId = validated.departmentId;
      if (validated.categoryId !== undefined) input.categoryId = validated.categoryId;
      if (validated.startDate !== undefined) input.startDate = validated.startDate;
      if (validated.endDate !== undefined) input.endDate = validated.endDate;
      if (validated.status !== undefined) input.status = validated.status;

      const activity = await CsrService.updateActivity(id, input, userId);
      return sendSuccess(res, "CSR activity updated successfully.", { activity });
    } catch (error) {
      next(error);
    }
  }

  static async deleteActivity(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params['id'] as string;
      const userId = (req as any).user.id as string;

      await CsrService.deleteActivity(id, userId);
      return sendSuccess(res, "CSR activity deleted successfully.", { success: true });
    } catch (error) {
      next(error);
    }
  }

  static async joinActivity(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params['id'] as string;
      const userId = (req as any).user.id as string;

      const participation = await CsrService.joinActivity(id, userId);
      return sendSuccess(res, "Joined CSR activity successfully.", { participation }, 201);
    } catch (error) {
      next(error);
    }
  }

  static async submitProof(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params['id'] as string;
      const userId = (req as any).user.id as string;
      const { proofFile } = joinCsrActivitySchema.parse(req.body);

      const participation = await CsrService.submitProof(id, userId, proofFile || "");
      return sendSuccess(res, "Proof submitted successfully.", { participation });
    } catch (error) {
      next(error);
    }
  }

  static async approveParticipation(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params['id'] as string;
      const { approvalStatus } = approveCsrActivitySchema.parse(req.body);
      const approverId = (req as any).user.id as string;

      const participation = await CsrService.approveParticipation(id, approvalStatus, approverId);
      return sendSuccess(res, "Participation approved successfully.", { participation });
    } catch (error) {
      next(error);
    }
  }

  static async getParticipations(req: Request, res: Response, next: NextFunction) {
    try {
      const filters: any = {};
      const userVal = req.query['userId'];
      const actVal = req.query['activityId'];
      const statusVal = req.query['approvalStatus'];

      if (typeof userVal === "string" && userVal) {
        filters.userId = userVal;
      }
      if (typeof actVal === "string" && actVal) {
        filters.activityId = actVal;
      }
      if (typeof statusVal === "string" && statusVal) {
        filters.approvalStatus = statusVal as ApprovalStatus;
      }

      const participations = await CsrService.getParticipations(filters);
      return sendSuccess(res, "CSR participations retrieved successfully.", { participations });
    } catch (error) {
      next(error);
    }
  }
}
export default CsrController;
