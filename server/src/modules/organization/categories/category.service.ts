import { HttpError } from "../../../utils/http-error.js";
import {
  createCategory,
  deleteCategory,
  findCategoryById,
  findCategoryByNameAndType,
  findCategories,
  updateCategory,
} from "./category.repository.js";
import type { CategoryInput, CategoryUpdateInput } from "./category.types.js";

export async function listCategories() {
  return findCategories();
}

export async function getCategory(id: string) {
  const category = await findCategoryById(id);

  if (!category) {
    throw new HttpError(404, "Category not found.", "CATEGORY_NOT_FOUND");
  }

  return category;
}

export async function createCategoryRecord(input: CategoryInput) {
  const normalizedName = input.name.trim();
  const existingCategory = await findCategoryByNameAndType(normalizedName, input.type);

  if (existingCategory) {
    throw new HttpError(
      409,
      "Category name must be unique within its type.",
      "CATEGORY_ALREADY_EXISTS",
    );
  }

  const createData: Parameters<typeof createCategory>[0] = {
    name: normalizedName,
    type: input.type,
  };

  if (input.status !== undefined) {
    createData.status = input.status;
  }

  return createCategory(createData);
}

export async function updateCategoryRecord(id: string, input: CategoryUpdateInput) {
  const existingCategory = await findCategoryById(id);

  if (!existingCategory) {
    throw new HttpError(404, "Category not found.", "CATEGORY_NOT_FOUND");
  }

  const nextName = input.name?.trim() ?? existingCategory.name;
  const nextType = input.type ?? existingCategory.type;
  const duplicateCategory = await findCategoryByNameAndType(nextName, nextType);

  if (duplicateCategory && duplicateCategory.id !== id) {
    throw new HttpError(
      409,
      "Category name must be unique within its type.",
      "CATEGORY_ALREADY_EXISTS",
    );
  }

  const updateData: Parameters<typeof updateCategory>[1] = {};

  if (input.name !== undefined) {
    updateData.name = input.name.trim();
  }

  if (input.type !== undefined) {
    updateData.type = input.type;
  }

  if (input.status !== undefined) {
    updateData.status = input.status;
  }

  return updateCategory(id, updateData);
}

export async function deleteCategoryRecord(id: string) {
  const existingCategory = await findCategoryById(id);

  if (!existingCategory) {
    throw new HttpError(404, "Category not found.", "CATEGORY_NOT_FOUND");
  }

  return deleteCategory(id);
}