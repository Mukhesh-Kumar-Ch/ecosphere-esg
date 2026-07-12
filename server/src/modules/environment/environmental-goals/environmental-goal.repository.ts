import { prisma } from "../../../config/prisma.js";
import type { GoalStatus } from "@prisma/client";

const environmentalGoalSelect = {
  id: true,
  departmentId: true,
  department: {
    select: {
      id: true,
      name: true,
      code: true,
    },
  },
  title: true,
  description: true,
  targetValue: true,
  deadline: true,
  status: true,
  createdAt: true,
  updatedAt: true,
} as const;

export function findEnvironmentalGoals() {
  return prisma.environmentalGoal.findMany({
    orderBy: { deadline: "asc" },
    select: environmentalGoalSelect,
  });
}

export function findEnvironmentalGoalById(id: string) {
  return prisma.environmentalGoal.findFirst({
    where: { id },
    select: environmentalGoalSelect,
  });
}

export function createEnvironmentalGoal(data: {
  departmentId: string;
  title: string;
  targetValue: number;
  deadline: Date;
  description?: string | null;
  status?: GoalStatus;
}) {
  return prisma.environmentalGoal.create({
    data: {
      ...data,
      targetValue: data.targetValue.toString(),
    },
    select: environmentalGoalSelect,
  });
}

export function updateEnvironmentalGoal(
  id: string,
  data: {
    departmentId?: string;
    title?: string;
    targetValue?: number;
    deadline?: Date;
    description?: string | null;
    status?: GoalStatus;
  },
) {
  const updateData: any = { ...data };
  if (data.targetValue !== undefined) {
    updateData.targetValue = data.targetValue.toString();
  }
  return prisma.environmentalGoal.update({
    where: { id },
    data: updateData,
    select: environmentalGoalSelect,
  });
}

export function deleteEnvironmentalGoal(id: string) {
  return prisma.environmentalGoal.delete({
    where: { id },
    select: environmentalGoalSelect,
  });
}
