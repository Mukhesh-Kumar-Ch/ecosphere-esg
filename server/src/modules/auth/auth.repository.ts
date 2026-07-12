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
