import { z } from "zod";
import { AuditStatus } from "@prisma/client";

export const createAuditSchema = z.object({
  title: z.string().min(1, "Title is required.").max(150),
  description: z.string().nullable().optional(),
  departmentId: z.string().uuid("Invalid department ID."),
  auditStartDate: z.string().refine((val) => !isNaN(Date.parse(val)), "Invalid start date format."),
  auditEndDate: z.string().refine((val) => !isNaN(Date.parse(val)), "Invalid end date format."),
  auditorId: z.string().uuid("Invalid auditor ID."),
  status: z.nativeEnum(AuditStatus).optional(),
  findings: z.string().nullable().optional(),
  score: z.coerce.number().min(0).max(100).nullable().optional(),
});

export const updateAuditSchema = z.object({
  title: z.string().min(1).max(150).optional(),
  description: z.string().nullable().optional(),
  departmentId: z.string().uuid("Invalid department ID.").optional(),
  auditStartDate: z.string().refine((val) => !isNaN(Date.parse(val)), "Invalid start date format.").optional(),
  auditEndDate: z.string().refine((val) => !isNaN(Date.parse(val)), "Invalid end date format.").optional(),
  auditorId: z.string().uuid("Invalid auditor ID.").optional(),
  status: z.nativeEnum(AuditStatus).optional(),
  findings: z.string().nullable().optional(),
  score: z.coerce.number().min(0).max(100).nullable().optional(),
});
