import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { dismissReport, listReports, resolveReport } from "../services/moderation.service";

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
