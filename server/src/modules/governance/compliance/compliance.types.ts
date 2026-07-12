import type { ComplianceStatus, SeverityLevel } from "@prisma/client";

export interface ComplianceFilter {
  search?: string;
  status?: ComplianceStatus;
  departmentId?: string;
  severity?: SeverityLevel;
}

export interface CreateComplianceInput {
  title: string;
  description: string;
  severity: SeverityLevel;
  departmentId: string;
  ownerId: string;
  dueDate: string;
  auditId: string;
  status?: ComplianceStatus;
}

export interface UpdateComplianceInput {
  title?: string;
  description?: string;
  severity?: SeverityLevel;
  departmentId?: string;
  ownerId?: string;
  dueDate?: string;
  status?: ComplianceStatus;
}
