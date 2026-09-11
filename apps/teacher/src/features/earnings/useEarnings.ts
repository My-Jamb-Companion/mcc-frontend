import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { showError, showSuccess } from "@mcc/ui";
import { extractApiError } from "@mcc/api";
import { getEarnings, getPayouts, requestPayout } from "./earnings.service";

const EARNINGS_KEY = ["teacher", "earnings"];
const PAYOUTS_KEY = ["teacher", "payouts"];

export const useEarnings = () => useQuery({ queryKey: EARNINGS_KEY, queryFn: getEarnings });

export const usePayouts = () => useQuery({ queryKey: PAYOUTS_KEY, queryFn: getPayouts });

export const useRequestPayout = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: requestPayout,
    onSuccess: () => {
      showSuccess("Payout requested");
      queryClient.invalidateQueries({ queryKey: EARNINGS_KEY });
      queryClient.invalidateQueries({ queryKey: PAYOUTS_KEY });
    },
    onError: (error) => showError(extractApiError(error, "Couldn't request that payout")),
  });
};
