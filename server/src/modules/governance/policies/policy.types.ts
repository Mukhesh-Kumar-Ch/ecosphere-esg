import type { Policy, PolicyAcknowledgement, PolicyStatus } from "@prisma/client";

export interface PolicyFilter {
  search?: string;
  status?: PolicyStatus;
}

export interface CreatePolicyInput {
  title: string;
  description?: string | null;
  version: string;
  effectiveDate: string;
  status?: PolicyStatus;
}

export interface UpdatePolicyInput {
  title?: string;
  description?: string | null;
  version?: string;
  effectiveDate?: string;
  status?: PolicyStatus;
}
