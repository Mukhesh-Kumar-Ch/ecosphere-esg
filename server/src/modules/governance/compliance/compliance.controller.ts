import type { Request, Response, NextFunction } from "express";
import { ComplianceService } from "./compliance.service.js";
import { createComplianceSchema, updateComplianceSchema } from "./compliance.schemas.js";
import type { ComplianceStatus, SeverityLevel } from "@prisma/client";
import { sendSuccess } from "../../../utils/response.js";

export class ComplianceController {
  static async getIssues(req: Request, res: Response, next: NextFunction) {
    try {
      const filters: any = {};
      const searchVal = req.query['search'];
      const statusVal = req.query['status'];
      const deptVal = req.query['departmentId'];
      const sevVal = req.query['severity'];

      if (typeof searchVal === "string" && searchVal) {
        filters.search = searchVal;
      }
      if (typeof statusVal === "string" && statusVal) {
        filters.status = statusVal as ComplianceStatus;
      }
      if (typeof deptVal === "string" && deptVal) {
        filters.departmentId = deptVal;
      }
      if (typeof sevVal === "string" && sevVal) {
        filters.severity = sevVal as SeverityLevel;
      }

      const issues = await ComplianceService.getIssues(filters);
      return sendSuccess(res, "Compliance issues retrieved successfully.", { issues });
    } catch (error) {
      next(error);
    }
  }

  static async getIssueById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params['id'] as string;
      const issue = await ComplianceService.getIssueById(id);
      return sendSuccess(res, "Compliance issue retrieved successfully.", { issue });
    } catch (error) {
      next(error);
    }
  }

  static async createIssue(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = createComplianceSchema.parse(req.body);
      const userId = (req as any).user.id as string;

      const issueInput: any = {
        title: validated.title,
        description: validated.description,
        severity: validated.severity,
        departmentId: validated.departmentId,
        ownerId: validated.ownerId,
        dueDate: validated.dueDate,
        auditId: validated.auditId,
      };
      if (validated.status !== undefined) {
        issueInput.status = validated.status;
      }

      const issue = await ComplianceService.createIssue(issueInput, userId);
      return sendSuccess(res, "Compliance issue created successfully.", { issue }, 201);
    } catch (error) {
      next(error);
    }
  }

  static async updateIssue(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params['id'] as string;
      const validated = updateComplianceSchema.parse(req.body);
      const userId = (req as any).user.id as string;

      const issueInput: any = {};
      if (validated.title !== undefined) issueInput.title = validated.title;
      if (validated.description !== undefined) issueInput.description = validated.description;
      if (validated.severity !== undefined) issueInput.severity = validated.severity;
      if (validated.departmentId !== undefined) issueInput.departmentId = validated.departmentId;
      if (validated.ownerId !== undefined) issueInput.ownerId = validated.ownerId;
      if (validated.dueDate !== undefined) issueInput.dueDate = validated.dueDate;
      if (validated.status !== undefined) issueInput.status = validated.status;

      const issue = await ComplianceService.updateIssue(id, issueInput, userId);
      return sendSuccess(res, "Compliance issue updated successfully.", { issue });
    } catch (error) {
      next(error);
    }
  }

  static async deleteIssue(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params['id'] as string;
      const userId = (req as any).user.id as string;

      await ComplianceService.deleteIssue(id, userId);
      return sendSuccess(res, "Compliance issue deleted successfully.", { success: true });
    } catch (error) {
      next(error);
    }
  }
}
export default ComplianceController;
