import { prisma } from "../../../config/prisma.js";
import type { EntityType, ActionType } from "@prisma/client";

export class ActivityLogService {
  static async log(
    userId: string,
    entityType: EntityType,
    entityId: string,
    action: ActionType,
    oldValue?: any,
    newValue?: any
  ) {
    return prisma.activityLog.create({
      data: {
        userId,
        entityType,
        entityId,
        action,
        oldValue: oldValue ? JSON.parse(JSON.stringify(oldValue)) : null,
        newValue: newValue ? JSON.parse(JSON.stringify(newValue)) : null,
      },
    });
  }
}
export default ActivityLogService;
