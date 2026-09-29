import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { showError, showSuccess } from "@mcc/ui";
import { extractApiError } from "@mcc/api";
import {
  CompleteOnboardingPayload,
  completeOnboarding,
  getMyQueue,
} from "./queue.service";

const QUERY_KEY = ["cra", "queue"];

export const useQueue = () => useQuery({ queryKey: QUERY_KEY, queryFn: getMyQueue });

export const useCompleteOnboarding = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ assignmentId, payload }: { assignmentId: string; payload: CompleteOnboardingPayload }) =>
      completeOnboarding(assignmentId, payload),
    onSuccess: (result) => {
      showSuccess(
        result.status === "active"
          ? "Onboarding recorded — a teacher has been matched."
          : "Onboarding recorded — no matching teacher was free, an admin will assign one.",
      );
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
    onError: (error) => showError(extractApiError(error, "Couldn't record onboarding")),
  });
};
