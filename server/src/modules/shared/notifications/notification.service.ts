import { prisma } from "../../../config/prisma.js";
import type { NotificationType } from "@prisma/client";

export class NotificationService {
  static async create(
    userId: string,
    title: string,
    message: string,
    type: NotificationType
  ) {
    return prisma.notification.create({
      data: {
        userId,
        title,
        message,
        type,
      },
    });
  }
}
export default NotificationService;
