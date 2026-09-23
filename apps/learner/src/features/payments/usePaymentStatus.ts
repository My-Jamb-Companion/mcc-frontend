import {useQuery} from "@tanstack/react-query";
import {getPaymentStatus} from "./payments.service";

/**
 * Polls the caller's own payment intent until it leaves "pending" -- the
 * webhook that actually settles it can lag a couple seconds behind the
 * browser's own redirect back from checkout.
 */
export const usePaymentStatus = (txRef: string | null) => {
  return useQuery({
    queryKey: ["payments", "status", txRef],
    queryFn: () => getPaymentStatus(txRef as string),
    enabled: !!txRef,
    retry: false,
    refetchInterval: (query) => (query.state.data?.status === "pending" ? 2000 : false),
  });
};
