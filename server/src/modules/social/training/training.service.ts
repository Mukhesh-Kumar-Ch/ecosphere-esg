import { prisma } from "../../../config/prisma.js";
import { NotificationService } from "../../shared/notifications/notification.service.js";
import { ActivityLogService } from "../../shared/activity-logs/activity-log.service.js";
import { GamificationService } from "../gamification/gamification.service.js";
import type { TrainingStatus } from "@prisma/client";

export class TrainingService {
  static async getTrainings(filters: { userId?: string; status?: TrainingStatus }) {
    const where: any = {};
    if (filters.userId) where.userId = filters.userId;
    if (filters.status) where.status = filters.status;

    return prisma.employeeTraining.findMany({
      where,
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  static async createTraining(data: { userId: string; title: string; description?: string | null }, creatorId?: string) {
    const training = await prisma.employeeTraining.create({
      data: {
        userId: data.userId,
        title: data.title,
        description: data.description ?? null,
        status: "ASSIGNED",
        progress: 0,
      },
    });

    await NotificationService.create(
      data.userId,
      "New Training Assigned",
      `You have been assigned a new ESG training: "${data.title}".`,
      "SYSTEM"
    );

    // Activity Log (BR-006)
    const logUserId = creatorId ?? data.userId;
    await ActivityLogService.log(
      logUserId,
      "USER",
      data.userId,
      "CREATE",
      null,
      { trainingId: training.id, title: training.title, status: training.status }
    );

    return training;
  }

  static async updateTrainingProgress(id: string, progress: number) {
    if (progress < 0 || progress > 100) {
      throw new Error("Progress must remain between 0 and 100.");
    }

    const existing = await prisma.employeeTraining.findUnique({
      where: { id },
    });
    if (!existing) {
      throw new Error("Training record not found.");
    }

    if (existing.status === "COMPLETED") {
      throw new Error("Training has already been completed.");
    }

    const isCompleted = progress === 100;
    const updated = await prisma.employeeTraining.update({
      where: { id },
      data: {
        progress,
        status: isCompleted ? "COMPLETED" : "ASSIGNED",
        completionDate: isCompleted ? new Date() : null,
      },
    });

    if (isCompleted) {
      // Award 50 XP
      const xpPoints = 50;
      await prisma.xpTransaction.create({
        data: {
          userId: existing.userId,
          sourceType: "ADMIN",
          sourceId: id,
          points: xpPoints,
          remarks: `Completed Training Course: "${existing.title}"`,
        },
      });

      await NotificationService.create(
        existing.userId,
        "Training Course Completed! 🎓",
        `You completed the course "${existing.title}"! Awarded ${xpPoints} XP.`,
        "SYSTEM"
      );

      // Activity Log for training completion (BR-006)
      await ActivityLogService.log(
        existing.userId,
        "USER",
        existing.userId,
        "UPDATE",
        { status: "ASSIGNED", progress: existing.progress },
        { trainingId: id, title: existing.title, status: "COMPLETED", progress: 100 }
      );

      // Check badge auto-unlock (especially for "Training Scholar")
      await GamificationService.checkAndAwardBadges(existing.userId);
    }

    return updated;
  }

  static async deleteTraining(id: string) {
    return prisma.employeeTraining.delete({
      where: { id },
    });
  }
}
export default TrainingService;
