import { Router } from "express";
import { authRouter } from "./auth.routes.js";
import { healthRouter } from "./health.routes.js";
import { organizationRouter } from "../modules/organization/index.js";

export const apiRouter = Router();

apiRouter.use("/auth", authRouter);
apiRouter.use("/health", healthRouter);
apiRouter.use(organizationRouter);
