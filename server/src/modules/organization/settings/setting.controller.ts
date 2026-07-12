import type { Request, Response } from "express";
import { sendSuccess } from "../../../utils/response.js";
import { listSettings, updateSettingsRecord } from "./setting.service.js";

export async function listSettingsController(_request: Request, response: Response) {
  const settings = await listSettings();

  return sendSuccess(response, "Settings retrieved successfully.", { settings });
}

export async function updateSettingsController(request: Request, response: Response) {
  const settings = await updateSettingsRecord(request.user!.id, request.body.settings);

  return sendSuccess(response, "Settings updated successfully.", { settings });
}