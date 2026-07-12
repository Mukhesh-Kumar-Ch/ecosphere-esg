import { z } from "zod";
import { SeverityLevel, ComplianceStatus } from "@prisma/client";

export const createComplianceSchema = z.object({
  title: z.string().min(1, "Title is required.").max(150),
  description: z.string().min(1, "Description is required."),
  severity: z.nativeEnum(SeverityLevel),
  departmentId: z.string().uuid("Invalid department ID."),
  ownerId: z.string().uuid("Owner is mandatory."),
  dueDate: z.string().refine((val) => !isNaN(Date.parse(val)), "Due Date is mandatory."),
  auditId: z.string().uuid("Invalid audit ID."),
  status: z.nativeEnum(ComplianceStatus).optional(),
});

export const updateComplianceSchema = z.object({
  title: z.string().min(1).max(150).optional(),
  description: z.string().min(1).optional(),
  severity: z.nativeEnum(SeverityLevel).optional(),
  departmentId: z.string().uuid("Invalid department ID.").optional(),
  ownerId: z.string().uuid("Owner must be a valid user ID.").optional(),
  dueDate: z.string().refine((val) => !isNaN(Date.parse(val)), "Invalid due date format.").optional(),
  status: z.nativeEnum(ComplianceStatus).optional(),
});
