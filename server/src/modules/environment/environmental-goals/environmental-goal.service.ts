import { HttpError } from "../../../utils/http-error.js";
import {
  createEnvironmentalGoal,
  deleteEnvironmentalGoal,
  findEnvironmentalGoalById,
  findEnvironmentalGoals,
  updateEnvironmentalGoal,
} from "./environmental-goal.repository.js";
import type { EnvironmentalGoalInput, EnvironmentalGoalUpdateInput } from "./environmental-goal.types.js";

export async function listEnvironmentalGoals() {
  return findEnvironmentalGoals();
}

export async function getEnvironmentalGoal(id: string) {
  const goal = await findEnvironmentalGoalById(id);

  if (!goal) {
    throw new HttpError(404, "Environmental goal not found.", "GOAL_NOT_FOUND");
  }

  return goal;
}

export async function createEnvironmentalGoalRecord(input: EnvironmentalGoalInput) {
  // Verify department exists
  const { findDepartmentById } = await import("../../organization/departments/department.repository.js");
  const dept = await findDepartmentById(input.departmentId);
  if (!dept) {
    throw new HttpError(404, "Department not found.", "DEPARTMENT_NOT_FOUND");
  }

  if (input.targetValue <= 0) {
    throw new HttpError(400, "Target value must be positive.", "INVALID_TARGET");
  }

  return createEnvironmentalGoal({
    ...input,
    deadline: new Date(input.deadline),
  });
}

export async function updateEnvironmentalGoalRecord(id: string, input: EnvironmentalGoalUpdateInput) {
  const existing = await findEnvironmentalGoalById(id);

  if (!existing) {
    throw new HttpError(404, "Environmental goal not found.", "GOAL_NOT_FOUND");
  }

  // BR-ENV-005: Completed goals become read-only.
  if (existing.status === "COMPLETED") {
    throw new HttpError(400, "Completed goals are read-only and cannot be modified.", "COMPLETED_GOAL_READ_ONLY");
  }

  if (input.departmentId !== undefined) {
    const { findDepartmentById } = await import("../../organization/departments/department.repository.js");
    const dept = await findDepartmentById(input.departmentId);
    if (!dept) {
      throw new HttpError(404, "Department not found.", "DEPARTMENT_NOT_FOUND");
    }
  }

  if (input.targetValue !== undefined && input.targetValue <= 0) {
    throw new HttpError(400, "Target value must be positive.", "INVALID_TARGET");
  }

  const updateData: any = {};
  if (input.departmentId !== undefined) updateData.departmentId = input.departmentId;
  if (input.title !== undefined) updateData.title = input.title;
  if (input.targetValue !== undefined) updateData.targetValue = input.targetValue;
  if (input.description !== undefined) updateData.description = input.description;
  if (input.status !== undefined) updateData.status = input.status;
  if (input.deadline !== undefined) updateData.deadline = new Date(input.deadline);

  return updateEnvironmentalGoal(id, updateData);
}

export async function deleteEnvironmentalGoalRecord(id: string) {
  const existing = await findEnvironmentalGoalById(id);

  if (!existing) {
    throw new HttpError(404, "Environmental goal not found.", "GOAL_NOT_FOUND");
  }

  if (existing.status === "COMPLETED") {
    throw new HttpError(400, "Completed goals cannot be deleted.", "COMPLETED_GOAL_READ_ONLY");
  }

  return deleteEnvironmentalGoal(id);
}
