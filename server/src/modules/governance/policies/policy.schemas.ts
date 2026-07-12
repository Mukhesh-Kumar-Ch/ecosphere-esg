import { z } from "zod";
import { PolicyStatus } from "@prisma/client";

export const createPolicySchema = z.object({
  title: z.string().min(1, "Title must not be empty.").max(200),
  description: z.string().nullable().optional(),
  version: z.string().min(1, "Version must not be empty.").max(20),
  effectiveDate: z.string().refine((val) => !isNaN(Date.parse(val)), "Invalid effective date format."),
  status: z.nativeEnum(PolicyStatus).optional(),
});

export const updatePolicySchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().nullable().optional(),
  version: z.string().min(1).max(20).optional(),
  effectiveDate: z.string().refine((val) => !isNaN(Date.parse(val)), "Invalid effective date format.").optional(),
  status: z.nativeEnum(PolicyStatus).optional(),
});
