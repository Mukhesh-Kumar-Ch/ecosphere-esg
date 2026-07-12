import type { Request, Response } from "express";
import { sendSuccess } from "../../../utils/response.js";
import {
  createEnvironmentalGoalRecord,
  deleteEnvironmentalGoalRecord,
  getEnvironmentalGoal,
  listEnvironmentalGoals,
  updateEnvironmentalGoalRecord,
} from "./environmental-goal.service.js";

export async function listEnvironmentalGoalsController(_request: Request, response: Response) {
  const environmentalGoals = await listEnvironmentalGoals();
  return sendSuccess(response, "Environmental goals retrieved successfully.", { environmentalGoals });
}

export async function getEnvironmentalGoalController(request: Request, response: Response) {
  const goalId = request.params["id"] as string;
  const environmentalGoal = await getEnvironmentalGoal(goalId);
  return sendSuccess(response, "Environmental goal retrieved successfully.", { environmentalGoal });
}

export async function createEnvironmentalGoalController(request: Request, response: Response) {
  const environmentalGoal = await createEnvironmentalGoalRecord(request.body);
  return sendSuccess(response, "Environmental goal created successfully.", { environmentalGoal }, 201);
}

export async function updateEnvironmentalGoalController(request: Request, response: Response) {
  const goalId = request.params["id"] as string;
  const environmentalGoal = await updateEnvironmentalGoalRecord(goalId, request.body);
  return sendSuccess(response, "Environmental goal updated successfully.", { environmentalGoal });
}

export async function deleteEnvironmentalGoalController(request: Request, response: Response) {
  const goalId = request.params["id"] as string;
  const environmentalGoal = await deleteEnvironmentalGoalRecord(goalId);
  return sendSuccess(response, "Environmental goal deleted successfully.", { environmentalGoal });
}
