import { Router } from "express";
import { TrainingController } from "./training.controller.js";
import { authenticate } from "../../../middlewares/auth.middleware.js";
import { requireRoles } from "../../../middlewares/rbac.middleware.js";

export const trainingRouter = Router();

trainingRouter.use(authenticate);

trainingRouter.get("/", TrainingController.getTrainings);
trainingRouter.post("/", requireRoles(["Admin", "Asset Manager", "Department Head"]), TrainingController.createTraining);
trainingRouter.patch("/:id/progress", TrainingController.updateProgress);
trainingRouter.delete("/:id", requireRoles(["Admin", "Asset Manager", "Department Head"]), TrainingController.deleteTraining);

export default trainingRouter;
