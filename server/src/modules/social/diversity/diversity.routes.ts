import { Router } from "express";
import { DiversityController } from "./diversity.controller.js";
import { authenticate } from "../../../middlewares/auth.middleware.js";
import { requireRoles } from "../../../middlewares/rbac.middleware.js";

export const diversityRouter = Router();

diversityRouter.use(authenticate);

diversityRouter.get("/", DiversityController.getMetrics);
diversityRouter.post("/", requireRoles(["Admin", "Asset Manager"]), DiversityController.setMetric);
diversityRouter.delete("/:id", requireRoles(["Admin", "Asset Manager"]), DiversityController.deleteMetric);

export default diversityRouter;
