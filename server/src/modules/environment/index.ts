import { Router } from "express";
import { emissionFactorsRouter } from "./emission-factors/emission-factor.routes.js";
import { environmentalGoalsRouter } from "./environmental-goals/environmental-goal.routes.js";
import { carbonTransactionsRouter } from "./carbon-transactions/carbon-transaction.routes.js";
import { reportsRouter } from "./reports.routes.js";

export const environmentRouter = Router();

environmentRouter.use("/emission-factors", emissionFactorsRouter);
environmentRouter.use("/environmental-goals", environmentalGoalsRouter);
environmentRouter.use("/carbon-transactions", carbonTransactionsRouter);
environmentRouter.use("/reports", reportsRouter);
