import { Router } from "express";
import { authenticate } from "../../../middlewares/auth.middleware.js";
import { requireRoles } from "../../../middlewares/rbac.middleware.js";
import { validateRequest } from "../../../middlewares/validate-request.middleware.js";
import {
  createEmissionFactorController,
  deleteEmissionFactorController,
  getEmissionFactorController,
  listEmissionFactorsController,
  updateEmissionFactorController,
} from "./emission-factor.controller.js";
import {
  createEmissionFactorSchema,
  emissionFactorParamsSchema,
  updateEmissionFactorSchema,
} from "./emission-factor.schemas.js";

export const emissionFactorsRouter = Router();

emissionFactorsRouter.use(authenticate);

emissionFactorsRouter.get("/", listEmissionFactorsController);
emissionFactorsRouter.get("/:id", validateRequest(emissionFactorParamsSchema, "params"), getEmissionFactorController);

emissionFactorsRouter.post(
  "/",
  requireRoles(["Admin", "Asset Manager"]),
  validateRequest(createEmissionFactorSchema),
  createEmissionFactorController,
);

emissionFactorsRouter.put(
  "/:id",
  requireRoles(["Admin", "Asset Manager"]),
  validateRequest(emissionFactorParamsSchema, "params"),
  validateRequest(updateEmissionFactorSchema),
  updateEmissionFactorController,
);

emissionFactorsRouter.delete(
  "/:id",
  requireRoles(["Admin", "Asset Manager"]),
  validateRequest(emissionFactorParamsSchema, "params"),
  deleteEmissionFactorController,
);
