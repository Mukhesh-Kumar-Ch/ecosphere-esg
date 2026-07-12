import { Router } from "express";
import { authenticate } from "../../../middlewares/auth.middleware.js";
import { requireAdmin } from "../../../middlewares/rbac.middleware.js";
import { validateRequest } from "../../../middlewares/validate-request.middleware.js";
import {
  createCategoryController,
  deleteCategoryController,
  getCategoryController,
  listCategoriesController,
  updateCategoryController,
} from "./category.controller.js";
import { categoryParamsSchema, createCategorySchema, updateCategorySchema } from "./category.schemas.js";

export const categoriesRouter = Router();

categoriesRouter.use(authenticate);

categoriesRouter.get("/", listCategoriesController);
categoriesRouter.get("/:id", validateRequest(categoryParamsSchema, "params"), getCategoryController);
categoriesRouter.post(
  "/",
  requireAdmin,
  validateRequest(createCategorySchema),
  createCategoryController,
);
categoriesRouter.put(
  "/:id",
  requireAdmin,
  validateRequest(categoryParamsSchema, "params"),
  validateRequest(updateCategorySchema),
  updateCategoryController,
);
categoriesRouter.delete(
  "/:id",
  requireAdmin,
  validateRequest(categoryParamsSchema, "params"),
  deleteCategoryController,
);