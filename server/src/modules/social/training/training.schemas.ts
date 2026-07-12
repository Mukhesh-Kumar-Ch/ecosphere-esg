import { z } from "zod";

export const createTrainingSchema = z.object({
  userId: z.string().uuid("Invalid user UUID."),
  title: z.string().min(1, "Title is required.").max(150),
  description: z.string().nullable().optional(),
});

export const updateProgressSchema = z.object({
  progress: z.coerce.number().int().min(0).max(100),
});
