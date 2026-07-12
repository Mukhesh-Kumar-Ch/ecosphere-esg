import { Router } from "express";
import { prisma } from "../../../config/prisma.js";
import { authenticate } from "../../../middlewares/auth.middleware.js";
import { sendSuccess } from "../../../utils/response.js";

export const notificationsRouter = Router();

notificationsRouter.use(authenticate);

/**
 * GET /api/v1/notifications
 * Returns the authenticated user's notifications, newest first.
 * Optionally filter by ?unreadOnly=true
 */
notificationsRouter.get("/", async (req, res, next) => {
  try {
    const userId = req.user!.id;
    const unreadOnly = req.query["unreadOnly"] === "true";

    const where: any = { userId };
    if (unreadOnly) where.isRead = false;

    const notifications = await prisma.notification.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    const unreadCount = await prisma.notification.count({
      where: { userId, isRead: false },
    });

    return sendSuccess(res, "Notifications retrieved successfully.", { notifications, unreadCount });
  } catch (error) {
    next(error);
  }
});

/**
 * PATCH /api/v1/notifications/:id/read
 * Marks a single notification as read.
 */
notificationsRouter.patch("/:id/read", async (req, res, next) => {
  try {
    const userId = req.user!.id;
    const notifId = req.params["id"] as string;

    const notif = await prisma.notification.findFirst({
      where: { id: notifId, userId },
    });

    if (!notif) {
      return sendSuccess(res, "Notification not found.", null);
    }

    const updated = await prisma.notification.update({
      where: { id: notifId },
      data: { isRead: true },
    });

    return sendSuccess(res, "Notification marked as read.", { notification: updated });
  } catch (error) {
    next(error);
  }
});

/**
 * PATCH /api/v1/notifications/read-all
 * Marks all of the authenticated user's notifications as read.
 */
notificationsRouter.patch("/read-all", async (req, res, next) => {
  try {
    const userId = req.user!.id;

    await prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });

    return sendSuccess(res, "All notifications marked as read.", null);
  } catch (error) {
    next(error);
  }
});

export default notificationsRouter;
