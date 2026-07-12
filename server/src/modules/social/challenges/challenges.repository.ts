import { prisma } from "../../../config/prisma.js";
import type { ChallengeStatus, ApprovalStatus, Prisma } from "@prisma/client";

export class ChallengesRepository {
  static async getChallenges(filters: {
    search?: string;
    status?: ChallengeStatus;
    categoryId?: string;
  }) {
    const where: Prisma.ChallengeWhereInput = { deletedAt: null };

    if (filters.status) {
      where.status = filters.status;
    }
    if (filters.categoryId) {
      where.categoryId = filters.categoryId;
    }
    if (filters.search) {
      where.OR = [
        { title: { contains: filters.search, mode: "insensitive" } },
        { description: { contains: filters.search, mode: "insensitive" } },
      ];
    }

    return prisma.challenge.findMany({
      where,
      include: {
        category: {
          select: { id: true, name: true, type: true },
        },
        _count: {
          select: { participants: true },
        },
      },
      orderBy: { deadline: "asc" },
    });
  }

  static async getChallengeById(id: string) {
    return prisma.challenge.findFirst({
      where: { id, deletedAt: null },
      include: {
        category: {
          select: { id: true, name: true, type: true },
        },
        participants: {
          include: {
            user: {
              select: { id: true, name: true, email: true },
            },
            approver: {
              select: { id: true, name: true, email: true },
            },
          },
        },
      },
    });
  }

  static async createChallenge(data: Prisma.ChallengeUncheckedCreateInput) {
    return prisma.challenge.create({
      data,
      include: {
        category: true,
      },
    });
  }

  static async updateChallenge(id: string, data: Prisma.ChallengeUncheckedUpdateInput) {
    return prisma.challenge.update({
      where: { id },
      data,
      include: {
        category: true,
      },
    });
  }

  static async deleteChallenge(id: string) {
    return prisma.challenge.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  // Participation methods
  static async getParticipation(challengeId: string, userId: string) {
    return prisma.challengeParticipation.findUnique({
      where: {
        challengeId_userId: { challengeId, userId },
      },
    });
  }

  static async getParticipationById(id: string) {
    return prisma.challengeParticipation.findUnique({
      where: { id },
      include: {
        challenge: true,
        user: true,
      },
    });
  }

  static async getParticipations(filters: { userId?: string; challengeId?: string; approvalStatus?: ApprovalStatus }) {
    const where: Prisma.ChallengeParticipationWhereInput = {};
    if (filters.userId) where.userId = filters.userId;
    if (filters.challengeId) where.challengeId = filters.challengeId;
    if (filters.approvalStatus) where.approvalStatus = filters.approvalStatus;

    return prisma.challengeParticipation.findMany({
      where,
      include: {
        challenge: {
          include: {
            category: true,
          },
        },
        user: {
          select: { id: true, name: true, email: true },
        },
        approver: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  static async createParticipation(data: Prisma.ChallengeParticipationUncheckedCreateInput) {
    return prisma.challengeParticipation.create({
      data,
      include: {
        challenge: true,
        user: true,
      },
    });
  }

  static async updateParticipation(id: string, data: Prisma.ChallengeParticipationUncheckedUpdateInput) {
    return prisma.challengeParticipation.update({
      where: { id },
      data,
      include: {
        challenge: true,
        user: true,
      },
    });
  }
}
export default ChallengesRepository;
