import { prisma } from "../../../config/prisma.js";
import { NotificationService } from "../../shared/notifications/notification.service.js";
import { ActivityLogService } from "../../shared/activity-logs/activity-log.service.js";
import type { Status, RedemptionStatus, DifficultyLevel } from "@prisma/client";

export class GamificationService {
  // Badges logic
  static async checkAndAwardBadges(userId: string) {
    const badgeSetting = await prisma.setting.findUnique({
      where: { key: "BADGE_AUTO_AWARD" },
    });
    if (badgeSetting && badgeSetting.value !== "true") {
      return;
    }

    // 1. Fetch all badges
    const badges = await prisma.badge.findMany({
      where: { status: "ACTIVE", deletedAt: null },
    });

    // 2. Fetch earned badges for this user
    const earnedUserBadges = await prisma.userBadge.findMany({
      where: { userId },
    });
    const earnedBadgeIds = new Set(earnedUserBadges.map((ub) => ub.badgeId));

    // 3. Gather stats for user
    const approvedCsrCount = await prisma.employeeParticipation.count({
      where: { userId, approvalStatus: "APPROVED" },
    });

    const approvedChallengeCount = await prisma.challengeParticipation.count({
      where: { userId, approvalStatus: "APPROVED" },
    });

    const totalTrainingsCount = await prisma.employeeTraining.count({
      where: { userId },
    });
    const completedTrainingsCount = await prisma.employeeTraining.count({
      where: { userId, status: "COMPLETED" },
    });

    for (const badge of badges) {
      if (earnedBadgeIds.has(badge.id)) {
        continue;
      }

      let unlocked = false;
      const rule = badge.name.toLowerCase();

      if (rule.includes("eco-warrior") || badge.name === "Eco-Warrior") {
        unlocked = approvedCsrCount >= 5;
      } else if (rule.includes("first steps") || badge.name === "First Steps") {
        unlocked = approvedChallengeCount >= 1;
      } else if (rule.includes("training scholar") || badge.name === "Training Scholar") {
        unlocked = totalTrainingsCount > 0 && completedTrainingsCount === totalTrainingsCount;
      }

      if (unlocked) {
        await prisma.userBadge.create({
          data: {
            badgeId: badge.id,
            userId,
          },
        });

        await NotificationService.create(
          userId,
          "Badge Unlocked! 🏆",
          `Congratulations! You unlocked the "${badge.name}" badge: ${badge.description}`,
          "BADGE"
        );

        await ActivityLogService.log(
          userId,
          "BADGE",
          badge.id,
          "CREATE",
          null,
          { badgeName: badge.name }
        );
      }
    }
  }

