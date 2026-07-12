import { prisma } from "../../../config/prisma.js";
import type { ActivityStatus, ApprovalStatus, Prisma } from "@prisma/client";

export class CsrRepository {
  static async getActivities(filters: {
    search?: string;
    status?: ActivityStatus;
    departmentId?: string;
    categoryId?: string;
  }) {
    const where: Prisma.CsrActivityWhereInput = { deletedAt: null };

    if (filters.status) {
      where.status = filters.status;
    }
    if (filters.departmentId) {
      where.departmentId = filters.departmentId;
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

    return prisma.csrActivity.findMany({
      where,
      include: {
        department: {
          select: { id: true, name: true, code: true },
        },
        category: {
          select: { id: true, name: true, type: true },
        },
        creator: {
          select: { id: true, name: true, email: true },
        },
        _count: {
          select: { participants: true },
        },
      },
      orderBy: { startDate: "desc" },
    });
  }

  static async getActivityById(id: string) {
    return prisma.csrActivity.findFirst({
      where: { id, deletedAt: null },
      include: {
        department: {
          select: { id: true, name: true, code: true },
        },
        category: {
          select: { id: true, name: true, type: true },
        },
        creator: {
          select: { id: true, name: true, email: true },
        },
        participants: {
          include: {
            user: {
              select: { id: true, name: true, email: true },
            },
          },
        },
      },
    });
  }

  static async createActivity(data: Prisma.CsrActivityUncheckedCreateInput) {
    return prisma.csrActivity.create({
      data,
      include: {
        department: true,
        category: true,
        creator: true,
      },
    });
  }

  static async updateActivity(id: string, data: Prisma.CsrActivityUncheckedUpdateInput) {
    return prisma.csrActivity.update({
      where: { id },
      data,
      include: {
        department: true,
        category: true,
        creator: true,
      },
    });
  }

  static async deleteActivity(id: string) {
    return prisma.csrActivity.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  // Participation methods
  static async getParticipation(activityId: string, userId: string) {
    return prisma.employeeParticipation.findUnique({
      where: {
        activityId_userId: { activityId, userId },
      },
    });
  }

  static async getParticipationById(id: string) {
    return prisma.employeeParticipation.findUnique({
      where: { id },
      include: {
        activity: true,
        user: true,
      },
    });
  }

  static async getParticipations(filters: { userId?: string; activityId?: string; approvalStatus?: ApprovalStatus }) {
    const where: Prisma.EmployeeParticipationWhereInput = {};
    if (filters.userId) where.userId = filters.userId;
    if (filters.activityId) where.activityId = filters.activityId;
    if (filters.approvalStatus) where.approvalStatus = filters.approvalStatus;

    return prisma.employeeParticipation.findMany({
      where,
      include: {
        activity: {
          include: {
            department: true,
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

  static async createParticipation(data: Prisma.EmployeeParticipationUncheckedCreateInput) {
    return prisma.employeeParticipation.create({
      data,
      include: {
        activity: true,
        user: true,
      },
    });
  }

  static async updateParticipation(id: string, data: Prisma.EmployeeParticipationUncheckedUpdateInput) {
    return prisma.employeeParticipation.update({
      where: { id },
      data,
      include: {
        activity: true,
        user: true,
      },
    });
  }
}
