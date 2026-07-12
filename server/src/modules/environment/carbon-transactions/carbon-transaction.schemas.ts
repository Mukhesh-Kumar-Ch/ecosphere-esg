import { SourceType } from "@prisma/client";
import { z } from "zod";

export const carbonTransactionParamsSchema = z.object({
  id: z.string().uuid(),
});

export const createCarbonTransactionSchema = z.object({
  departmentId: z.string().uuid("Invalid department ID."),
  emissionFactorId: z.string().uuid("Invalid emission factor ID."),
  sourceType: z.nativeEnum(SourceType),
  referenceNumber: z.string().nullable().optional(),
  quantity: z.number().gt(0, "Quantity must be positive."),
  transactionDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid transaction date format.",
  }),
});
