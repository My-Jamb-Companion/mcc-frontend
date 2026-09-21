import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import {
  getActiveModel,
  listAvailableModels,
  listModelHistory,
  setActiveModel,
} from "../services/aiSettings.service";

const ROOT = ["admin", "ai-settings"] as const;

export const useActiveModel = () =>
  useQuery({queryKey: [...ROOT, "active"], queryFn: getActiveModel});

export const useModelHistory = () =>
  useQuery({queryKey: [...ROOT, "history"], queryFn: listModelHistory});

export const useAvailableModels = () =>
  useQuery({
    queryKey: [...ROOT, "catalog"],
    queryFn: listAvailableModels,
    // The catalog is a provider-side list, not something that changes minute
    // to minute -- matches the backend's own 5-minute cache.
    staleTime: 5 * 60 * 1000,
  });

export const useSetActiveModel = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: setActiveModel,
    onSuccess: () => queryClient.invalidateQueries({queryKey: ROOT}),
  });
};
