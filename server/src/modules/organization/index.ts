import { Router } from "express";
import { departmentsRouter } from "./departments/department.routes.js";
import { categoriesRouter } from "./categories/category.routes.js";
import { settingsRouter } from "./settings/setting.routes.js";

export const organizationRouter = Router();

organizationRouter.use("/departments", departmentsRouter);
organizationRouter.use("/categories", categoriesRouter);
organizationRouter.use("/settings", settingsRouter);