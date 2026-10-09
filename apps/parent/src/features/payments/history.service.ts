import { apiClient } from "@mcc/api";

export interface ParentPaymentItem {
  tx_ref: string;
  child_id: string;
  child_name: string | null;
  purpose: string;
  status: string;
  item: string | null;
  amount: string | number;
  currency: string;
  receipt_number: string | null;
  created_at: string | null;
  completed_at: string | null;
}

export interface ParentReceipt {
  receipt_number: string | null;
  tx_ref: string;
  item: string;
  purpose: string;
  amount: string;
  currency: string;
  status: string;
  method: string;
  paid_at: string | null;
}

/** Endpoint: GET /parent/payments -- what this parent has paid for their children, newest first. */
export const getParentPayments = async (): Promise<ParentPaymentItem[]> => {
  const res = await apiClient.get<{ data: { payments: ParentPaymentItem[] } }>("/parent/payments");
  return res.data.data.payments;
};

/** Endpoint: GET /parent/payments/{txRef}/receipt */
export const getParentReceipt = async (txRef: string): Promise<ParentReceipt> => {
  const res = await apiClient.get<{ data: ParentReceipt }>(`/parent/payments/${encodeURIComponent(txRef)}/receipt`);
  return res.data.data;
};
