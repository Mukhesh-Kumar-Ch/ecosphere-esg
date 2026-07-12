import { Router } from "express";
import { CsrController } from "./csr.controller.js";
import { authenticate } from "../../../middlewares/auth.middleware.js";
import { requireRoles } from "../../../middlewares/rbac.middleware.js";

export const csrRouter = Router();

csrRouter.use(authenticate);

csrRouter.get("/activities", CsrController.getActivities);
csrRouter.get("/activities/:id", CsrController.getActivityById);

csrRouter.post(
  "/activities",
  requireRoles(["Admin", "Asset Manager", "Department Head"]),
  CsrController.createActivity
);

csrRouter.patch(
  "/activities/:id",
  requireRoles(["Admin", "Asset Manager", "Department Head"]),
  CsrController.updateActivity
);

csrRouter.delete(
  "/activities/:id",
  requireRoles(["Admin", "Asset Manager", "Department Head"]),
  CsrController.deleteActivity
);

csrRouter.post("/activities/:id/join", CsrController.joinActivity);
csrRouter.post("/activities/:id/proof", CsrController.submitProof);

csrRouter.post(
  "/activities/participations/:id/approve",
  requireRoles(["Admin", "Asset Manager", "Department Head"]),
  CsrController.approveParticipation
);

csrRouter.get("/participations", CsrController.getParticipations);

export default csrRouter;
