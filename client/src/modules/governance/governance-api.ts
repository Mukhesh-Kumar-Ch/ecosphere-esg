import { request } from "@/services/api";

export type PolicyStatus = "DRAFT" | "ACTIVE" | "ARCHIVED";
export type AcknowledgementStatus = "ACKNOWLEDGED";
export type AuditStatus = "PLANNED" | "ONGOING" | "COMPLETED" | "CANCELLED";
export type ComplianceStatus = "OPEN" | "IN_PROGRESS" | "RESOLVED" | "OVERDUE";
export type SeverityLevel = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export interface Policy {
  id: string;
  title: string;
  description: string | null;
  version: string;
  effectiveDate: string;
  status: PolicyStatus;
  createdById: string;
  creator: {
    id: string;
    name: string;
    email: string;
  };
  policyAcknowledgements?: any[];
  createdAt: string;
  updatedAt: string;
}

export interface PolicyAcknowledgement {
  id: string;
  policyId: string;
  policy: Policy;
  userId: string;
  acknowledgedAt: string;
  acknowledgementStatus: AcknowledgementStatus;
}

export interface Audit {
  id: string;
  departmentId: string;
  department: {
    id: string;
    name: string;
    code: string;
  };
  title: string;
  description: string | null;
  auditStartDate: string;
  auditEndDate: string;
  auditorId: string;
  auditor: {
    id: string;
    name: string;
    email: string;
  };
  status: AuditStatus;
  findings: string | null;
  score: number | null;
  complianceIssues?: ComplianceIssue[];
  createdAt: string;
  updatedAt: string;
}

export interface ComplianceIssue {
  id: string;
  auditId: string;
  audit: {
    id: string;
    title: string;
    status: AuditStatus;
  };
  departmentId: string;
  department: {
    id: string;
    name: string;
    code: string;
  };
  ownerId: string;
  owner: {
    id: string;
    name: string;
    email: string;
  };
  severity: SeverityLevel;
  description: string;
  dueDate: string;
  resolvedAt: string | null;
  status: ComplianceStatus;
  createdAt: string;
  updatedAt: string;
  title: string;
}

export interface PolicyInput {
  title: string;
  description: string | null;
  version: string;
  effectiveDate: string;
  status?: PolicyStatus;
}

export interface AuditInput {
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

export interface ComplianceIssueInput {
  title: string;
  description: string;
  severity: SeverityLevel;
  departmentId: string;
  ownerId: string;
  dueDate: string;
  auditId: string;
  status?: ComplianceStatus;
}

export interface GovernanceReport {
  policyStats: {
    totalPolicies: number;
    activePolicies: number;
    totalAcknowledgements: number;
    policyComplianceRate: number;
  };
  auditSummary: {
    totalAudits: number;
    plannedAudits: number;
    ongoingAudits: number;
    completedAudits: number;
    cancelledAudits: number;
    averageAuditScore: number;
  };
  complianceStats: {
    totalIssues: number;
    openIssues: number;
    inProgressIssues: number;
    resolvedIssues: number;
    overdueIssues: number;
    severityDistribution: {
      LOW: number;
      MEDIUM: number;
      HIGH: number;
      CRITICAL: number;
    };
  };
  governanceScore: number;
}

export const governanceApi = {
  // Policies API
  getPolicies(filters?: { search?: string; status?: PolicyStatus }): Promise<{ policies: Policy[] }> {
    const params = new URLSearchParams();
    if (filters?.search) params.set("search", filters.search);
    if (filters?.status) params.set("status", filters.status);
    const query = params.toString() ? `?${params.toString()}` : "";
    return request<{ policies: Policy[] }>(`/policies${query}`);
  },

  createPolicy(input: PolicyInput): Promise<{ policy: Policy }> {
    return request<{ policy: Policy }>("/policies", {
      method: "POST",
      body: JSON.stringify(input),
    });
  },

  updatePolicy(id: string, input: Partial<PolicyInput>): Promise<{ policy: Policy }> {
    return request<{ policy: Policy }>(`/policies/${id}`, {
      method: "PATCH",
      body: JSON.stringify(input),
    });
  },

  deletePolicy(id: string): Promise<{ success: boolean }> {
    return request<{ success: boolean }>(`/policies/${id}`, {
      method: "DELETE",
    });
  },

  acknowledgePolicy(id: string): Promise<{ acknowledgement: PolicyAcknowledgement }> {
    return request<{ acknowledgement: PolicyAcknowledgement }>(`/policies/${id}/acknowledge`, {
      method: "POST",
    });
  },

  getMyAcknowledgements(): Promise<{ acknowledgements: PolicyAcknowledgement[] }> {
    return request<{ acknowledgements: PolicyAcknowledgement[] }>("/policies/my-acknowledgements");
  },

  // Audits API
  getAudits(filters?: { search?: string; status?: AuditStatus; departmentId?: string }): Promise<{ audits: Audit[] }> {
    const params = new URLSearchParams();
    if (filters?.search) params.set("search", filters.search);
    if (filters?.status) params.set("status", filters.status);
    if (filters?.departmentId) params.set("departmentId", filters.departmentId);
    const query = params.toString() ? `?${params.toString()}` : "";
    return request<{ audits: Audit[] }>(`/audits${query}`);
  },

  createAudit(input: AuditInput): Promise<{ audit: Audit }> {
    return request<{ audit: Audit }>("/audits", {
      method: "POST",
      body: JSON.stringify(input),
    });
  },

  updateAudit(id: string, input: Partial<AuditInput>): Promise<{ audit: Audit }> {
    return request<{ audit: Audit }>(`/audits/${id}`, {
      method: "PATCH",
      body: JSON.stringify(input),
    });
  },

  deleteAudit(id: string): Promise<{ success: boolean }> {
    return request<{ success: boolean }>(`/audits/${id}`, {
      method: "DELETE",
    });
  },

  // Compliance API
  getComplianceIssues(filters?: {
    search?: string;
    status?: ComplianceStatus;
    departmentId?: string;
    severity?: SeverityLevel;
  }): Promise<{ issues: ComplianceIssue[] }> {
    const params = new URLSearchParams();
    if (filters?.search) params.set("search", filters.search);
    if (filters?.status) params.set("status", filters.status);
    if (filters?.departmentId) params.set("departmentId", filters.departmentId);
    if (filters?.severity) params.set("severity", filters.severity);
    const query = params.toString() ? `?${params.toString()}` : "";
    return request<{ issues: ComplianceIssue[] }>(`/compliance${query}`);
  },

  createComplianceIssue(input: ComplianceIssueInput): Promise<{ issue: ComplianceIssue }> {
    return request<{ issue: ComplianceIssue }>("/compliance", {
      method: "POST",
      body: JSON.stringify(input),
    });
  },

  updateComplianceIssue(id: string, input: Partial<ComplianceIssueInput>): Promise<{ issue: ComplianceIssue }> {
    return request<{ issue: ComplianceIssue }>(`/compliance/${id}`, {
      method: "PATCH",
      body: JSON.stringify(input),
    });
  },

  deleteComplianceIssue(id: string): Promise<{ success: boolean }> {
    return request<{ success: boolean }>(`/compliance/${id}`, {
      method: "DELETE",
    });
  },

  // Reports API
  getGovernanceReport(): Promise<GovernanceReport> {
    return request<GovernanceReport>("/governance");
  },

  getUsers(): Promise<{ users: { id: string; name: string; email: string; role: { name: string }; department: { name: string } }[] }> {
    return request<{ users: { id: string; name: string; email: string; role: { name: string }; department: { name: string } }[] }>("/users");
  },
};
export default governanceApi;
