import { prisma } from "../../../config/prisma.js";

const departmentSelect = {
  id: true,
  name: true,
  code: true,
  parentDepartmentId: true,
  headUserId: true,
  status: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
  parentDepartment: {
    select: {
      id: true,
      name: true,
      code: true,
    },
  },
  headUser: {
    select: {
      id: true,
      name: true,
      email: true,
      departmentId: true,
    },
  },
} as const;

export function findDepartments() {
  return prisma.department.findMany({
    where: { deletedAt: null },
    orderBy: [{ name: "asc" }],
    select: departmentSelect,
  });
}

export function findDepartmentById(id: string) {
  return prisma.department.findFirst({
    where: { id, deletedAt: null },
    select: departmentSelect,
  });
}

export function findDepartmentByCode(code: string) {
  return prisma.department.findFirst({
    where: { code, deletedAt: null },
    select: departmentSelect,
  });
}

export function createDepartment(data: {
  name: string;
  code: string;
  parentDepartmentId?: string | null;
  status?: "ACTIVE" | "INACTIVE";
}) {
  return prisma.department.create({
    data,
    select: departmentSelect,
  });
}

export function updateDepartment(
  id: string,
  data: {
    name?: string;
    code?: string;
    parentDepartmentId?: string | null;
    headUserId?: string | null;
    status?: "ACTIVE" | "INACTIVE";
  },
) {
  return prisma.department.update({
    where: { id },
    data,
    select: departmentSelect,
  });
}

export function countActiveDepartmentUsers(id: string) {
  return prisma.user.count({
    where: {
      departmentId: id,
      deletedAt: null,
    },
  });
}

export function findHeadUserById(id: string) {
  return prisma.user.findFirst({
    where: {
      id,
      deletedAt: null,
      status: "ACTIVE",
    },
    select: {
      id: true,
      departmentId: true,
      name: true,
      email: true,
    },
  });
}

export function softDeleteDepartment(id: string) {
  return prisma.department.update({
    where: { id },
    data: {
      deletedAt: new Date(),
    },
    select: departmentSelect,
  });
}