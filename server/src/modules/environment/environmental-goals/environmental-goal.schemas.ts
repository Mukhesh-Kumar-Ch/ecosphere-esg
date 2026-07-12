import { GoalStatus } from "@prisma/client";
import { z } from "zod";

export const environmentalGoalParamsSchema = z.object({
  id: z.string().uuid(),
});

const environmentalGoalFieldsSchema = z.object({
  departmentId: z.string().uuid("Invalid department ID."),
  title: z.string().min(1).max(150, "Title must be under 150 characters."),
  targetValue: z.number().gt(0, "Target CO₂ value must be positive."),
  deadline: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid deadline date format.",
  }),
  description: z.string().nullable().optional(),
  status: z.nativeEnum(GoalStatus).optional(),
});

export const createEnvironmentalGoalSchema = environmentalGoalFieldsSchema;

export const updateEnvironmentalGoalSchema = environmentalGoalFieldsSchema
  .partial()
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one goal field is required.",
  });
