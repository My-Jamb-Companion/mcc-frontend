import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import {
  GamificationConfigInput,
  getActiveGamificationConfig,
  getGamificationVersion,
  listGamificationVersions,
  saveGamificationConfig,
} from "../services/gamification.service";

const ROOT = ["admin", "gamification"] as const;

export const useActiveGamificationConfig = () =>
  useQuery({queryKey: [...ROOT, "active"], queryFn: getActiveGamificationConfig});

export const useGamificationVersions = () =>
  useQuery({queryKey: [...ROOT, "versions"], queryFn: listGamificationVersions});

export const useGamificationVersion = (n: number | null) =>
  useQuery({
    queryKey: [...ROOT, "version", n],
    queryFn: () => getGamificationVersion(n as number),
    enabled: n !== null,
    staleTime: Infinity, // a saved version never changes
  });

export const useSaveGamificationConfig = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: GamificationConfigInput) => saveGamificationConfig(input),
    onSuccess: () => queryClient.invalidateQueries({queryKey: ROOT}),
  });
};
