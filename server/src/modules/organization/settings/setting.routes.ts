import { Router } from "express";
import { authenticate } from "../../../middlewares/auth.middleware.js";
import { requireAdmin } from "../../../middlewares/rbac.middleware.js";
import { validateRequest } from "../../../middlewares/validate-request.middleware.js";
import { listSettingsController, updateSettingsController } from "./setting.controller.js";
import { settingsUpdateSchema } from "./setting.schemas.js";

export const settingsRouter = Router();

settingsRouter.use(authenticate);

settingsRouter.get("/", listSettingsController);
settingsRouter.patch(
  "/",
  requireAdmin,
  validateRequest(settingsUpdateSchema),
  updateSettingsController,
);