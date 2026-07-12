import { z } from "zod";

export const createRewardSchema = z.object({
  name: z.string().min(1, "Name is required.").max(100),
  description: z.string().nullable().optional(),
  pointsRequired: z.coerce.number().int().gt(0, "Points Required must be positive."),
  stock: z.coerce.number().int().min(0, "Stock cannot be negative."),
});

export const updateRewardSchema = z.object({
  name: z.string().min(1, "Name is required.").max(100).optional(),
  description: z.string().nullable().optional(),
  pointsRequired: z.coerce.number().int().gt(0, "Points Required must be positive.").optional(),
  stock: z.coerce.number().int().min(0, "Stock cannot be negative.").optional(),
  status: z.enum(["ACTIVE", "INACTIVE"]).optional(),
});
