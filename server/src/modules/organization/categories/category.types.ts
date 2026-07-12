import type { CategoryStatus, CategoryType } from "@prisma/client";

export interface CategoryInput {
  name: string;
  type: CategoryType;
  status?: CategoryStatus;
}

export interface CategoryUpdateInput {
  name?: string;
  type?: CategoryType;
  status?: CategoryStatus;
}