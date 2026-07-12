import { z } from "zod";

export const settingsUpdateItemSchema = z.object({
  key: z.string().min(1).max(100),
  value: z.union([z.string(), z.number(), z.boolean()]).transform((value) => String(value)),
  description: z.string().nullable().optional(),
});

export const settingsUpdateSchema = z.object({
  settings: z.array(settingsUpdateItemSchema).min(1),
});