import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import {
  createPricingParameters,
  getActivePricingParameters,
  getPricingVersion,
  listPricingVersions,
  PricingParametersInput,
} from "../services/pricing.service";

const ROOT = ["admin", "pricing", "parameters"] as const;

export const useActivePricingParameters = () =>
  useQuery({queryKey: [...ROOT, "active"], queryFn: getActivePricingParameters});

export const usePricingVersions = () =>
  useQuery({queryKey: [...ROOT, "versions"], queryFn: listPricingVersions});

export const usePricingVersion = (versionNumber: number | null) =>
  useQuery({
    queryKey: [...ROOT, "version", versionNumber],
    queryFn: () => getPricingVersion(versionNumber as number),
    enabled: versionNumber !== null,
    // A saved version never changes, so there is nothing to refetch.
    staleTime: Infinity,
  });

export const useCreatePricingParameters = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: PricingParametersInput) => createPricingParameters(input),
    onSuccess: () => queryClient.invalidateQueries({queryKey: ROOT}),
  });
};
