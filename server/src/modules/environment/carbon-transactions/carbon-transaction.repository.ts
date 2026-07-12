import { prisma } from "../../../config/prisma.js";
import type { SourceType } from "@prisma/client";

const carbonTransactionSelect = {
  id: true,
  departmentId: true,
  department: {
    select: {
      id: true,
      name: true,
      code: true,
    },
  },
  emissionFactorId: true,
  emissionFactor: {
    select: {
      id: true,
      name: true,
      source: true,
      unit: true,
      factor: true,
    },
  },
  sourceType: true,
  referenceNumber: true,
  quantity: true,
  calculatedEmission: true,
  createdById: true,
  creator: {
    select: {
      id: true,
      name: true,
      email: true,
    },
  },
  transactionDate: true,
  createdAt: true,
} as const;

export function findCarbonTransactions(filters?: {
  departmentId?: string;
  sourceType?: SourceType;
  emissionFactorId?: string;
}) {
  const where: any = {};
  if (filters?.departmentId) {
    where.departmentId = filters.departmentId;
  }
  if (filters?.sourceType) {
    where.sourceType = filters.sourceType;
  }
  if (filters?.emissionFactorId) {
    where.emissionFactorId = filters.emissionFactorId;
  }

  return prisma.carbonTransaction.findMany({
    where,
    orderBy: { transactionDate: "desc" },
    select: carbonTransactionSelect,
  });
}

export function findCarbonTransactionById(id: string) {
  return prisma.carbonTransaction.findFirst({
    where: { id },
    select: carbonTransactionSelect,
  });
}

export function createCarbonTransaction(data: {
  departmentId: string;
  emissionFactorId: string;
  sourceType: SourceType;
  referenceNumber?: string | null;
  quantity: number;
  calculatedEmission: number;
  createdById: string;
  transactionDate: Date;
}) {
  return prisma.carbonTransaction.create({
    data: {
      ...data,
      quantity: data.quantity.toString(),
      calculatedEmission: data.calculatedEmission.toFixed(4),
    },
    select: carbonTransactionSelect,
  });
}
