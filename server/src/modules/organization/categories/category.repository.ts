import { prisma } from "../../../config/prisma.js";
import type { CategoryStatus, CategoryType } from "@prisma/client";

const categorySelect = {
  id: true,
  name: true,
  type: true,
  status: true,
  createdAt: true,
  updatedAt: true,
} as const;

export function findCategories() {
  return prisma.category.findMany({
    orderBy: [{ type: "asc" }, { name: "asc" }],
    select: categorySelect,
  });
}

export function findCategoryById(id: string) {
  return prisma.category.findFirst({
    where: { id },
    select: categorySelect,
  });
}

export function findCategoryByNameAndType(name: string, type: CategoryType) {
  return prisma.category.findFirst({
    where: { name, type },
    select: categorySelect,
  });
}

export function createCategory(data: { name: string; type: CategoryType; status?: CategoryStatus }) {
  return prisma.category.create({
    data,
    select: categorySelect,
  });
}

export function updateCategory(
  id: string,
  data: { name?: string; type?: CategoryType; status?: CategoryStatus },
) {
  return prisma.category.update({
    where: { id },
    data,
    select: categorySelect,
  });
}

export function deleteCategory(id: string) {
  return prisma.category.delete({
    where: { id },
    select: categorySelect,
  });
}