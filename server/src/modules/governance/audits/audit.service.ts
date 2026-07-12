import { AuditRepository } from "./audit.repository.js";
import { ActivityLogService } from "../../shared/activity-logs/activity-log.service.js";
import type { CreateAuditInput, UpdateAuditInput, AuditFilter } from "./audit.types.js";

export class AuditService {
  static async getAudits(filters: AuditFilter) {
    return AuditRepository.getAudits(filters);
  }

  static async getAuditById(id: string) {
    const audit = await AuditRepository.getAuditById(id);
    if (!audit) {
      throw new Error(`Audit with ID ${id} not found.`);
    }
    return audit;
  }

  static async createAudit(input: CreateAuditInput, userId: string) {
    const start = new Date(input.auditStartDate);
    const end = new Date(input.auditEndDate);

    // End date must not precede start date
    if (end.getTime() < start.getTime()) {
      throw new Error("Audit End Date must not precede Start Date.");
    }

    const audit = await AuditRepository.createAudit({
      title: input.title,
      description: input.description || null,
      departmentId: input.departmentId,
      auditStartDate: start,
      auditEndDate: end,
      auditorId: input.auditorId,
      status: input.status ?? "PLANNED",
      findings: input.findings ?? null,
      score: input.score !== undefined ? input.score : null,
    });

    await ActivityLogService.log(
      userId,
      "AUDIT",
      audit.id,
      "CREATE",
      null,
      audit
    );

    return audit;
  }

  static async updateAudit(id: string, input: UpdateAuditInput, userId: string) {
    const existing = await AuditRepository.getAuditById(id);
    if (!existing) {
      throw new Error(`Audit with ID ${id} not found.`);
    }

    // Completed Audits become read-only
    if (existing.status === "COMPLETED") {
      throw new Error("Completed audits are read-only and cannot be modified.");
    }

    const targetStart = input.auditStartDate ? new Date(input.auditStartDate) : new Date(existing.auditStartDate);
    const targetEnd = input.auditEndDate ? new Date(input.auditEndDate) : new Date(existing.auditEndDate);

    if (targetEnd.getTime() < targetStart.getTime()) {
      throw new Error("Audit End Date must not precede Start Date.");
    }

    const data: any = {};
    if (input.title !== undefined) data.title = input.title;
    if (input.description !== undefined) data.description = input.description;
    if (input.departmentId !== undefined) data.departmentId = input.departmentId;
    if (input.auditStartDate !== undefined) data.auditStartDate = targetStart;
    if (input.auditEndDate !== undefined) data.auditEndDate = targetEnd;
    if (input.auditorId !== undefined) data.auditorId = input.auditorId;
    if (input.status !== undefined) data.status = input.status;
    if (input.findings !== undefined) data.findings = input.findings;
    if (input.score !== undefined) data.score = input.score;

    const updated = await AuditRepository.updateAudit(id, data);

    await ActivityLogService.log(
      userId,
      "AUDIT",
      id,
      "UPDATE",
      existing,
      updated
    );

    return updated;
  }

  static async deleteAudit(id: string, userId: string) {
    const existing = await AuditRepository.getAuditById(id);
    if (!existing) {
      throw new Error(`Audit with ID ${id} not found.`);
    }

    if (existing.status === "COMPLETED") {
      throw new Error("Completed audits cannot be deleted.");
    }

    await AuditRepository.deleteAudit(id);

    await ActivityLogService.log(
      userId,
      "AUDIT",
      id,
      "DELETE",
      existing,
      null
    );

    return { success: true };
  }
}
export default AuditService;
