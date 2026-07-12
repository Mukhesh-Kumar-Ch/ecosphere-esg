import { z } from "zod";

export const createCsrActivitySchema = z.object({
  title: z.string().min(1, "Title is required.").max(150),
  description: z.string().nullable().optional(),
  departmentId: z.string().uuid("Invalid department UUID."),
  categoryId: z.string().uuid("Invalid category UUID."),
  startDate: z.string().datetime({ precision: 3, offset: true }).or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)),
  endDate: z.string().datetime({ precision: 3, offset: true }).or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)),
  status: z.enum(["PLANNED", "ONGOING", "COMPLETED", "CANCELLED"]).optional(),
});

export const updateCsrActivitySchema = createCsrActivitySchema.partial();

export const joinCsrActivitySchema = z.object({
  proofFile: z.string().optional(),
});

export const approveCsrActivitySchema = z.object({
  approvalStatus: z.enum(["PENDING", "APPROVED", "REJECTED"]),
});
