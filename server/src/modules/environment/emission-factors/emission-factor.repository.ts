import { prisma } from "../../../config/prisma.js";
import type { Status } from "@prisma/client";

const emissionFactorSelect = {
  id: true,
  name: true,
  source: true,
  unit: true,
  factor: true,
  description: true,
  status: true,
  createdAt: true,
  updatedAt: true,
} as const;

export function findEmissionFactors() {
  return prisma.emissionFactor.findMany({
    orderBy: { name: "asc" },
    select: emissionFactorSelect,
  });
}

export function findEmissionFactorById(id: string) {
  return prisma.emissionFactor.findFirst({
    where: { id },
    select: emissionFactorSelect,
  });
}

export function findEmissionFactorByName(name: string) {
  return prisma.emissionFactor.findFirst({
    where: { name },
    select: emissionFactorSelect,
  });
}

export function createEmissionFactor(data: {
  name: string;
  source: string;
  unit: string;
  factor: number;
  description?: string | null;
  status?: Status;
}) {
  return prisma.emissionFactor.create({
    data: {
      ...data,
      factor: data.factor.toString(), // Prisma Decimal requires string or Decimal input
    },
    select: emissionFactorSelect,
  });
}

export function updateEmissionFactor(
  id: string,
  data: {
    name?: string;
    source?: string;
    unit?: string;
    factor?: number;
    description?: string | null;
    status?: Status;
  },
) {
  const updateData: any = { ...data };
  if (data.factor !== undefined) {
    updateData.factor = data.factor.toString();
  }
  return prisma.emissionFactor.update({
    where: { id },
    data: updateData,
    select: emissionFactorSelect,
  });
}

export function deleteEmissionFactor(id: string) {
  // Wait, database policy: "never delete, mark inactive". But let's also provide a hard delete just in case,
  // or change delete to soft-deactivate. Let's make it deactivate it (soft delete).
  return prisma.emissionFactor.update({
    where: { id },
    data: { status: "INACTIVE" },
    select: emissionFactorSelect,
  });
}
