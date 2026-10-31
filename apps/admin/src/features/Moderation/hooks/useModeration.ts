import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { dismissReport, listMutes, listReports, muteUser, resolveReport, unmuteUser } from "../services/moderation.service";

export const useReports = (status?: string) =>
  useQuery({
    queryKey: ["admin", "moderation", "reports", status ?? "all"],
    queryFn: () => listReports(status),
  });

export const useResolveReport = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => resolveReport(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "moderation"] }),
  });
};

export const useDismissReport = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => dismissReport(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "moderation"] }),
  });
};

export const useMutes = () =>
  useQuery({
    queryKey: ["admin", "moderation", "mutes"],
    queryFn: listMutes,
  });

export const useMuteUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: muteUser,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "moderation"] }),
  });
};

export const useUnmuteUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => unmuteUser(userId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "moderation"] }),
  });
};
