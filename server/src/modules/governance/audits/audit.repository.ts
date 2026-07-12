import { prisma } from "../../../config/prisma.js";
import type { Prisma } from "@prisma/client";
import type { AuditFilter } from "./audit.types.js";

export class AuditRepository {
  static async getAudits(filters: AuditFilter) {
    const where: Prisma.AuditWhereInput = {};

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.departmentId) {
      where.departmentId = filters.departmentId;
    }

    if (filters.search) {
      where.OR = [
        { title: { contains: filters.search, mode: "insensitive" } },
        { description: { contains: filters.search, mode: "insensitive" } },
      ];
    }

    return prisma.audit.findMany({
      where,
      include: {
        department: true,
        auditor: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        complianceIssues: true,
      },
      orderBy: [
        { auditStartDate: "desc" },
        { createdAt: "desc" },
      ],
    });
  }

  static async getAuditById(id: string) {
    return prisma.audit.findUnique({
      where: { id },
      include: {
        department: true,
        auditor: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        complianceIssues: {
          include: {
            owner: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });
  }

  static async createAudit(data: Prisma.AuditUncheckedCreateInput) {
    return prisma.audit.create({
      data,
      include: {
        department: true,
        auditor: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  static async updateAudit(id: string, data: Prisma.AuditUncheckedUpdateInput) {
    return prisma.audit.update({
      where: { id },
      data,
      include: {
        department: true,
        auditor: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  static async deleteAudit(id: string) {
    return prisma.audit.delete({
      where: { id },
    });
  }
}
export default AuditRepository;
