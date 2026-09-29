import {apiClient} from "@mcc/api";

export interface ApiNotification {
  id: string;
  type: string;
  title: string;
  body?: string | null;
  data?: unknown;
  read: boolean;
  created_at: string;
}

export interface ApiNotificationList {
  items: ApiNotification[];
  total: number;
  unread_count: number;
  page: number;
  limit: number;
  pages: number;
}

/** Endpoint: GET /notifications -- the caller's own inbox, newest first. */
export const getNotifications = async (): Promise<ApiNotificationList> => {
  const res = await apiClient.get<{data: ApiNotificationList}>("/notifications");
  return res.data.data;
};

/** Endpoint: PATCH /notifications/{id}/read */
export const markNotificationRead = async (id: string): Promise<void> => {
  await apiClient.patch(`/notifications/${encodeURIComponent(id)}/read`);
};

/** Endpoint: POST /notifications/read-all */
export const markAllNotificationsRead = async (): Promise<{marked_count: number}> => {
  const res = await apiClient.post<{data: {marked_count: number}}>("/notifications/read-all");
  return res.data.data;
};
