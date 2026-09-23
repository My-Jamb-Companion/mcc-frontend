import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { showError, showSuccess } from "@mcc/ui";
import { extractApiError } from "@mcc/api";
import { getSessionsAwaitingDelivery, getUpcomingSessions, markSessionDelivered } from "./sessions.service";

const AWAITING_KEY = ["teacher", "sessions", "awaiting-delivery"];

export const useUpcomingSessions = () =>
  useQuery({ queryKey: ["teacher", "sessions"], queryFn: getUpcomingSessions });

export const useSessionsAwaitingDelivery = () =>
  useQuery({ queryKey: AWAITING_KEY, queryFn: getSessionsAwaitingDelivery });

const naira = (amount: string) => `₦${Number(amount).toLocaleString()}`;

/** What marking a session delivered did, in words a teacher can check against their earnings. */
export const deliveryMessage = (result: {
  enrolments_paid: number;
  amount_credited: string;
  enrolments_with_budget_used_up: number;
  legacy_enrolments: number;
}): string => {
  if (result.enrolments_paid > 0) {
    const students = result.enrolments_paid === 1 ? "1 student" : `${result.enrolments_paid} students`;
    return `Marked delivered. ${naira(result.amount_credited)} added to your earnings for ${students}.`;
  }
  if (result.enrolments_with_budget_used_up > 0) {
    return "Marked delivered. The paid sessions for these students were already used, so nothing was added.";
  }
  if (result.legacy_enrolments > 0) {
    return "Marked delivered. These students were paid for when they bought the course, so nothing more was added.";
  }
  return "Marked delivered. No paid enrolments were linked to this session.";
};

export const useMarkSessionDelivered = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: markSessionDelivered,
    onSuccess: (result) => {
      showSuccess(deliveryMessage(result));
      queryClient.invalidateQueries({ queryKey: AWAITING_KEY });
      queryClient.invalidateQueries({ queryKey: ["teacher", "earnings"] });
    },
    onError: (error) => showError(extractApiError(error, "Couldn't mark that session delivered")),
  });
};
