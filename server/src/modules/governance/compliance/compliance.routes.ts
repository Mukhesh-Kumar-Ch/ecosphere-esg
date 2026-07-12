import { Router } from "express";
import { ComplianceController } from "./compliance.controller.js";
import { authenticate } from "../../../middlewares/auth.middleware.js";
import { requireRoles } from "../../../middlewares/rbac.middleware.js";

export const complianceRouter = Router();

complianceRouter.use(authenticate);

complianceRouter.get("/", ComplianceController.getIssues);
complianceRouter.get("/:id", ComplianceController.getIssueById);

complianceRouter.post("/", requireRoles(["Admin", "Asset Manager", "Department Head"]), ComplianceController.createIssue);
complianceRouter.patch("/:id", requireRoles(["Admin", "Asset Manager", "Department Head"]), ComplianceController.updateIssue);
complianceRouter.delete("/:id", requireRoles(["Admin", "Asset Manager", "Department Head"]), ComplianceController.deleteIssue);

export default complianceRouter;
