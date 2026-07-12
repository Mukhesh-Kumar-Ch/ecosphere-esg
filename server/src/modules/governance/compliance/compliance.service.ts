import { ComplianceRepository } from "./compliance.repository.js";
import { AuditRepository } from "../audits/audit.repository.js";
import { NotificationService } from "../../shared/notifications/notification.service.js";
import { ActivityLogService } from "../../shared/activity-logs/activity-log.service.js";
import type { CreateComplianceInput, UpdateComplianceInput, ComplianceFilter } from "./compliance.types.js";

export class ComplianceService {
  static async checkAndFlagOverdueIssues() {
    try {
      const overdueList = await ComplianceRepository.getOverdueIssues();
      
      for (const issue of overdueList) {
        // Update status to OVERDUE
        const updated = await ComplianceRepository.updateIssue(issue.id, {
          status: "OVERDUE",
        });

        // Create Notification
        // "When Compliance Issue becomes overdue, Automatically: Mark as Overdue, Create Notification, Add Activity Log."
        await NotificationService.create(
          issue.ownerId,
          `Overdue Compliance Issue: ${issue.title}`,
          `Compliance issue "${issue.title}" is overdue since ${new Date(issue.dueDate).toLocaleDateString()}. Please resolve immediately.`,
          "COMPLIANCE"
        );

        // Add Activity Log
        await ActivityLogService.log(
          issue.ownerId, // logged under owner or system actor
          "COMPLIANCE",
          issue.id,
          "UPDATE",
          issue,
          updated
        );
      }
    } catch (error) {
      console.error("Error flagging overdue compliance issues:", error);
    }
  }

  static async getIssues(filters: ComplianceFilter) {
    // Run overdue checker first to ensure live status consistency
    await this.checkAndFlagOverdueIssues();
    return ComplianceRepository.getIssues(filters);
  }

  static async getIssueById(id: string) {
    await this.checkAndFlagOverdueIssues();
    const issue = await ComplianceRepository.getIssueById(id);
    if (!issue) {
      throw new Error(`Compliance issue with ID ${id} not found.`);
    }
    return issue;
  }

  static async createIssue(input: CreateComplianceInput, userId: string) {
    // Closed Audits cannot receive new compliance issues
    const audit = await AuditRepository.getAuditById(input.auditId);
    if (!audit) {
      throw new Error(`Audit with ID ${input.auditId} not found.`);
    }
    if (audit.status === "COMPLETED" || audit.status === "CANCELLED") {
      throw new Error(`Cannot add compliance issues to a closed/completed audit.`);
    }

    const today = new Date();
    const utcToday = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()));
    const parsedDue = new Date(input.dueDate);
    const due = new Date(Date.UTC(parsedDue.getUTCFullYear(), parsedDue.getUTCMonth(), parsedDue.getUTCDate()));

    const initialStatus = (due.getTime() < utcToday.getTime() && input.status !== "RESOLVED") 
      ? "OVERDUE" 
      : (input.status ?? "OPEN");

    const issue = await ComplianceRepository.createIssue({
      title: input.title,
      description: input.description,
      severity: input.severity,
      departmentId: input.departmentId,
      ownerId: input.ownerId,
      dueDate: due,
      auditId: input.auditId,
      status: initialStatus,
    });

    // Create Notification on creation
    // "Creating or updating a Compliance Issue generates a Notification."
    await NotificationService.create(
      input.ownerId,
      `New Compliance Issue: ${input.title}`,
      `A new compliance issue has been assigned to you: "${input.description}". Due Date: ${due.toLocaleDateString()}`,
      "COMPLIANCE"
    );

    // Add Activity Log
    await ActivityLogService.log(
      userId,
      "COMPLIANCE",
      issue.id,
      "CREATE",
      null,
      issue
    );

    return issue;
  }

  static async updateIssue(id: string, input: UpdateComplianceInput, userId: string) {
    // Run checker
    await this.checkAndFlagOverdueIssues();

    const existing = await ComplianceRepository.getIssueById(id);
    if (!existing) {
      throw new Error(`Compliance issue with ID ${id} not found.`);
    }

    // Closed (RESOLVED) issues cannot be edited
    if (existing.status === "RESOLVED") {
      throw new Error("Closed compliance issues cannot be edited.");
    }

    const data: any = {};
    if (input.title !== undefined) data.title = input.title;
    if (input.description !== undefined) data.description = input.description;
    if (input.severity !== undefined) data.severity = input.severity;
    if (input.departmentId !== undefined) data.departmentId = input.departmentId;
    if (input.ownerId !== undefined) data.ownerId = input.ownerId;
    
    if (input.dueDate !== undefined) {
      const parsedDue = new Date(input.dueDate);
      const due = new Date(Date.UTC(parsedDue.getUTCFullYear(), parsedDue.getUTCMonth(), parsedDue.getUTCDate()));
      data.dueDate = due;
    }

    if (input.status !== undefined) {
      data.status = input.status;
      if (input.status === "RESOLVED") {
        data.resolvedAt = new Date();
      }
    }

    const updated = await ComplianceRepository.updateIssue(id, data);

    // Create Notification on update
    // "Creating or updating a Compliance Issue generates a Notification."
    await NotificationService.create(
      updated.ownerId,
      `Compliance Issue Updated: ${updated.title}`,
      `Compliance issue "${updated.title}" has been updated. Status: ${updated.status}`,
      "COMPLIANCE"
    );

    // Add Activity Log
    const action = input.status === "RESOLVED" ? "APPROVE" : "UPDATE";
    await ActivityLogService.log(
      userId,
      "COMPLIANCE",
      id,
      action,
      existing,
      updated
    );

    return updated;
  }

  static async deleteIssue(id: string, userId: string) {
    const existing = await ComplianceRepository.getIssueById(id);
    if (!existing) {
      throw new Error(`Compliance issue with ID ${id} not found.`);
    }

    if (existing.status === "RESOLVED") {
      throw new Error("Closed compliance issues cannot be deleted.");
    }

    await ComplianceRepository.deleteIssue(id);

    await ActivityLogService.log(
      userId,
      "COMPLIANCE",
      id,
      "DELETE",
      existing,
      null
    );

    return { success: true };
  }
}
export default ComplianceService;
