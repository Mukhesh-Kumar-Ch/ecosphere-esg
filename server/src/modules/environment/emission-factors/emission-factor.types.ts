import type { Status } from "@prisma/client";

export interface EmissionFactorInput {
  name: string;
  source: string;
  unit: string;
  factor: number;
  description?: string | null;
  status?: Status;
}

export interface EmissionFactorUpdateInput {
  name?: string;
  source?: string;
  unit?: string;
  factor?: number;
  description?: string | null;
  status?: Status;
}
