import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import {showError} from "@mcc/ui";
import {extractApiError} from "@mcc/api";
import {
  getNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "../services/notifications.service";

const QUERY_KEY = ["notifications"];

export const useNotifications = () => {
  const query = useQuery({queryKey: QUERY_KEY, queryFn: getNotifications});
  return {
    ...query,
    items: query.data?.items ?? [],
    unreadCount: query.data?.unread_count ?? 0,
  };
};

export const useMarkNotificationRead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: markNotificationRead,
    onSuccess: () => queryClient.invalidateQueries({queryKey: QUERY_KEY}),
    onError: (error) => showError(extractApiError(error, "Couldn't mark that as read")),
  });
};

export const useMarkAllNotificationsRead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: markAllNotificationsRead,
    onSuccess: () => queryClient.invalidateQueries({queryKey: QUERY_KEY}),
    onError: (error) => showError(extractApiError(error, "Couldn't mark all as read")),
  });
};
