import { prisma } from "../../config/prisma.js";

const userSelection = {
  id: true,
  name: true,
  email: true,
  passwordHash: true,
  status: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
  role: {
    select: {
      id: true,
      name: true,
      description: true,
    },
  },
  department: {
    select: {
      id: true,
      name: true,
      code: true,
      status: true,
    },
  },
} as const;

export async function findUserForLogin(email: string) {
  return prisma.user.findFirst({
    where: {
      email,
      deletedAt: null,
    },
    select: userSelection,
  });
}

export async function findUserByEmail(email: string) {
  return prisma.user.findFirst({
    where: { email },
    select: userSelection,
  });
}

export async function findRoleByName(name: string) {
  return prisma.role.findUnique({
    where: { name },
    select: {
      id: true,
      name: true,
      description: true,
    },
  });
}

export async function findDepartmentByCode(code: string) {
  return prisma.department.findFirst({
    where: {
      code,
      deletedAt: null,
      status: "ACTIVE",
    },
    select: {
      id: true,
      name: true,
      code: true,
      status: true,
    },
  });
}

export async function createUser(data: {
  departmentId: string;
  roleId: string;
  name: string;
  email: string;
  passwordHash: string;
}) {
  return prisma.user.create({
    data,
    select: userSelection,
  });
}

export async function findActiveUserById(userId: string) {
  return prisma.user.findFirst({
    where: {
      id: userId,
      deletedAt: null,
      status: "ACTIVE",
    },
    select: userSelection,
  });
}
