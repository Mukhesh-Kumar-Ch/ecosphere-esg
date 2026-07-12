import { prisma } from "../../../config/prisma.js";
import type { PolicyStatus, Prisma } from "@prisma/client";
import type { PolicyFilter } from "./policy.types.js";

export class PolicyRepository {
  static async getPolicies(filters: PolicyFilter) {
    const where: Prisma.PolicyWhereInput = {
      deletedAt: null,
    };

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.search) {
      where.OR = [
        { title: { contains: filters.search, mode: "insensitive" } },
        { description: { contains: filters.search, mode: "insensitive" } },
      ];
    }

    return prisma.policy.findMany({
      where,
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        policyAcknowledgements: true,
      },
      orderBy: [
        { effectiveDate: "desc" },
        { createdAt: "desc" },
      ],
    });
  }

  static async getPolicyById(id: string) {
    return prisma.policy.findFirst({
      where: {
        id,
        deletedAt: null,
      },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        policyAcknowledgements: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                department: true,
              },
            },
          },
        },
      },
    });
  }

  static async getPolicyByTitleAndVersion(title: string, version: string) {
    return prisma.policy.findFirst({
      where: {
        title,
        version,
        deletedAt: null,
      },
    });
  }

  static async createPolicy(data: Prisma.PolicyUncheckedCreateInput) {
    return prisma.policy.create({
      data,
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  static async updatePolicy(id: string, data: Prisma.PolicyUncheckedUpdateInput) {
    return prisma.policy.update({
      where: { id },
      data,
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  static async deletePolicy(id: string) {
    return prisma.policy.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
    });
  }

  static async getAcknowledgement(policyId: string, userId: string) {
    return prisma.policyAcknowledgement.findUnique({
      where: {
        policyId_userId: {
          policyId,
          userId,
        },
      },
    });
  }

  static async createAcknowledgement(policyId: string, userId: string) {
    return prisma.policyAcknowledgement.create({
      data: {
        policyId,
        userId,
        acknowledgementStatus: "ACKNOWLEDGED",
      },
    });
  }

  static async deleteAcknowledgementsForPolicy(policyId: string) {
    return prisma.policyAcknowledgement.deleteMany({
      where: { policyId },
    });
  }

  static async getAcknowledgementsByUser(userId: string) {
    return prisma.policyAcknowledgement.findMany({
      where: { userId },
      include: {
        policy: true,
      },
    });
  }
}
export default PolicyRepository;
