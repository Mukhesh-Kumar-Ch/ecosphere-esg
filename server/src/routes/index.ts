import { Router } from "express";
import { authRouter } from "./auth.routes.js";
import { healthRouter } from "./health.routes.js";
import { organizationRouter } from "../modules/organization/index.js";
import { environmentRouter } from "../modules/environment/index.js";
import { governanceRouter } from "../modules/governance/index.js";
import { socialRouter } from "../modules/social/index.js";
import { reportsRouter } from "../modules/reports/index.js";
import { notificationsRouter } from "../modules/shared/notifications/notifications.routes.js";
import { activityLogsRouter } from "../modules/shared/activity-logs/activity-logs.routes.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { prisma } from "../config/prisma.js";

export const apiRouter = Router();

apiRouter.use("/auth", authRouter);
apiRouter.use("/health", healthRouter);
apiRouter.use(organizationRouter);
apiRouter.use(environmentRouter);
apiRouter.use(governanceRouter);
apiRouter.use(socialRouter);
apiRouter.use("/reports", reportsRouter);
apiRouter.use("/notifications", notificationsRouter);
apiRouter.use("/activity-logs", activityLogsRouter);


apiRouter.get("/users", authenticate, async (req, res, next) => {
  try {
    const users = await prisma.user.findMany({
      where: { deletedAt: null },
      include: { role: true, department: true },
      orderBy: { name: "asc" },
    });
    res.json({ users });
  } catch (err) {
    next(err);
  }
});
