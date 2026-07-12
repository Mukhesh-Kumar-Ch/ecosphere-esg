import { CategoryStatus, CategoryType } from "@prisma/client";
import { z } from "zod";

export const categoryParamsSchema = z.object({
  id: z.string().uuid(),
});

const categoryFieldsSchema = z.object({
  name: z.string().min(1).max(100),
  type: z.nativeEnum(CategoryType),
  status: z.nativeEnum(CategoryStatus).optional(),
});

export const createCategorySchema = categoryFieldsSchema;

export const updateCategorySchema = categoryFieldsSchema
  .partial()
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one category field is required.",
  });