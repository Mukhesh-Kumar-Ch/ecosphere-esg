import { prisma } from "../../../config/prisma.js";

export class CustomReportService {
  static async generateCustomReport(filters: {
    departmentId?: string;
    startDate?: string;
    endDate?: string;
    module?: "ENVIRONMENT" | "SOCIAL" | "GOVERNANCE" | "ALL";
    userId?: string; // Employee
    challengeId?: string;
    categoryId?: string; // ESG Category
  }) {
    const { departmentId, startDate, endDate, module = "ALL", userId, challengeId, categoryId } = filters;

    // Date range helper
    const dateRangeFilter = (field: string) => {
      const condition: any = {};
      if (startDate) {
        condition.gte = new Date(startDate);
      }
      if (endDate) {
        condition.lte = new Date(endDate);
      }
      return Object.keys(condition).length > 0 ? { [field]: condition } : {};
    };

    const results: any = {};

    // 1. ENVIRONMENT MODULE
    if (module === "ENVIRONMENT" || module === "ALL") {
      const ctWhere: any = {
        ...dateRangeFilter("transactionDate"),
      };
      if (departmentId) ctWhere.departmentId = departmentId;
      if (userId) ctWhere.createdById = userId;
      results.carbonTransactions = await prisma.carbonTransaction.findMany({
        where: ctWhere,
        include: {
          department: true,
          emissionFactor: true,
          creator: {
            select: { id: true, name: true, email: true },
          },
        },
        orderBy: { transactionDate: "desc" },
      });
    }

    // 2. SOCIAL MODULE
    if (module === "SOCIAL" || module === "ALL") {
      // CSR Activity participations
      const csrWhere: any = {};
      
      // Date range on CSR activity start
      if (startDate || endDate) {
        csrWhere.activity = {
          ...dateRangeFilter("startDate"),
        };
      }
      if (departmentId) {
        csrWhere.activity = {
          ...(csrWhere.activity || {}),
          departmentId,
        };
      }
      if (userId) csrWhere.userId = userId;
      if (categoryId) {
        csrWhere.activity = {
          ...(csrWhere.activity || {}),
          categoryId,
        };
      }

      results.csrParticipations = await prisma.employeeParticipation.findMany({
        where: csrWhere,
        include: {
          user: {
            select: { id: true, name: true, email: true, department: true },
          },
          activity: {
            include: { department: true, category: true },
          },
        },
        orderBy: { createdAt: "desc" },
      });

      // Challenge participations
      const chalWhere: any = {
        ...dateRangeFilter("createdAt"),
      };
      if (userId) chalWhere.userId = userId;
      if (challengeId) chalWhere.challengeId = challengeId;
      if (departmentId) {
        chalWhere.user = { departmentId };
      }
      if (categoryId) {
        chalWhere.challenge = { categoryId };
      }

      results.challengeParticipations = await prisma.challengeParticipation.findMany({
        where: chalWhere,
        include: {
          user: {
            select: { id: true, name: true, email: true, department: true },
          },
          challenge: {
            include: { category: true },
          },
        },
        orderBy: { createdAt: "desc" },
      });
    }

    // 3. GOVERNANCE MODULE
    if (module === "GOVERNANCE" || module === "ALL") {
      // Compliance Issues
      const ciWhere: any = {
        ...dateRangeFilter("createdAt"),
      };
      if (departmentId) ciWhere.departmentId = departmentId;
      if (userId) ciWhere.ownerId = userId;

      results.complianceIssues = await prisma.complianceIssue.findMany({
        where: ciWhere,
        include: {
          department: true,
          owner: {
            select: { id: true, name: true, email: true },
          },
          audit: true,
        },
        orderBy: { createdAt: "desc" },
      });

      // Policy Acknowledgements
      const paWhere: any = {
        ...dateRangeFilter("acknowledgedAt"),
      };
      if (userId) paWhere.userId = userId;
      if (departmentId) {
        paWhere.user = { departmentId };
      }

      results.policyAcknowledgements = await prisma.policyAcknowledgement.findMany({
        where: paWhere,
        include: {
          user: {
            select: { id: true, name: true, email: true, department: true },
          },
          policy: true,
        },
        orderBy: { acknowledgedAt: "desc" },
      });

      // Audits
      const auWhere: any = {
        ...dateRangeFilter("auditStartDate"),
      };
      if (departmentId) auWhere.departmentId = departmentId;
      if (userId) auWhere.auditorId = userId;

      results.audits = await prisma.audit.findMany({
        where: auWhere,
        include: {
          department: true,
          auditor: {
            select: { id: true, name: true, email: true },
          },
        },
        orderBy: { auditStartDate: "desc" },
      });
    }

    return {
      filters,
      results,
    };
  }
}
export default CustomReportService;
