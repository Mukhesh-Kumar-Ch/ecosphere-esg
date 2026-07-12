import type { SourceType } from "@prisma/client";

export interface CarbonTransactionInput {
  departmentId: string;
  emissionFactorId: string;
  sourceType: SourceType;
  referenceNumber?: string | null;
  quantity: number;
  transactionDate: string; // ISO date string (YYYY-MM-DD)
}
