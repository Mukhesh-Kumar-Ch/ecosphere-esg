import { Router } from "express";
import { authenticate } from "../../../middlewares/auth.middleware.js";
import { requireAdmin } from "../../../middlewares/rbac.middleware.js";
import { validateRequest } from "../../../middlewares/validate-request.middleware.js";
import {
  createDepartmentController,
  deleteDepartmentController,
  getDepartmentController,
  listDepartmentsController,
  updateDepartmentController,
} from "./department.controller.js";
import {
  createDepartmentSchema,
  departmentParamsSchema,
  updateDepartmentSchema,
} from "./department.schemas.js";

export const departmentsRouter = Router();

departmentsRouter.use(authenticate);

departmentsRouter.get("/", listDepartmentsController);
departmentsRouter.get("/:id", validateRequest(departmentParamsSchema, "params"), getDepartmentController);
departmentsRouter.post(
  "/",
  requireAdmin,
  validateRequest(createDepartmentSchema),
  createDepartmentController,
);
departmentsRouter.put(
  "/:id",
  requireAdmin,
  validateRequest(departmentParamsSchema, "params"),
  validateRequest(updateDepartmentSchema),
  updateDepartmentController,
);
departmentsRouter.delete(
  "/:id",
  requireAdmin,
  validateRequest(departmentParamsSchema, "params"),
  deleteDepartmentController,
);