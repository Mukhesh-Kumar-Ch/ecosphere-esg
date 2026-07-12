import { DepartmentStatus } from "@prisma/client";
import { z } from "zod";

export const departmentParamsSchema = z.object({
  id: z.string().uuid(),
});

const departmentFieldsSchema = z.object({
  name: z.string().min(1).max(100),
  code: z.string().min(1).max(20),
  parentDepartmentId: z.string().uuid().nullable().optional(),
  headUserId: z.string().uuid().nullable().optional(),
  status: z.nativeEnum(DepartmentStatus).optional(),
});

export const createDepartmentSchema = departmentFieldsSchema;

export const updateDepartmentSchema = departmentFieldsSchema
  .partial()
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one department field is required.",
  });