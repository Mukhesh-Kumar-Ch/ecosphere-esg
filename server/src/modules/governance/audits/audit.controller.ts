import type { Request, Response, NextFunction } from "express";
import { AuditService } from "./audit.service.js";
import { createAuditSchema, updateAuditSchema } from "./audit.schemas.js";
import type { AuditStatus } from "@prisma/client";
import { sendSuccess } from "../../../utils/response.js";

export class AuditController {
  static async getAudits(req: Request, res: Response, next: NextFunction) {
    try {
      const filters: any = {};
      const searchVal = req.query['search'];
      const statusVal = req.query['status'];
      const deptVal = req.query['departmentId'];

      if (typeof searchVal === "string" && searchVal) {
        filters.search = searchVal;
      }
      if (typeof statusVal === "string" && statusVal) {
        filters.status = statusVal as AuditStatus;
      }
      if (typeof deptVal === "string" && deptVal) {
        filters.departmentId = deptVal;
      }

      const audits = await AuditService.getAudits(filters);
      return sendSuccess(res, "Audits retrieved successfully.", { audits });
    } catch (error) {
      next(error);
    }
  }

  static async getAuditById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params['id'] as string;
      const audit = await AuditService.getAuditById(id);
      return sendSuccess(res, "Audit retrieved successfully.", { audit });
    } catch (error) {
      next(error);
    }
  }

  static async createAudit(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = createAuditSchema.parse(req.body);
      const userId = (req as any).user.id as string;

      const auditInput: any = {
        title: validated.title,
        description: validated.description || null,
        departmentId: validated.departmentId,
        auditStartDate: validated.auditStartDate,
        auditEndDate: validated.auditEndDate,
        auditorId: validated.auditorId,
        findings: validated.findings || null,
        score: validated.score !== undefined ? validated.score : null,
      };
      if (validated.status !== undefined) {
        auditInput.status = validated.status;
      }

      const audit = await AuditService.createAudit(auditInput, userId);
      return sendSuccess(res, "Audit created successfully.", { audit }, 201);
    } catch (error) {
      next(error);
    }
  }

  static async updateAudit(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params['id'] as string;
      const validated = updateAuditSchema.parse(req.body);
      const userId = (req as any).user.id as string;

      const auditInput: any = {};
      if (validated.title !== undefined) auditInput.title = validated.title;
      if (validated.description !== undefined) auditInput.description = validated.description || null;
      if (validated.departmentId !== undefined) auditInput.departmentId = validated.departmentId;
      if (validated.auditStartDate !== undefined) auditInput.auditStartDate = validated.auditStartDate;
      if (validated.auditEndDate !== undefined) auditInput.auditEndDate = validated.auditEndDate;
      if (validated.auditorId !== undefined) auditInput.auditorId = validated.auditorId;
      if (validated.status !== undefined) auditInput.status = validated.status;
      if (validated.findings !== undefined) auditInput.findings = validated.findings || null;
      if (validated.score !== undefined) auditInput.score = validated.score;

      const audit = await AuditService.updateAudit(id, auditInput, userId);
      return sendSuccess(res, "Audit updated successfully.", { audit });
    } catch (error) {
      next(error);
    }
  }

  static async deleteAudit(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params['id'] as string;
      const userId = (req as any).user.id as string;

      await AuditService.deleteAudit(id, userId);
      return sendSuccess(res, "Audit deleted successfully.", { success: true });
    } catch (error) {
      next(error);
    }
  }
}
export default AuditController;
