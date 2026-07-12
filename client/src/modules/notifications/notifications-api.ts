import { request } from "@/services/api";

export type NotificationType = "CSR" | "CHALLENGE" | "BADGE" | "REWARD" | "POLICY" | "AUDIT" | "COMPLIANCE" | "SYSTEM";

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  createdAt: string;
}

interface NotificationsResponse {
  notifications: Notification[];
  unreadCount: number;
}

export const notificationsApi = {
  /** Fetch notifications for the current user. */
  getNotifications: (unreadOnly = false) =>
    request<NotificationsResponse>(`/notifications${unreadOnly ? "?unreadOnly=true" : ""}`),

  /** Mark a single notification as read. */
  markRead: (id: string) =>
    request<{ notification: Notification }>(`/notifications/${id}/read`, { method: "PATCH" }),

  /** Mark all notifications as read. */
  markAllRead: () =>
    request<null>("/notifications/read-all", { method: "PATCH" }),
};
