import { Router } from "express";
import { policiesRouter } from "./policies/policy.routes.js";
import { auditsRouter } from "./audits/audit.routes.js";
import { complianceRouter } from "./compliance/compliance.routes.js";
import { reportsRouter } from "./reports.routes.js";

export const governanceRouter = Router();

governanceRouter.use("/policies", policiesRouter);
governanceRouter.use("/audits", auditsRouter);
governanceRouter.use("/compliance", complianceRouter);
governanceRouter.use(reportsRouter);

export default governanceRouter;
