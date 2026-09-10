import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { showError, showSuccess } from "@mcc/ui";
import { extractApiError } from "@mcc/api";
import { createAvailabilitySlot, deleteAvailabilitySlot, getAvailability } from "./availability.service";

const QUERY_KEY = ["teacher", "availability"];

export const useAvailability = () => useQuery({ queryKey: QUERY_KEY, queryFn: getAvailability });

export const useCreateAvailabilitySlot = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createAvailabilitySlot,
    onSuccess: () => {
      showSuccess("Availability slot added");
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
    onError: (error) => showError(extractApiError(error, "Couldn't add that slot")),
  });
};

export const useDeleteAvailabilitySlot = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteAvailabilitySlot,
    onSuccess: () => {
      showSuccess("Availability slot removed");
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
    onError: (error) => showError(extractApiError(error, "Couldn't remove that slot")),
  });
};
