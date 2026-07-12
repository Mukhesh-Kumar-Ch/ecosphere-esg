import { HttpError } from "../../../utils/http-error.js";
import {
  createEmissionFactor,
  deleteEmissionFactor,
  findEmissionFactorById,
  findEmissionFactorByName,
  findEmissionFactors,
  updateEmissionFactor,
} from "./emission-factor.repository.js";
import type { EmissionFactorInput, EmissionFactorUpdateInput } from "./emission-factor.types.js";

export async function listEmissionFactors() {
  return findEmissionFactors();
}

export async function getEmissionFactor(id: string) {
  const factor = await findEmissionFactorById(id);

  if (!factor) {
    throw new HttpError(404, "Emission factor not found.", "EMISSION_FACTOR_NOT_FOUND");
  }

  return factor;
}

export async function createEmissionFactorRecord(input: EmissionFactorInput) {
  const normalizedName = input.name.trim();
  const existing = await findEmissionFactorByName(normalizedName);

  if (existing) {
    throw new HttpError(
      409,
      "Emission factor name must be unique.",
      "EMISSION_FACTOR_ALREADY_EXISTS",
    );
  }

  if (input.factor <= 0) {
    throw new HttpError(400, "Emission factor must be positive.", "INVALID_FACTOR");
  }

  return createEmissionFactor({
    ...input,
    name: normalizedName,
  });
}

export async function updateEmissionFactorRecord(id: string, input: EmissionFactorUpdateInput) {
  const existing = await findEmissionFactorById(id);

  if (!existing) {
    throw new HttpError(404, "Emission factor not found.", "EMISSION_FACTOR_NOT_FOUND");
  }

  if (input.factor !== undefined && input.factor <= 0) {
    throw new HttpError(400, "Emission factor must be positive.", "INVALID_FACTOR");
  }

  if (input.name !== undefined) {
    const normalizedName = input.name.trim();
    const duplicate = await findEmissionFactorByName(normalizedName);
    if (duplicate && duplicate.id !== id) {
      throw new HttpError(
        409,
        "Emission factor name must be unique.",
        "EMISSION_FACTOR_ALREADY_EXISTS",
      );
    }
    input.name = normalizedName;
  }

  return updateEmissionFactor(id, input);
}

export async function deleteEmissionFactorRecord(id: string) {
  const existing = await findEmissionFactorById(id);

  if (!existing) {
    throw new HttpError(404, "Emission factor not found.", "EMISSION_FACTOR_NOT_FOUND");
  }

  return deleteEmissionFactor(id);
}
