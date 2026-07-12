import { z } from "zod";

export const createChallengeSchema = z.object({
  title: z.string().min(1, "Title is required.").max(150),
  description: z.string().nullable().optional(),
  categoryId: z.string().uuid("Invalid category UUID."),
  difficulty: z.enum(["EASY", "MEDIUM", "HARD"]),
  xpReward: z.coerce.number().int().gt(0, "XP Reward must be positive."),
  deadline: z.string().datetime({ precision: 3, offset: true }).or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)),
  evidenceRequired: z.boolean().optional(),
  status: z.enum(["DRAFT", "ACTIVE", "UNDER_REVIEW", "COMPLETED", "ARCHIVED"]).optional(),
});

export const updateChallengeSchema = createChallengeSchema.partial();

export const updateProgressSchema = z.object({
  progress: z.coerce.number().int().min(0).max(100),
  proofFile: z.string().optional(),
});

export const approveChallengeSchema = z.object({
  approvalStatus: z.enum(["PENDING", "APPROVED", "REJECTED"]),
});
