import { useQuery } from "@tanstack/react-query";
import { getParentPayments, getParentReceipt } from "./history.service";

export const useParentPayments = () => useQuery({ queryKey: ["parent", "payments"], queryFn: getParentPayments });

export const useParentReceipt = (txRef: string | null) =>
  useQuery({
    queryKey: ["parent", "payments", "receipt", txRef],
    queryFn: () => getParentReceipt(txRef as string),
    enabled: !!txRef,
  });
