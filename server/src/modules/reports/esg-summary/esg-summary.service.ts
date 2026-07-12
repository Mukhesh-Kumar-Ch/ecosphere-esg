import { prisma } from "../../../config/prisma.js";
import { getEnvironmentReport } from "../../environment/reports.service.js";
import { SocialReportService } from "../../social/reports/social-report.service.js";
import { GovernanceReportsService } from "../../governance/reports.service.js";

export class EsgSummaryReportService {
  static async getEsgSummaryReport() {
    // 1. Fetch individual reports using existing services
    const envReport = await getEnvironmentReport();
    const socReport = await SocialReportService.getSocialReport();
    const govReport = await GovernanceReportsService.getGovernanceReport();

    // 2. Fetch configurable weightages from Setting table
    const settings = await prisma.setting.findMany({
      where: {
        key: { in: ["DEFAULT_ENV_WEIGHT", "DEFAULT_SOCIAL_WEIGHT", "DEFAULT_GOVERNANCE_WEIGHT"] },
      },
    });

    const envWeightSetting = settings.find((s) => s.key === "DEFAULT_ENV_WEIGHT");
    const socWeightSetting = settings.find((s) => s.key === "DEFAULT_SOCIAL_WEIGHT");
    const govWeightSetting = settings.find((s) => s.key === "DEFAULT_GOVERNANCE_WEIGHT");

    const envWeight = envWeightSetting ? Number(envWeightSetting.value) : 40;
    const socWeight = socWeightSetting ? Number(socWeightSetting.value) : 30;
    const govWeight = govWeightSetting ? Number(govWeightSetting.value) : 30;

    // 3. Scores
    const environmentalScore = envReport.goalProgress.length > 0
      ? Math.round(
          (envReport.goalProgress.filter(
            (g) => g.status === "COMPLETED" || g.currentEmissions <= g.targetValue
          ).length /
            envReport.goalProgress.length) *
            105
        )
      : 100;

    // Clamp score at 100
    const clampedEnvScore = Math.min(environmentalScore, 100);

    const socialScore = socReport.socialScore;
    const governanceScore = govReport.governanceScore;

    // Overall composite ESG score
    const overallScore = Math.round(
      (clampedEnvScore * envWeight + socialScore * socWeight + governanceScore * govWeight) / 100
    );

    // 4. Top Contributors (from leaderboard stand-off)
    // Fetch users with their XP transactions summed
    const users = await prisma.user.findMany({
      where: { deletedAt: null },
      include: {
        department: true,
        xpTransactions: true,
        badges: true,
      },
    });

    const topContributors = users
      .map((u: any) => {
        const totalXp = u.xpTransactions.reduce((acc: number, curr: any) => acc + curr.points, 0);
        return {
          id: u.id,
          name: u.name,
          email: u.email,
          departmentName: u.department?.name ?? "N/A",
          totalXp,
          badgesCount: u.badges.length,
        };
      })
      .sort((a, b) => b.totalXp - a.totalXp)
      .slice(0, 10);

    // 5. Department Rankings
    // Fetch active departments
    const departments = await prisma.department.findMany({
      where: { deletedAt: null, status: "ACTIVE" },
      include: {
        environmentalGoals: true,
        users: {
          where: { deletedAt: null },
          include: {
            xpTransactions: true,
            csrParticipations: true,
            challengeParticipations: true,
            policyAcknowledgements: true,
          },
        },
      },
    });

    const activePolicyCount = await prisma.policy.count({
      where: { status: "ACTIVE", deletedAt: null },
    });

    const departmentRankings = departments
      .map((dept: any) => {
        const deptUsers = dept.users;
        const totalDeptEmployees = deptUsers.length;

        // A. Env Score for Dept
        const deptGoals = dept.environmentalGoals;
        let deptEnvScore = 100;
        if (deptGoals.length > 0) {
          const deptTransactions = envReport.goalProgress.filter((gp: any) =>
            deptGoals.some((dg: any) => dg.id === gp.id)
          );
          const compliantGoals = deptTransactions.filter(
            (g: any) => g.status === "COMPLETED" || g.currentEmissions <= g.targetValue
          ).length;
          deptEnvScore = Math.round((compliantGoals / deptGoals.length) * 100);
        }

        // B. Social Score for Dept
        let deptSocScore = 100;
        const csrParts = deptUsers.flatMap((u: any) => u.csrParticipations);
        const challengeParts = deptUsers.flatMap((u: any) => u.challengeParticipations);

        const approvedCsr = csrParts.filter((cp: any) => cp.approvalStatus === "APPROVED").length;
        const completedChall = challengeParts.filter((ch: any) => ch.approvalStatus === "APPROVED").length;

        const csrRate = csrParts.length > 0 ? (approvedCsr / csrParts.length) * 100 : 100;
        const challengeRate = challengeParts.length > 0 ? (completedChall / challengeParts.length) * 100 : 100;

        deptSocScore = Math.round(csrRate * 0.5 + challengeRate * 0.5);

        // C. Gov Score for Dept
        let deptGovScore = 100;
        const totalAcks = deptUsers.flatMap((u: any) => u.policyAcknowledgements).length;
        const possibleAcks = activePolicyCount * totalDeptEmployees;
        const policyRate = possibleAcks > 0 ? (totalAcks / possibleAcks) * 100 : 100;
        deptGovScore = Math.round(policyRate);

        // Combined department score
        const deptOverallScore = Math.round(
          (deptEnvScore * envWeight + deptSocScore * socWeight + deptGovScore * govWeight) / 100
        );

        // Total emissions in department
        const deptEmissions = envReport.departmentTracking.find((dt: any) => dt.id === dept.id)?.totalEmissions ?? 0;

        return {
          id: dept.id,
          name: dept.name,
          code: dept.code,
          environmentalScore: deptEnvScore,
          socialScore: deptSocScore,
          governanceScore: deptGovScore,
          overallScore: deptOverallScore,
          totalEmissions: deptEmissions,
        };
      })
      .sort((a, b) => b.overallScore - a.overallScore);

    return {
      scores: {
        overallScore,
        environmentalScore: clampedEnvScore,
        socialScore,
        governanceScore,
        weights: {
          environmental: envWeight,
          social: socWeight,
          governance: govWeight,
        },
      },
      departmentRankings,
      topContributors,
      carbonSummary: {
        totalEmissions: envReport.summary.totalEmissions,
        todayEmissions: envReport.summary.todayEmissions,
        monthlyEmissions: envReport.summary.monthlyEmissions,
        monthlyEmissionsTrend: envReport.charts.monthlyEmissionsTrend,
        departmentComparison: envReport.charts.departmentComparison,
      },
      csrSummary: socReport.csr,
      challengeSummary: socReport.challenges,
      complianceSummary: {
        totalAudits: govReport.auditSummary.totalAudits,
        completedAudits: govReport.auditSummary.completedAudits,
        averageAuditScore: govReport.auditSummary.averageAuditScore,
        totalIssues: govReport.complianceStats.totalIssues,
        openIssues: govReport.complianceStats.openIssues,
        overdueIssues: govReport.complianceStats.overdueIssues,
      },
    };
  }
}
export default EsgSummaryReportService;
