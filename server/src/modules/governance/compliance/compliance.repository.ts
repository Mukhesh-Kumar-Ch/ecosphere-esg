import { prisma } from "../../../config/prisma.js";
import type { Prisma } from "@prisma/client";
import type { ComplianceFilter } from "./compliance.types.js";

export class ComplianceRepository {
  static async getIssues(filters: ComplianceFilter) {
    const where: Prisma.ComplianceIssueWhereInput = {};

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.departmentId) {
      where.departmentId = filters.departmentId;
    }

    if (filters.severity) {
      where.severity = filters.severity;
    }

    if (filters.search) {
      where.OR = [
        { title: { contains: filters.search, mode: "insensitive" } },
        { description: { contains: filters.search, mode: "insensitive" } },
      ];
    }

    return prisma.complianceIssue.findMany({
      where,
      include: {
        audit: true,
        department: true,
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: [
        { dueDate: "asc" },
        { createdAt: "desc" },
      ],
    });
  }

  static async getIssueById(id: string) {
    return prisma.complianceIssue.findUnique({
      where: { id },
      include: {
        audit: true,
        department: true,
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  static async createIssue(data: Prisma.ComplianceIssueUncheckedCreateInput) {
    return prisma.complianceIssue.create({
      data,
      include: {
        audit: true,
        department: true,
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  static async updateIssue(id: string, data: Prisma.ComplianceIssueUncheckedUpdateInput) {
    return prisma.complianceIssue.update({
      where: { id },
      data,
      include: {
        audit: true,
        department: true,
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  static async deleteIssue(id: string) {
    return prisma.complianceIssue.delete({
      where: { id },
    });
  }

  static async getOverdueIssues() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return prisma.complianceIssue.findMany({
      where: {
        status: {
          in: ["OPEN", "IN_PROGRESS"],
        },
        dueDate: {
          lt: today,
        },
      },
    });
  }
}
export default ComplianceRepository;
