import {apiClient} from "@mcc/api";

export interface PaymentStatus {
  tx_ref: string;
  user_id: string;
  purpose: "course_enrollment" | "exam_access" | "gems";
  target_id: string | null;
  amount: string;
  currency: string;
  gems_amount: number | null;
  status: "pending" | "successful" | "failed" | "refunded";
  created_at: string;
  completed_at: string | null;
  refunded_at: string | null;
}

/**
 * Endpoint: GET /payments/status/<tx_ref>
 *
 * The Flutterwave-hosted checkout redirects here with its own status/tx_ref
 * query params, but those are client-editable and can arrive before the
 * webhook that actually settles the intent -- this is the trustworthy
 * source the post-checkout callback page polls instead.
 */
export const getPaymentStatus = async (txRef: string): Promise<PaymentStatus> => {
  const res = await apiClient.get<{data: PaymentStatus}>(`/payments/status/${txRef}`);
  return res.data.data;
};
