import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getNotifications, markAllNotificationsRead, markNotificationRead } from "./notifications.service";

const QUERY_KEY = ["notifications"];

export const useNotifications = () =>
  useQuery({ queryKey: QUERY_KEY, queryFn: () => getNotifications() });

export const useMarkNotificationRead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: markNotificationRead,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEY }),
  });
};

export const useMarkAllNotificationsRead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: markAllNotificationsRead,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEY }),
  });
};

/** The unread count for a header badge; 0 until loaded or when signed out. */
export const useUnreadNotificationCount = () => {
  const { data } = useNotifications();
  return data?.unread_count ?? 0;
};
