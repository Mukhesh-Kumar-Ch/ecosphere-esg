import type { Request, Response, NextFunction } from "express";
import { PolicyService } from "./policy.service.js";
import { createPolicySchema, updatePolicySchema } from "./policy.schemas.js";
import type { PolicyStatus } from "@prisma/client";
import { sendSuccess } from "../../../utils/response.js";

export class PolicyController {
  static async getPolicies(req: Request, res: Response, next: NextFunction) {
    try {
      const filters: any = {};
      const searchVal = req.query['search'];
      const statusVal = req.query['status'];

      if (typeof searchVal === "string" && searchVal) {
        filters.search = searchVal;
      }
      if (typeof statusVal === "string" && statusVal) {
        filters.status = statusVal as PolicyStatus;
      }

      const policies = await PolicyService.getPolicies(filters);
      return sendSuccess(res, "Policies retrieved successfully.", { policies });
    } catch (error) {
      next(error);
    }
  }

  static async getPolicyById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params['id'] as string;
      const policy = await PolicyService.getPolicyById(id);
      return sendSuccess(res, "Policy retrieved successfully.", { policy });
    } catch (error) {
      next(error);
    }
  }

  static async createPolicy(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = createPolicySchema.parse(req.body);
      const userId = (req as any).user.id as string;

      const policyInput: any = {
        title: validated.title,
        description: validated.description || null,
        version: validated.version,
        effectiveDate: validated.effectiveDate,
      };
      if (validated.status !== undefined) {
        policyInput.status = validated.status;
      }

      const policy = await PolicyService.createPolicy(policyInput, userId);
      return sendSuccess(res, "Policy created successfully.", { policy }, 201);
    } catch (error) {
      next(error);
    }
  }

  static async updatePolicy(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params['id'] as string;
      const validated = updatePolicySchema.parse(req.body);
      const userId = (req as any).user.id as string;

      const policyInput: any = {};
      if (validated.title !== undefined) policyInput.title = validated.title;
      if (validated.description !== undefined) policyInput.description = validated.description || null;
      if (validated.version !== undefined) policyInput.version = validated.version;
      if (validated.effectiveDate !== undefined) policyInput.effectiveDate = validated.effectiveDate;
      if (validated.status !== undefined) policyInput.status = validated.status;

      const policy = await PolicyService.updatePolicy(id, policyInput, userId);
      return sendSuccess(res, "Policy updated successfully.", { policy });
    } catch (error) {
      next(error);
    }
  }

  static async deletePolicy(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params['id'] as string;
      const userId = (req as any).user.id as string;

      await PolicyService.deletePolicy(id, userId);
      return sendSuccess(res, "Policy deleted successfully.", { success: true });
    } catch (error) {
      next(error);
    }
  }

  static async acknowledgePolicy(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params['id'] as string;
      const userId = (req as any).user.id as string;

      const ack = await PolicyService.acknowledgePolicy(id, userId);
      return sendSuccess(res, "Policy acknowledged successfully.", { acknowledgement: ack }, 201);
    } catch (error) {
      next(error);
    }
  }

  static async getMyAcknowledgements(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.id as string;
      const acknowledgements = await PolicyService.getAcknowledgementsByUser(userId);
      return sendSuccess(res, "Acknowledgements retrieved successfully.", { acknowledgements });
    } catch (error) {
      next(error);
    }
  }
}
export default PolicyController;
