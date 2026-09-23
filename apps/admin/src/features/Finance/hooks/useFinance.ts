import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  approvePayout,
  listPayments,
  listPayouts,
  refundPayment,
  rejectPayout,
} from "../services/finance.service";

export const usePayouts = (status?: string) =>
  useQuery({
    queryKey: ["admin", "payouts", status ?? "all"],
    queryFn: () => listPayouts(status),
  });

export const useApprovePayout = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, notes }: { id: string; notes?: string }) => approvePayout(id, notes),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "payouts"] }),
  });
};

export const useRejectPayout = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, notes }: { id: string; notes?: string }) => rejectPayout(id, notes),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "payouts"] }),
  });
};

export const usePayments = (status?: string) =>
  useQuery({
    queryKey: ["admin", "payments", status ?? "all"],
    queryFn: () => listPayments(status),
  });

export const useRefundPayment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (txRef: string) => refundPayment(txRef),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "payments"] }),
  });
};
