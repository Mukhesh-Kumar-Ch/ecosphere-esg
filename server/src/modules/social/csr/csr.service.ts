import { CsrRepository } from "./csr.repository.js";
import { prisma } from "../../../config/prisma.js";
import { ActivityLogService } from "../../shared/activity-logs/activity-log.service.js";
import { NotificationService } from "../../shared/notifications/notification.service.js";
import { GamificationService } from "../gamification/gamification.service.js";
import type { ActivityStatus, ApprovalStatus } from "@prisma/client";

export interface CreateCsrInput {
  title: string;
  description?: string | null;
  departmentId: string;
  categoryId: string;
  startDate: string;
  endDate: string;
  status?: ActivityStatus;
}

export class CsrService {
  static async getActivities(filters: {
    search?: string;
    status?: ActivityStatus;
    departmentId?: string;
    categoryId?: string;
  }) {
    return CsrRepository.getActivities(filters);
  }

  static async getActivityById(id: string) {
    const activity = await CsrRepository.getActivityById(id);
    if (!activity) {
      throw new Error("CSR Activity not found.");
    }
    return activity;
  }

  static async createActivity(input: CreateCsrInput, userId: string) {
    const start = new Date(input.startDate);
    const end = new Date(input.endDate);

    if (end.getTime() < start.getTime()) {
      throw new Error("End Date must be greater than or equal to Start Date.");
    }

    const activity = await CsrRepository.createActivity({
      title: input.title,
      description: input.description ?? null,
      departmentId: input.departmentId,
      categoryId: input.categoryId,
      startDate: start,
      endDate: end,
      status: input.status ?? "PLANNED",
      createdById: userId,
    });

    await ActivityLogService.log(
      userId,
      "CSR_ACTIVITY",
      activity.id,
      "CREATE",
      null,
      activity
    );

    return activity;
  }

  static async updateActivity(id: string, input: Partial<CreateCsrInput>, userId: string) {
    const existing = await this.getActivityById(id);

    const start = input.startDate ? new Date(input.startDate) : existing.startDate;
    const end = input.endDate ? new Date(input.endDate) : existing.endDate;

    if (end.getTime() < start.getTime()) {
      throw new Error("End Date must be greater than or equal to Start Date.");
    }

    const data: any = {};
    if (input.title !== undefined) data.title = input.title;
    if (input.description !== undefined) data.description = input.description ?? null;
    if (input.departmentId !== undefined) data.departmentId = input.departmentId;
    if (input.categoryId !== undefined) data.categoryId = input.categoryId;
    if (input.startDate !== undefined) data.startDate = start;
    if (input.endDate !== undefined) data.endDate = end;
    if (input.status !== undefined) data.status = input.status;

    const activity = await CsrRepository.updateActivity(id, data);

    await ActivityLogService.log(
      userId,
      "CSR_ACTIVITY",
      activity.id,
      "UPDATE",
      existing,
      activity
    );

    return activity;
  }

  static async deleteActivity(id: string, userId: string) {
    const existing = await this.getActivityById(id);
    await CsrRepository.deleteActivity(id);

    await ActivityLogService.log(
      userId,
      "CSR_ACTIVITY",
      id,
      "DELETE",
      existing,
      null
    );
  }

  // Participation logic
  static async joinActivity(activityId: string, userId: string) {
    const activity = await this.getActivityById(activityId);

    if (activity.status === "COMPLETED" || activity.status === "CANCELLED") {
      throw new Error("Cannot join a completed or cancelled CSR Activity.");
    }

    const existingParticipation = await CsrRepository.getParticipation(activityId, userId);
    if (existingParticipation) {
      throw new Error("You have already joined this CSR activity.");
    }

    const participation = await CsrRepository.createParticipation({
      activityId,
      userId,
      approvalStatus: "PENDING",
    });

    await NotificationService.create(
      userId,
      "CSR Activity Joined",
      `You successfully joined the CSR activity: "${activity.title}".`,
      "CSR"
    );

    return participation;
  }

  static async submitProof(activityId: string, userId: string, proofFile: string) {
    const participation = await CsrRepository.getParticipation(activityId, userId);
    if (!participation) {
      throw new Error("You are not registered for this CSR activity.");
    }

    if (participation.approvalStatus === "APPROVED") {
      throw new Error("Your participation has already been approved.");
    }

    const updated = await CsrRepository.updateParticipation(participation.id, {
      proofFile,
    });

    return updated;
  }

  static async approveParticipation(participationId: string, approvalStatus: ApprovalStatus, approverId: string) {
    const participation = await CsrRepository.getParticipationById(participationId);
    if (!participation) {
      throw new Error("Participation record not found.");
    }

    if (participation.approvalStatus !== "PENDING") {
      throw new Error(`Participation has already been ${participation.approvalStatus.toLowerCase()}.`);
    }

    // Respect EVIDENCE_REQUIRED setting
    const evidenceSetting = await prisma.setting.findUnique({
      where: { key: "EVIDENCE_REQUIRED" },
    });
    const evidenceRequired = evidenceSetting?.value === "true";

    if (approvalStatus === "APPROVED" && evidenceRequired && !participation.proofFile) {
      throw new Error("Evidence proof is required before participation can be approved.");
    }

    const updated = await CsrRepository.updateParticipation(participationId, {
      approvalStatus,
      approvedById: approverId,
      approvedAt: new Date(),
      completionDate: approvalStatus === "APPROVED" ? new Date() : null,
    });

    // Logging & Notification
    await ActivityLogService.log(
      approverId,
      "CSR_ACTIVITY",
      participation.activityId,
      approvalStatus === "APPROVED" ? "APPROVE" : "REJECT",
      participation,
      updated
    );

    if (approvalStatus === "APPROVED") {
      // Award XP
      const xpSetting = await prisma.setting.findUnique({
        where: { key: "CSR_XP_AWARD" },
      });
      const xpPoints = xpSetting ? parseInt(xpSetting.value) || 100 : 100;

      await prisma.xpTransaction.create({
        data: {
          userId: participation.userId,
          sourceType: "CSR",
          sourceId: participation.activityId,
          points: xpPoints,
          remarks: `Participation in CSR Activity: "${participation.activity.title}"`,
        },
      });

      await NotificationService.create(
        participation.userId,
        "CSR Participation Approved",
        `Your participation in "${participation.activity.title}" has been approved! Awarded ${xpPoints} XP.`,
        "CSR"
      );

      // Trigger Badge Auto Award Check
      await GamificationService.checkAndAwardBadges(participation.userId);
    } else {
      await NotificationService.create(
        participation.userId,
        "CSR Participation Rejected",
        `Your participation request in "${participation.activity.title}" has been rejected.`,
        "CSR"
      );
    }

    return updated;
  }

  static async getParticipations(filters: { userId?: string; activityId?: string; approvalStatus?: ApprovalStatus }) {
    return CsrRepository.getParticipations(filters);
  }
}
