import type { Audit, AuditStatus } from "@prisma/client";

export interface AuditFilter {
  search?: string;
  status?: AuditStatus;
  departmentId?: string;
}

export interface CreateAuditInput {
  title: string;
  description?: string | null;
  departmentId: string;
  auditStartDate: string;
  auditEndDate: string;
  auditorId: string;
  status?: AuditStatus;
  findings?: string | null;
  score?: number | null;
}

export interface UpdateAuditInput {
  title?: string;
  description?: string | null;
  departmentId?: string;
  auditStartDate?: string;
  auditEndDate?: string;
  auditorId?: string;
  status?: AuditStatus;
  findings?: string | null;
  score?: number | null;
}
