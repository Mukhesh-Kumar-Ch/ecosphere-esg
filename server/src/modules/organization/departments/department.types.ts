import type { DepartmentStatus } from "@prisma/client";

export interface DepartmentInput {
  name: string;
  code: string;
  parentDepartmentId?: string | null;
  headUserId?: string | null;
  status?: DepartmentStatus;
}

export interface DepartmentUpdateInput {
  name?: string;
  code?: string;
  parentDepartmentId?: string | null;
  headUserId?: string | null;
  status?: DepartmentStatus;
}