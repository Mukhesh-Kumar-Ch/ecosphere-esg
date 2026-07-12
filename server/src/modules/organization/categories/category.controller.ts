import type { Request, Response } from "express";
import { sendSuccess } from "../../../utils/response.js";
import {
  createCategoryRecord,
  deleteCategoryRecord,
  getCategory,
  listCategories,
  updateCategoryRecord,
} from "./category.service.js";

export async function listCategoriesController(_request: Request, response: Response) {
  const categories = await listCategories();

  return sendSuccess(response, "Categories retrieved successfully.", { categories });
}

export async function getCategoryController(request: Request, response: Response) {
  const categoryId = request.params["id"] as string;
  const category = await getCategory(categoryId);

  return sendSuccess(response, "Category retrieved successfully.", { category });
}

export async function createCategoryController(request: Request, response: Response) {
  const category = await createCategoryRecord(request.body);

  return sendSuccess(response, "Category created successfully.", { category }, 201);
}

export async function updateCategoryController(request: Request, response: Response) {
  const categoryId = request.params["id"] as string;
  const category = await updateCategoryRecord(categoryId, request.body);

  return sendSuccess(response, "Category updated successfully.", { category });
}

export async function deleteCategoryController(request: Request, response: Response) {
  const categoryId = request.params["id"] as string;
  const category = await deleteCategoryRecord(categoryId);

  return sendSuccess(response, "Category deleted successfully.", { category });
}