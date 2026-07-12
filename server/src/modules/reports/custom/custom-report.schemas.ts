import { z } from "zod";

export const customReportSchema = z.object({
  departmentId: z.string().uuid("Invalid department UUID.").optional().nullable(),
  startDate: z.string().datetime({ precision: 3, offset: true }).or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)).optional().nullable(),
  endDate: z.string().datetime({ precision: 3, offset: true }).or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)).optional().nullable(),
  module: z.enum(["ENVIRONMENT", "SOCIAL", "GOVERNANCE", "ALL"]).optional(),
  userId: z.string().uuid("Invalid user UUID.").optional().nullable(),
  challengeId: z.string().uuid("Invalid challenge UUID.").optional().nullable(),
  categoryId: z.string().uuid("Invalid category UUID.").optional().nullable(),
});
