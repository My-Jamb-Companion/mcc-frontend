import { apiClient } from "@mcc/api";

export interface ApiPayoutRequest {
  id: string;
  teacher_id: string;
  amount: number | string;
  status: "pending" | "approved" | "rejected";
  notes: string | null;
  requested_at: string;
  resolved_at: string | null;
  resolved_by: string | null;
}

export interface ApiPaymentIntent {
  tx_ref: string;
  user_id: string;
  purpose: string;
  target_id: string | null;
  amount: number | string;
  currency: string;
  gems_amount: number | null;
  status: "pending" | "successful" | "failed" | "refunded";
  created_at: string;
  completed_at: string | null;
  refunded_at: string | null;
}

/** Endpoint: GET /admin/payouts */
export const listPayouts = async (status?: string): Promise<ApiPayoutRequest[]> => {
  const res = await apiClient.get<{ data: { payouts: ApiPayoutRequest[] } }>("/admin/payouts", {
    params: status ? { status } : undefined,
  });
  return res.data.data.payouts;
};

/** Endpoint: PATCH /admin/payouts/{id}/approve */
export const approvePayout = async (id: string, notes?: string): Promise<ApiPayoutRequest> => {
  const res = await apiClient.patch<{ data: ApiPayoutRequest }>(
    `/admin/payouts/${id}/approve`,
    { notes },
  );
  return res.data.data;
};

/** Endpoint: PATCH /admin/payouts/{id}/reject */
export const rejectPayout = async (id: string, notes?: string): Promise<ApiPayoutRequest> => {
  const res = await apiClient.patch<{ data: ApiPayoutRequest }>(
    `/admin/payouts/${id}/reject`,
    { notes },
  );
  return res.data.data;
};

/** Endpoint: GET /admin/payments */
export const listPayments = async (status?: string): Promise<ApiPaymentIntent[]> => {
  const res = await apiClient.get<{ data: { payments: ApiPaymentIntent[] } }>("/admin/payments", {
    params: status ? { status } : undefined,
  });
  return res.data.data.payments;
};

/** Endpoint: PATCH /admin/payments/{tx_ref}/refund */
export const refundPayment = async (txRef: string): Promise<ApiPaymentIntent> => {
  const res = await apiClient.patch<{ data: ApiPaymentIntent }>(
    `/admin/payments/${txRef}/refund`,
  );
  return res.data.data;
};
