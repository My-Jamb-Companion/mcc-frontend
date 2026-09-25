import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import {getTierSet, listLocationAudit, saveTierSet, TierSetInput} from "../services/locations.service";

const ROOT = ["admin", "pricing", "locations"] as const;

export const useTierSet = () => useQuery({queryKey: [...ROOT, "tiers"], queryFn: getTierSet});

export const useSaveTierSet = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: TierSetInput) => saveTierSet(input),
    onSuccess: () => queryClient.invalidateQueries({queryKey: ROOT}),
  });
};

export const useLocationAudit = () =>
  useQuery({queryKey: [...ROOT, "audit"], queryFn: listLocationAudit});
