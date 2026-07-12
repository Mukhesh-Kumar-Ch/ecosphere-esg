import type { Request, Response, NextFunction } from "express";
import { GamificationService } from "./gamification.service.js";
import { createRewardSchema, updateRewardSchema } from "./gamification.schemas.js";
import type { Status } from "@prisma/client";
import { sendSuccess } from "../../../utils/response.js";

export class GamificationController {
  // Badges
  static async getBadges(req: Request, res: Response, next: NextFunction) {
    try {
      const badges = await GamificationService.getBadges();
      return sendSuccess(res, "Badges retrieved successfully.", { badges });
    } catch (error) {
      next(error);
    }
  }

  static async getMyBadges(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.id as string;
      const badges = await GamificationService.getBadgesByUser(userId);
      return sendSuccess(res, "My badges retrieved successfully.", { badges });
    } catch (error) {
      next(error);
    }
  }

  // XP
  static async getMyXp(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.id as string;
      const balance = await GamificationService.getXpBalance(userId);
      const history = await GamificationService.getXpTransactions(userId);
      return sendSuccess(res, "XP details retrieved successfully.", { balance, history });
    } catch (error) {
      next(error);
    }
  }

  // Rewards
  static async getRewards(req: Request, res: Response, next: NextFunction) {
    try {
      const rewards = await GamificationService.getRewards();
      return sendSuccess(res, "Rewards retrieved successfully.", { rewards });
    } catch (error) {
      next(error);
    }
  }

  static async createReward(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = createRewardSchema.parse(req.body);
      const creatorId = (req as any).user.id as string;

      const input: any = {
        name: validated.name,
        pointsRequired: validated.pointsRequired,
        stock: validated.stock,
      };
      if (validated.description !== undefined) {
        input.description = validated.description || null;
      }

      const reward = await GamificationService.createReward(input, creatorId);
      return sendSuccess(res, "Reward created successfully.", { reward }, 201);
    } catch (error) {
      next(error);
    }
  }

  static async updateReward(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params['id'] as string;
      const validated = updateRewardSchema.parse(req.body);
      const creatorId = (req as any).user.id as string;

      const input: any = {};
      if (validated.name !== undefined) input.name = validated.name;
      if (validated.description !== undefined) input.description = validated.description || null;
      if (validated.pointsRequired !== undefined) input.pointsRequired = validated.pointsRequired;
      if (validated.stock !== undefined) input.stock = validated.stock;
      if (validated.status !== undefined) input.status = validated.status;

      const reward = await GamificationService.updateReward(id, input, creatorId);
      return sendSuccess(res, "Reward updated successfully.", { reward });
    } catch (error) {
      next(error);
    }
  }

  static async deleteReward(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params['id'] as string;
      const creatorId = (req as any).user.id as string;

      await GamificationService.deleteReward(id, creatorId);
      return sendSuccess(res, "Reward deleted successfully.", { success: true });
    } catch (error) {
      next(error);
    }
  }

  static async redeemReward(req: Request, res: Response, next: NextFunction) {
    try {
      const rewardId = req.params['id'] as string;
      const userId = (req as any).user.id as string;

      const redemption = await GamificationService.redeemReward(rewardId, userId);
      return sendSuccess(res, "Reward redeemed successfully.", { redemption }, 201);
    } catch (error) {
      next(error);
    }
  }

  static async getRedemptions(req: Request, res: Response, next: NextFunction) {
    try {
      const filters: any = {};
      const userVal = req.query['userId'];
      if (typeof userVal === "string" && userVal) {
        filters.userId = userVal;
      }

      const redemptions = await GamificationService.getRedemptions(filters);
      return sendSuccess(res, "Redemptions retrieved successfully.", { redemptions });
    } catch (error) {
      next(error);
    }
  }

  // Leaderboard
  static async getLeaderboard(req: Request, res: Response, next: NextFunction) {
    try {
      const leaderboard = await GamificationService.getLeaderboard();
      return sendSuccess(res, "Leaderboard retrieved successfully.", { leaderboard });
    } catch (error) {
      next(error);
    }
  }
}
export default GamificationController;