  static async getBadges() {
    return prisma.badge.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: "desc" },
    });
  }

  static async getBadgesByUser(userId: string) {
    return prisma.userBadge.findMany({
      where: { userId },
      include: {
        badge: true,
      },
      orderBy: { awardedAt: "desc" },
    });
  }

  // XP logic
  static async getXpBalance(userId: string): Promise<number> {
    const aggregate = await prisma.xpTransaction.aggregate({
      where: { userId },
      _sum: { points: true },
    });
    return aggregate._sum.points ?? 0;
  }

  static async getXpTransactions(userId: string) {
    return prisma.xpTransaction.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
  }

  // Rewards logic
  static async getRewards() {
    return prisma.reward.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: "desc" },
    });
  }

  static async createReward(data: { name: string; description?: string | null; pointsRequired: number; stock: number }, creatorId: string) {
    if (data.pointsRequired <= 0) {
      throw new Error("Points Required must be greater than zero.");
    }
    const reward = await prisma.reward.create({
      data: {
        name: data.name,
        description: data.description ?? null,
        pointsRequired: data.pointsRequired,
        stock: data.stock,
        status: "ACTIVE",
      },
    });

    await ActivityLogService.log(creatorId, "REWARD", reward.id, "CREATE", null, reward);
    return reward;
  }

  static async updateReward(id: string, data: { name?: string; description?: string | null; pointsRequired?: number; stock?: number; status?: Status }, creatorId: string) {
    const existing = await prisma.reward.findUnique({ where: { id } });
    if (!existing) throw new Error("Reward not found.");

    if (data.pointsRequired !== undefined && data.pointsRequired <= 0) {
      throw new Error("Points Required must be greater than zero.");
    }
    if (data.stock !== undefined && data.stock < 0) {
      throw new Error("Stock cannot become negative.");
    }

    const updated = await prisma.reward.update({
      where: { id },
      data,
    });

    await ActivityLogService.log(creatorId, "REWARD", id, "UPDATE", existing, updated);
    return updated;
  }

  static async deleteReward(id: string, creatorId: string) {
    const existing = await prisma.reward.findUnique({ where: { id } });
    if (!existing) throw new Error("Reward not found.");

    await prisma.reward.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    await ActivityLogService.log(creatorId, "REWARD", id, "DELETE", existing, null);
  }

  static async redeemReward(rewardId: string, userId: string) {
    return prisma.$transaction(async (tx) => {
      // 1. Fetch reward
      const reward = await tx.reward.findUnique({
        where: { id: rewardId, deletedAt: null },
      });
      if (!reward) throw new Error("Reward not found.");
      if (reward.status !== "ACTIVE") throw new Error("This reward is currently inactive.");
      if (reward.stock <= 0) throw new Error("This reward is out of stock.");

      // 2. Fetch user XP balance
      const aggregate = await tx.xpTransaction.aggregate({
        where: { userId },
        _sum: { points: true },
      });
      const currentXp = aggregate._sum.points ?? 0;

      if (currentXp < reward.pointsRequired) {
        throw new Error(`Insufficient XP. You have ${currentXp} XP, but this reward requires ${reward.pointsRequired} XP.`);
      }

      // 3. Decrement stock
      await tx.reward.update({
        where: { id: rewardId },
        data: { stock: reward.stock - 1 },
      });

      // 4. Create negative XP Transaction
      await tx.xpTransaction.create({
        data: {
          userId,
          sourceType: "REWARD_REDEMPTION",
          sourceId: rewardId,
          points: -reward.pointsRequired,
          remarks: `Redeemed Reward: "${reward.name}"`,
        },
      });

      // 5. Create Redemption record
      const redemption = await tx.rewardRedemption.create({
        data: {
          rewardId,
          userId,
          status: "SUCCESS",
        },
        include: {
          reward: true,
        },
      });

      // 6. Notify user
      await NotificationService.create(
        userId,
        "Reward Redeemed! 🎉",
        `You have successfully redeemed "${reward.name}" for ${reward.pointsRequired} XP.`,
        "REWARD"
      );

      // 7. Log activity
      await ActivityLogService.log(userId, "REWARD", rewardId, "REDEEM", null, redemption);

      return redemption;
    });
  }

  static async getRedemptions(filters: { userId?: string }) {
    const where: any = {};
    if (filters.userId) where.userId = filters.userId;

    return prisma.rewardRedemption.findMany({
      where,
      include: {
        reward: true,
        user: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: { redeemedAt: "desc" },
    });
  }

  // Leaderboard logic
  static async getLeaderboard() {
    // Sum XP points per user
    const users = await prisma.user.findMany({
      where: { deletedAt: null, status: "ACTIVE" },
      select: {
        id: true,
        name: true,
        email: true,
        department: {
          select: { name: true },
        },
        xpTransactions: {
          select: { points: true },
        },
        badges: {
          select: { badgeId: true },
        },
      },
    });

    const leaderboard = users.map((user) => {
      const totalXp = user.xpTransactions.reduce((sum, tx) => sum + tx.points, 0);
      const badgesCount = user.badges.length;
      return {
        id: user.id,
        name: user.name,
        email: user.email,
        departmentName: user.department.name,
        totalXp,
        badgesCount,
      };
    });

    // Sort descending by XP, then badges count
    leaderboard.sort((a, b) => b.totalXp - a.totalXp || b.badgesCount - a.badgesCount);

    // Add Rank (1-based index)
    return leaderboard.map((entry, index) => ({
      ...entry,
      rank: index + 1,
    }));
  }
}
export default GamificationService;
