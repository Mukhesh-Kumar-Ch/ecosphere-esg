import { request } from "@/services/api";
import { type EnvironmentalReport } from "../environmental/environmental-api";
import { type GovernanceReport } from "../governance/governance-api";
import { type SocialReport } from "../social/social-api";

export interface EsgSummaryReport {
  scores: {
    overallScore: number;
    environmentalScore: number;
    socialScore: number;
    governanceScore: number;
    weights: {
      environmental: number;
      social: number;
      governance: number;
    };
  };
  departmentRankings: {
    id: string;
    name: string;
    code: string;
    environmentalScore: number;
    socialScore: number;
    governanceScore: number;
    overallScore: number;
    totalEmissions: number;
  }[];
  topContributors: {
    id: string;
    name: string;
    email: string;
    departmentName: string;
    totalXp: number;
    badgesCount: number;
  }[];
  carbonSummary: {
    totalEmissions: number;
    todayEmissions: number;
    monthlyEmissions: number;
    monthlyEmissionsTrend: { name: string; emissions: number }[];
    departmentComparison: { name: string; code: string; emissions: number }[];
  };
  csrSummary: {
    totalActivities: number;
    activeActivities: number;
    totalParticipations: number;
    approvedParticipations: number;
    csrParticipationRate: number;
  };
  challengeSummary: {
    totalChallenges: number;
    activeChallenges: number;
    totalChallengeParticipations: number;
    completedChallengeParticipations: number;
    challengeCompletionRate: number;
  };
  complianceSummary: {
    totalAudits: number;
    completedAudits: number;
    averageAuditScore: number;
    totalIssues: number;
    openIssues: number;
    overdueIssues: number;
  };
}

export interface CustomReportFilters {
  departmentId?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  module?: "ENVIRONMENT" | "SOCIAL" | "GOVERNANCE" | "ALL";
  userId?: string | null;
  challengeId?: string | null;
  categoryId?: string | null;
}

export interface CustomReportResult {
  filters: CustomReportFilters;
  results: {
    carbonTransactions?: any[];
    csrParticipations?: any[];
    challengeParticipations?: any[];
    complianceIssues?: any[];
    policyAcknowledgements?: any[];
    audits?: any[];
  };
}

export const reportsApi = {
  getEnvironmentReport(): Promise<EnvironmentalReport> {
    return request<EnvironmentalReport>("/reports/environment");
  },

  getSocialReport(): Promise<SocialReport> {
    return request<SocialReport>("/reports/social");
  },

  getGovernanceReport(): Promise<GovernanceReport> {
    return request<GovernanceReport>("/reports/governance");
  },

  getEsgSummaryReport(): Promise<EsgSummaryReport> {
    return request<EsgSummaryReport>("/reports/esg-summary");
  },

  generateCustomReport(filters: CustomReportFilters): Promise<CustomReportResult> {
    return request<CustomReportResult>("/reports/custom", {
      method: "POST",
      body: JSON.stringify(filters),
    });
  },
};
export default reportsApi;
