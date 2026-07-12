import type { Request, Response } from "express";
import { sendSuccess } from "../../../utils/response.js";
import {
  createEmissionFactorRecord,
  deleteEmissionFactorRecord,
  getEmissionFactor,
  listEmissionFactors,
  updateEmissionFactorRecord,
} from "./emission-factor.service.js";

export async function listEmissionFactorsController(_request: Request, response: Response) {
  const emissionFactors = await listEmissionFactors();
  return sendSuccess(response, "Emission factors retrieved successfully.", { emissionFactors });
}

export async function getEmissionFactorController(request: Request, response: Response) {
  const factorId = request.params["id"] as string;
  const emissionFactor = await getEmissionFactor(factorId);
  return sendSuccess(response, "Emission factor retrieved successfully.", { emissionFactor });
}

export async function createEmissionFactorController(request: Request, response: Response) {
  const emissionFactor = await createEmissionFactorRecord(request.body);
  return sendSuccess(response, "Emission factor created successfully.", { emissionFactor }, 201);
}

export async function updateEmissionFactorController(request: Request, response: Response) {
  const factorId = request.params["id"] as string;
  const emissionFactor = await updateEmissionFactorRecord(factorId, request.body);
  return sendSuccess(response, "Emission factor updated successfully.", { emissionFactor });
}

export async function deleteEmissionFactorController(request: Request, response: Response) {
  const factorId = request.params["id"] as string;
  const emissionFactor = await deleteEmissionFactorRecord(factorId);
  return sendSuccess(response, "Emission factor deactivated successfully.", { emissionFactor });
}
