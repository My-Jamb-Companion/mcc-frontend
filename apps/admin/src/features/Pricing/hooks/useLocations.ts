import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import {
  assignCities,
  createCity,
  getTierSet,
  listCities,
  listCityChangeRequests,
  listLocationAudit,
  resolveCityChangeRequest,
  saveTierSet,
  TierSetInput,
  updateCity,
} from "../services/locations.service";

const ROOT = ["admin", "pricing", "locations"] as const;

// Tiers, cities and requests all affect each other's figures (city counts per
// tier, effective tier names on requests), so any write refreshes the lot.
const useInvalidateLocations = () => {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({queryKey: ROOT});
};

export const useTierSet = () => useQuery({queryKey: [...ROOT, "tiers"], queryFn: getTierSet});

export const useSaveTierSet = () => {
  const invalidate = useInvalidateLocations();
  return useMutation({mutationFn: (input: TierSetInput) => saveTierSet(input), onSuccess: invalidate});
};

export const useCities = (filters: {country?: string; state?: string; tier_id?: string; q?: string}) =>
  useQuery({queryKey: [...ROOT, "cities", filters], queryFn: () => listCities(filters)});

export const useCreateCity = () => {
  const invalidate = useInvalidateLocations();
  return useMutation({mutationFn: createCity, onSuccess: invalidate});
};

export const useUpdateCity = () => {
  const invalidate = useInvalidateLocations();
  return useMutation({
    mutationFn: ({cityId, input}: {cityId: string; input: Parameters<typeof updateCity>[1]}) =>
      updateCity(cityId, input),
    onSuccess: invalidate,
  });
};

export const useAssignCities = () => {
  const invalidate = useInvalidateLocations();
  return useMutation({mutationFn: assignCities, onSuccess: invalidate});
};

export const useCityChangeRequests = (status?: string) =>
  useQuery({
    queryKey: [...ROOT, "requests", status ?? "all"],
    queryFn: () => listCityChangeRequests(status),
  });

export const useResolveCityChangeRequest = () => {
  const invalidate = useInvalidateLocations();
  return useMutation({
    mutationFn: ({requestId, decision, note}: {requestId: string; decision: "approve" | "reject"; note?: string}) =>
      resolveCityChangeRequest(requestId, decision, note),
    onSuccess: invalidate,
  });
};

export const useLocationAudit = () =>
  useQuery({queryKey: [...ROOT, "audit"], queryFn: listLocationAudit});
