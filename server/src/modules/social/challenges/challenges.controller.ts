import type { Request, Response, NextFunction } from "express";
import { ChallengesService } from "./challenges.service.js";
import { createChallengeSchema, updateChallengeSchema, updateProgressSchema, approveChallengeSchema } from "./challenges.schemas.js";
import type { ChallengeStatus, ApprovalStatus } from "@prisma/client";

export class ChallengesController {
  static async getChallenges(req: Request, res: Response, next: NextFunction) {
    try {
      const filters: any = {};
      const searchVal = req.query['search'];
      const statusVal = req.query['status'];
      const catVal = req.query['categoryId'];

      if (typeof searchVal === "string" && searchVal) {
        filters.search = searchVal;
      }
      if (typeof statusVal === "string" && statusVal) {
        filters.status = statusVal as ChallengeStatus;
      }
      if (typeof catVal === "string" && catVal) {
        filters.categoryId = catVal;
      }

      const challenges = await ChallengesService.getChallenges(filters);
      res.json({ challenges });
    } catch (error) {
      next(error);
    }
  }

  static async getChallengeById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params['id'] as string;
      const challenge = await ChallengesService.getChallengeById(id);
      res.json({ challenge });
    } catch (error) {
      next(error);
    }
  }

  static async createChallenge(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = createChallengeSchema.parse(req.body);
      const userId = (req as any).user.id as string;

      const input: any = {
        title: validated.title,
        categoryId: validated.categoryId,
        difficulty: validated.difficulty,
        xpReward: validated.xpReward,
        deadline: validated.deadline,
      };
      if (validated.description !== undefined) {
        input.description = validated.description || null;
      }
      if (validated.evidenceRequired !== undefined) {
        input.evidenceRequired = validated.evidenceRequired;
      }
      if (validated.status !== undefined) {
        input.status = validated.status;
      }

      const challenge = await ChallengesService.createChallenge(input, userId);
      res.status(201).json({ challenge });
    } catch (error) {
      next(error);
    }
  }

  static async updateChallenge(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params['id'] as string;
      const validated = updateChallengeSchema.parse(req.body);
      const userId = (req as any).user.id as string;

      const input: any = {};
      if (validated.title !== undefined) input.title = validated.title;
      if (validated.description !== undefined) input.description = validated.description || null;
      if (validated.categoryId !== undefined) input.categoryId = validated.categoryId;
      if (validated.difficulty !== undefined) input.difficulty = validated.difficulty;
      if (validated.xpReward !== undefined) input.xpReward = validated.xpReward;
      if (validated.deadline !== undefined) input.deadline = validated.deadline;
      if (validated.evidenceRequired !== undefined) input.evidenceRequired = validated.evidenceRequired;
      if (validated.status !== undefined) input.status = validated.status;

      const challenge = await ChallengesService.updateChallenge(id, input, userId);
      res.json({ challenge });
    } catch (error) {
      next(error);
    }
  }

  static async deleteChallenge(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params['id'] as string;
      const userId = (req as any).user.id as string;

      await ChallengesService.deleteChallenge(id, userId);
      res.json({ success: true, message: "Challenge deleted successfully." });
    } catch (error) {
      next(error);
    }
  }

  static async joinChallenge(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params['id'] as string;
      const userId = (req as any).user.id as string;

      const participation = await ChallengesService.joinChallenge(id, userId);
      res.status(201).json({ participation });
    } catch (error) {
      next(error);
    }
  }

  static async updateProgress(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params['id'] as string;
      const userId = (req as any).user.id as string;
      const { progress, proofFile } = updateProgressSchema.parse(req.body);

      const participation = await ChallengesService.updateProgress(id, userId, progress, proofFile || undefined);
      res.json({ participation });
    } catch (error) {
      next(error);
    }
  }

  static async approveParticipation(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params['id'] as string;
      const { approvalStatus } = approveChallengeSchema.parse(req.body);
      const approverId = (req as any).user.id as string;

      const participation = await ChallengesService.approveParticipation(id, approvalStatus, approverId);
      res.json({ participation });
    } catch (error) {
      next(error);
    }
  }

  static async getParticipations(req: Request, res: Response, next: NextFunction) {
    try {
      const filters: any = {};
      const userVal = req.query['userId'];
      const challVal = req.query['challengeId'];
      const statusVal = req.query['approvalStatus'];

      if (typeof userVal === "string" && userVal) {
        filters.userId = userVal;
      }
      if (typeof challVal === "string" && challVal) {
        filters.challengeId = challVal;
      }
      if (typeof statusVal === "string" && statusVal) {
        filters.approvalStatus = statusVal as ApprovalStatus;
      }

      const participations = await ChallengesService.getParticipations(filters);
      res.json({ participations });
    } catch (error) {
      next(error);
    }
  }
}
export default ChallengesController;
