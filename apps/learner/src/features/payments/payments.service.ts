import {apiClient} from "@mcc/api";

export interface PaymentStatus {
  tx_ref: string;
  purpose: "course_enrollment" | "exam_access" | "gems";
  amount: string;
  currency: string;
  gems_amount: number | null;
  status: "pending" | "successful" | "failed" | "refunded" | "expired";
  receipt_number: string | null;
  /** Whether what was paid for has been given yet; a paid payment can read false for a few minutes while a retry runs. */
  granted: boolean;
  created_at: string | null;
  completed_at: string | null;
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
