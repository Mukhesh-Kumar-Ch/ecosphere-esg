import { Router } from "express";
import { PolicyController } from "./policy.controller.js";
import { authenticate } from "../../../middlewares/auth.middleware.js";
import { requireRoles } from "../../../middlewares/rbac.middleware.js";

export const policiesRouter = Router();

policiesRouter.use(authenticate);

// Employee actions
policiesRouter.get("/my-acknowledgements", PolicyController.getMyAcknowledgements);
policiesRouter.post("/:id/acknowledge", PolicyController.acknowledgePolicy);

// Policy CRUD
policiesRouter.get("/", PolicyController.getPolicies);
policiesRouter.get("/:id", PolicyController.getPolicyById);

// Writes (Admin/Asset Manager only)
policiesRouter.post("/", requireRoles(["Admin", "Asset Manager"]), PolicyController.createPolicy);
policiesRouter.patch("/:id", requireRoles(["Admin", "Asset Manager"]), PolicyController.updatePolicy);
policiesRouter.delete("/:id", requireRoles(["Admin", "Asset Manager"]), PolicyController.deletePolicy);

export default policiesRouter;
