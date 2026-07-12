import { Router } from "express";
import { authenticate } from "../../../middlewares/auth.middleware.js";
import { requireRoles } from "../../../middlewares/rbac.middleware.js";
import { validateRequest } from "../../../middlewares/validate-request.middleware.js";
import {
  createCarbonTransactionController,
  getCarbonTransactionController,
  listCarbonTransactionsController,
} from "./carbon-transaction.controller.js";
import {
  carbonTransactionParamsSchema,
  createCarbonTransactionSchema,
} from "./carbon-transaction.schemas.js";

export const carbonTransactionsRouter = Router();

carbonTransactionsRouter.use(authenticate);

carbonTransactionsRouter.get("/", listCarbonTransactionsController);
carbonTransactionsRouter.get("/:id", validateRequest(carbonTransactionParamsSchema, "params"), getCarbonTransactionController);

carbonTransactionsRouter.post(
  "/",
  requireRoles(["Admin", "Asset Manager", "Department Head"]),
  validateRequest(createCarbonTransactionSchema),
  createCarbonTransactionController,
);
