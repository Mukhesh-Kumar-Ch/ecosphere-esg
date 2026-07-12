import { prisma } from "../../config/prisma.js";
import { ComplianceService } from "./compliance/compliance.service.js";

export class GovernanceReportsService {
  static async getGovernanceReport() {
    // Run compliance checker first to flag overdue issues automatically
    await ComplianceService.checkAndFlagOverdueIssues();

    // 1. Policy Statistics
    const totalPolicies = await prisma.policy.count({ where: { deletedAt: null } });
    const activePolicies = await prisma.policy.count({ where: { status: "ACTIVE", deletedAt: null } });
    const totalAcknowledgements = await prisma.policyAcknowledgement.count();

    const activePolicyList = await prisma.policy.findMany({
      where: { status: "ACTIVE", deletedAt: null },
      select: { id: true },
    });
    const activePolicyIds = activePolicyList.map((p) => p.id);

    // Total employees (users who are not Admin)
    const employeesCount = await prisma.user.count({
      where: {
        role: {
          name: { not: "Admin" },
        },
        deletedAt: null,
      },
    });

    const activeAcknowledgementsCount = await prisma.policyAcknowledgement.count({
      where: {
        policyId: { in: activePolicyIds },
      },
    });

    const possibleAcks = activePolicyIds.length * employeesCount;
    const policyComplianceRate = possibleAcks > 0 
      ? Math.round((activeAcknowledgementsCount / possibleAcks) * 100)
      : 100;

    // 2. Audit Summary
    const audits = await prisma.audit.findMany();
    const totalAudits = audits.length;
    const plannedAudits = audits.filter((a) => a.status === "PLANNED").length;
    const ongoingAudits = audits.filter((a) => a.status === "ONGOING").length;
    const completedAudits = audits.filter((a) => a.status === "COMPLETED").length;
    const cancelledAudits = audits.filter((a) => a.status === "CANCELLED").length;

    const scoredAudits = audits.filter((a) => a.score !== null && a.score !== undefined);
    const averageAuditScore = scoredAudits.length > 0
      ? Math.round(scoredAudits.reduce((acc, curr) => acc + (curr.score ?? 0), 0) / scoredAudits.length)
      : 100;

    // 3. Compliance Statistics
    const issues = await prisma.complianceIssue.findMany();
    const totalIssues = issues.length;
    const openIssues = issues.filter((i) => i.status === "OPEN").length;
    const inProgressIssues = issues.filter((i) => i.status === "IN_PROGRESS").length;
    const resolvedIssues = issues.filter((i) => i.status === "RESOLVED").length;
    const overdueIssues = issues.filter((i) => i.status === "OVERDUE").length;

    const lowSeverity = issues.filter((i) => i.severity === "LOW").length;
    const mediumSeverity = issues.filter((i) => i.severity === "MEDIUM").length;
    const highSeverity = issues.filter((i) => i.severity === "HIGH").length;
    const criticalSeverity = issues.filter((i) => i.severity === "CRITICAL").length;

    // 4. Governance Score Calculation
    // weights: policyComplianceRate (50%), averageAuditScore (30%), complianceIssueResolutionRate (20%)
    const resolutionRate = totalIssues > 0 ? (resolvedIssues / totalIssues) * 100 : 100;
    const governanceScore = Math.round(
      policyComplianceRate * 0.5 +
      averageAuditScore * 0.3 +
      resolutionRate * 0.2
    );

    return {
      policyStats: {
        totalPolicies,
        activePolicies,
        totalAcknowledgements,
        policyComplianceRate,
      },
      auditSummary: {
        totalAudits,
        plannedAudits,
        ongoingAudits,
        completedAudits,
        cancelledAudits,
        averageAuditScore,
      },
      complianceStats: {
        totalIssues,
        openIssues,
        inProgressIssues,
        resolvedIssues,
        overdueIssues,
        severityDistribution: {
          LOW: lowSeverity,
          MEDIUM: mediumSeverity,
          HIGH: highSeverity,
          CRITICAL: criticalSeverity,
        },
      },
      governanceScore,
    };
  }
}
export default GovernanceReportsService;
