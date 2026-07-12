import type { GoalStatus } from "@prisma/client";

export interface EnvironmentalGoalInput {
  departmentId: string;
  title: string;
  targetValue: number;
  deadline: string; // ISO date string (YYYY-MM-DD)
  description?: string | null;
  status?: GoalStatus;
}

export interface EnvironmentalGoalUpdateInput {
  departmentId?: string;
  title?: string;
  targetValue?: number;
  deadline?: string;
  description?: string | null;
  status?: GoalStatus;
}
