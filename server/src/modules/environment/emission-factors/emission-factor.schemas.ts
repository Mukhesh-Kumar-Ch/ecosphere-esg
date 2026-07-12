import { Status } from "@prisma/client";
import { z } from "zod";

export const emissionFactorParamsSchema = z.object({
  id: z.string().uuid(),
});

const emissionFactorFieldsSchema = z.object({
  name: z.string().min(1).max(100),
  source: z.string().min(1).max(100),
  unit: z.string().min(1).max(30),
  factor: z.number().gt(0, "Emission factor must be positive."),
  description: z.string().nullable().optional(),
  status: z.nativeEnum(Status).optional(),
});

export const createEmissionFactorSchema = emissionFactorFieldsSchema;

export const updateEmissionFactorSchema = emissionFactorFieldsSchema
  .partial()
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one emission factor field is required.",
  });
