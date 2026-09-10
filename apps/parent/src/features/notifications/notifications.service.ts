import { apiClient } from "@mcc/api";

export interface NotificationItem {
  id: string;
  type: string;
  title: string;
  body: string | null;
  data: Record<string, unknown>;
  read: boolean;
  created_at: string;
}

export interface NotificationList {
  items: NotificationItem[];
  total: number;
  unread_count: number;
  page: number;
  limit: number;
  pages: number;
}

export const getNotifications = async (page = 1, limit = 20): Promise<NotificationList> => {
  const res = await apiClient.get<{ success: boolean; data: NotificationList }>("/notifications", {
    params: { page, limit },
  });
  return res.data.data;
};

export const markNotificationRead = async (id: string): Promise<void> => {
  await apiClient.patch(`/notifications/${id}/read`);
};

export const markAllNotificationsRead = async (): Promise<void> => {
  await apiClient.post("/notifications/read-all");
};
