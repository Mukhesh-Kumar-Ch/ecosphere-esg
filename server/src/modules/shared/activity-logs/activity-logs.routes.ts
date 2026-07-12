import { Router } from "express";
import { prisma } from "../../../config/prisma.js";
import { authenticate } from "../../../middlewares/auth.middleware.js";
import { requireRoles } from "../../../middlewares/rbac.middleware.js";
import { sendSuccess } from "../../../utils/response.js";

export const activityLogsRouter = Router();

activityLogsRouter.use(authenticate);

/**
 * GET /api/v1/activity-logs
 * Admin/Manager only: returns recent activity logs, newest first.
 * Supports ?userId=, ?entityType=, ?action=, ?take= query params
 */
activityLogsRouter.get("/", requireRoles(["Admin", "Department Head", "Asset Manager"]), async (req, res, next) => {
  try {
    const userId = req.query["userId"] as string | undefined;
    const entityType = req.query["entityType"] as string | undefined;
    const action = req.query["action"] as string | undefined;
    const take = Math.min(parseInt(req.query["take"] as string ?? "50") || 50, 200);

    const where: any = {};
    if (userId) where.userId = userId;
    if (entityType) where.entityType = entityType;
    if (action) where.action = action;

    const logs = await prisma.activityLog.findMany({
      where,
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: { createdAt: "desc" },
      take,
    });

    return sendSuccess(res, "Activity logs retrieved successfully.", { logs });
  } catch (error) {
    next(error);
  }
});

export default activityLogsRouter;
