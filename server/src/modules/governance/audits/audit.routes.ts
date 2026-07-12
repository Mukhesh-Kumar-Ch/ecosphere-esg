import { Router } from "express";
import { AuditController } from "./audit.controller.js";
import { authenticate } from "../../../middlewares/auth.middleware.js";
import { requireRoles } from "../../../middlewares/rbac.middleware.js";

export const auditsRouter = Router();

auditsRouter.use(authenticate);

auditsRouter.get("/", AuditController.getAudits);
auditsRouter.get("/:id", AuditController.getAuditById);

auditsRouter.post("/", requireRoles(["Admin", "Asset Manager", "Department Head"]), AuditController.createAudit);
auditsRouter.patch("/:id", requireRoles(["Admin", "Asset Manager", "Department Head"]), AuditController.updateAudit);
auditsRouter.delete("/:id", requireRoles(["Admin", "Asset Manager", "Department Head"]), AuditController.deleteAudit);

export default auditsRouter;
