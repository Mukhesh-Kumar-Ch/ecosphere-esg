import { ChallengesRepository } from "./challenges.repository.js";
import { prisma } from "../../../config/prisma.js";
import { ActivityLogService } from "../../shared/activity-logs/activity-log.service.js";
import { NotificationService } from "../../shared/notifications/notification.service.js";
import { GamificationService } from "../gamification/gamification.service.js";
import type { ChallengeStatus, ApprovalStatus, DifficultyLevel } from "@prisma/client";

export interface CreateChallengeInput {
  title: string;
  description?: string | null;
  categoryId: string;
  difficulty: DifficultyLevel;
  xpReward: number;
  deadline: string;
  evidenceRequired?: boolean;
  status?: ChallengeStatus;
}

export class ChallengesService {
  static async getChallenges(filters: {
    search?: string;
    status?: ChallengeStatus;
    categoryId?: string;
  }) {
    return ChallengesRepository.getChallenges(filters);
  }

  static async getChallengeById(id: string) {
    const challenge = await ChallengesRepository.getChallengeById(id);
    if (!challenge) {
      throw new Error("Challenge not found.");
    }
    return challenge;
  }

  static async createChallenge(input: CreateChallengeInput, userId: string) {
    if (input.xpReward <= 0) {
      throw new Error("Challenge XP Reward must be positive.");
    }

    const challenge = await ChallengesRepository.createChallenge({
      title: input.title,
      description: input.description ?? null,
      categoryId: input.categoryId,
      difficulty: input.difficulty,
      xpReward: input.xpReward,
      deadline: new Date(input.deadline),
      evidenceRequired: input.evidenceRequired ?? false,
      status: input.status ?? "DRAFT",
    });

    await ActivityLogService.log(
      userId,
      "CHALLENGE",
      challenge.id,
      "CREATE",
      null,
      challenge
    );

    return challenge;
  }

  static async updateChallenge(id: string, input: Partial<CreateChallengeInput>, userId: string) {
    const existing = await this.getChallengeById(id);

    if (input.xpReward !== undefined && input.xpReward <= 0) {
      throw new Error("Challenge XP Reward must be positive.");
    }

    // Validate lifecycle transitions: Draft -> Active -> Under Review -> Completed
    if (input.status && input.status !== existing.status) {
      const allowed: Record<ChallengeStatus, ChallengeStatus[]> = {
        DRAFT: ["ACTIVE", "ARCHIVED"],
        ACTIVE: ["UNDER_REVIEW", "COMPLETED", "ARCHIVED"],
        UNDER_REVIEW: ["COMPLETED", "ACTIVE", "ARCHIVED"],
        COMPLETED: ["ARCHIVED"],
        ARCHIVED: ["DRAFT", "ACTIVE", "UNDER_REVIEW", "COMPLETED"], // Can move out if needed
      };
      if (!allowed[existing.status].includes(input.status)) {
        throw new Error(`Invalid challenge status transition from ${existing.status} to ${input.status}.`);
      }
    }

    const data: any = {};
    if (input.title !== undefined) data.title = input.title;
    if (input.description !== undefined) data.description = input.description ?? null;
    if (input.categoryId !== undefined) data.categoryId = input.categoryId;
    if (input.difficulty !== undefined) data.difficulty = input.difficulty;
    if (input.xpReward !== undefined) data.xpReward = input.xpReward;
    if (input.deadline !== undefined) data.deadline = new Date(input.deadline);
    if (input.evidenceRequired !== undefined) data.evidenceRequired = input.evidenceRequired;
    if (input.status !== undefined) data.status = input.status;

    const challenge = await ChallengesRepository.updateChallenge(id, data);

    await ActivityLogService.log(
      userId,
      "CHALLENGE",
      challenge.id,
      "UPDATE",
      existing,
      challenge
    );

    return challenge;
  }

  static async deleteChallenge(id: string, userId: string) {
    const existing = await this.getChallengeById(id);
    await ChallengesRepository.deleteChallenge(id);

    await ActivityLogService.log(
      userId,
      "CHALLENGE",
      id,
      "DELETE",
      existing,
      null
    );
  }

