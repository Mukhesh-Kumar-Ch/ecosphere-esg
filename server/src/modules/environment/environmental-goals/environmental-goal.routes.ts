import { Router } from "express";
import { authenticate } from "../../../middlewares/auth.middleware.js";
import { requireRoles } from "../../../middlewares/rbac.middleware.js";
import { validateRequest } from "../../../middlewares/validate-request.middleware.js";
import {
  createEnvironmentalGoalController,
  deleteEnvironmentalGoalController,
  getEnvironmentalGoalController,
  listEnvironmentalGoalsController,
  updateEnvironmentalGoalController,
} from "./environmental-goal.controller.js";
import {
  createEnvironmentalGoalSchema,
  environmentalGoalParamsSchema,
  updateEnvironmentalGoalSchema,
} from "./environmental-goal.schemas.js";

export const environmentalGoalsRouter = Router();

environmentalGoalsRouter.use(authenticate);

environmentalGoalsRouter.get("/", listEnvironmentalGoalsController);
environmentalGoalsRouter.get("/:id", validateRequest(environmentalGoalParamsSchema, "params"), getEnvironmentalGoalController);

environmentalGoalsRouter.post(
  "/",
  requireRoles(["Admin", "Asset Manager", "Department Head"]),
  validateRequest(createEnvironmentalGoalSchema),
  createEnvironmentalGoalController,
);

environmentalGoalsRouter.put(
  "/:id",
  requireRoles(["Admin", "Asset Manager", "Department Head"]),
  validateRequest(environmentalGoalParamsSchema, "params"),
  validateRequest(updateEnvironmentalGoalSchema),
  updateEnvironmentalGoalController,
);

environmentalGoalsRouter.delete(
  "/:id",
  requireRoles(["Admin", "Asset Manager", "Department Head"]),
  validateRequest(environmentalGoalParamsSchema, "params"),
  deleteEnvironmentalGoalController,
);
