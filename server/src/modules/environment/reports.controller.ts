import type { Request, Response } from "express";
import { sendSuccess } from "../../utils/response.js";
import { getEnvironmentReport } from "./reports.service.js";

export async function getEnvironmentReportController(_request: Request, response: Response) {
  const report = await getEnvironmentReport();
  return sendSuccess(response, "Environmental report retrieved successfully.", report);
}