  // Participation logic
  static async joinChallenge(challengeId: string, userId: string) {
    const challenge = await this.getChallengeById(challengeId);

    if (challenge.status === "ARCHIVED") {
      throw new Error("Archived challenges cannot receive new participants.");
    }
    if (challenge.status === "COMPLETED") {
      throw new Error("Completed challenges are closed for new entries.");
    }

    const existing = await ChallengesRepository.getParticipation(challengeId, userId);
    if (existing) {
      throw new Error("You are already participating in this challenge.");
    }

    const participation = await ChallengesRepository.createParticipation({
      challengeId,
      userId,
      progress: 0,
      approvalStatus: "PENDING",
    });

    await NotificationService.create(
      userId,
      "Challenge Joined",
      `You joined the challenge: "${challenge.title}". Good luck!`,
      "CHALLENGE"
    );

    return participation;
  }

  static async updateProgress(challengeId: string, userId: string, progress: number, proofFile?: string) {
    if (progress < 0 || progress > 100) {
      throw new Error("Progress must remain between 0 and 100.");
    }

    const challenge = await this.getChallengeById(challengeId);
    const participation = await ChallengesRepository.getParticipation(challengeId, userId);
    if (!participation) {
      throw new Error("You are not registered for this challenge.");
    }

    if (participation.completedAt) {
      throw new Error("You have already completed this challenge.");
    }

    const updateData: any = { progress };
    if (proofFile !== undefined) {
      updateData.proofFile = proofFile;
    }

    if (progress === 100) {
      if (challenge.evidenceRequired && !proofFile && !participation.proofFile) {
        throw new Error("Evidence proof is required to complete this challenge.");
      }

      if (challenge.evidenceRequired) {
        // Enforce under review
        updateData.approvalStatus = "PENDING";
      } else {
        // Auto-approve and complete
        updateData.approvalStatus = "APPROVED";
        updateData.completedAt = new Date();
        updateData.approvedAt = new Date();
      }
    }

    const updated = await ChallengesRepository.updateParticipation(participation.id, updateData);

    // If auto-approved, award XP immediately
    if (progress === 100 && !challenge.evidenceRequired) {
      await prisma.xpTransaction.create({
        data: {
          userId,
          sourceType: "CHALLENGE",
          sourceId: challengeId,
          points: challenge.xpReward,
          remarks: `Completed Challenge: "${challenge.title}"`,
        },
      });

      await NotificationService.create(
        userId,
        "Challenge Completed! 🌟",
        `You completed "${challenge.title}"! Awarded ${challenge.xpReward} XP.`,
        "CHALLENGE"
      );

      // Check badges
      await GamificationService.checkAndAwardBadges(userId);
    }

    return updated;
  }

  static async approveParticipation(participationId: string, approvalStatus: ApprovalStatus, approverId: string) {
    const participation = await ChallengesRepository.getParticipationById(participationId);
    if (!participation) {
      throw new Error("Participation record not found.");
    }

    if (participation.approvalStatus !== "PENDING") {
      throw new Error(`Participation has already been ${participation.approvalStatus.toLowerCase()}.`);
    }

    const updated = await ChallengesRepository.updateParticipation(participationId, {
      approvalStatus,
      approvedById: approverId,
      approvedAt: new Date(),
      completedAt: approvalStatus === "APPROVED" ? new Date() : null,
      progress: approvalStatus === "APPROVED" ? 100 : participation.progress,
    });

    await ActivityLogService.log(
      approverId,
      "CHALLENGE",
      participation.challengeId,
      approvalStatus === "APPROVED" ? "APPROVE" : "REJECT",
      participation,
      updated
    );

    if (approvalStatus === "APPROVED") {
      // Award XP
      await prisma.xpTransaction.create({
        data: {
          userId: participation.userId,
          sourceType: "CHALLENGE",
          sourceId: participation.challengeId,
          points: participation.challenge.xpReward,
          remarks: `Completed Challenge: "${participation.challenge.title}"`,
        },
      });

      await NotificationService.create(
        participation.userId,
        "Challenge Participation Approved! 🌟",
        `Your completion of "${participation.challenge.title}" has been approved! Awarded ${participation.challenge.xpReward} XP.`,
        "CHALLENGE"
      );

      // Trigger Badge Auto Award Check
      await GamificationService.checkAndAwardBadges(participation.userId);
    } else {
      await NotificationService.create(
        participation.userId,
        "Challenge Participation Rejected",
        `Your request for "${participation.challenge.title}" has been rejected.`,
        "CHALLENGE"
      );
    }

    return updated;
  }

  static async getParticipations(filters: { userId?: string; challengeId?: string; approvalStatus?: ApprovalStatus }) {
    return ChallengesRepository.getParticipations(filters);
  }
}
export default ChallengesService;
