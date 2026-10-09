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

export interface ApiMonthlyFlowItem {
  month: string;
  income: number | string;
  payout: number | string;
}

export interface ApiProgramRevenueItem {
  program_id: string;
  program_type: "course" | "exam";
  title: string;
  subtitle: string | null;
  icon_url: string | null;
  teacher_name: string | null;
  teacher_avatar: string | null;
  enrollment_count: number;
  revenue_gross: number | string;
  revenue_net: number | string;
}

export interface ApiRecentPaymentItem {
  tx_ref: string;
  student_name: string;
  student_email: string;
  avatar_url: string | null;
  program_title: string;
  program_subtitle: string | null;
  program_icon_url: string | null;
  amount: number | string;
  completed_at: string | null;
}

/** Endpoint: GET /admin/finance/monthly-flow */
export const getMonthlyFlow = async (months = 12): Promise<ApiMonthlyFlowItem[]> => {
  const res = await apiClient.get<{ data: { items: ApiMonthlyFlowItem[] } }>(
    "/admin/finance/monthly-flow",
    { params: { months } },
  );
  return res.data.data.items;
};

/** Endpoint: GET /admin/finance/programs */
export const getProgramRevenue = async (limit = 10): Promise<ApiProgramRevenueItem[]> => {
  const res = await apiClient.get<{ data: { items: ApiProgramRevenueItem[] } }>(
    "/admin/finance/programs",
    { params: { limit } },
  );
  return res.data.data.items;
};

/** Endpoint: GET /admin/finance/payments */
export const getRecentPayments = async (limit = 20): Promise<ApiRecentPaymentItem[]> => {
  const res = await apiClient.get<{ data: { items: ApiRecentPaymentItem[] } }>(
    "/admin/finance/payments",
    { params: { limit } },
  );
  return res.data.data.items;
};

export type OverviewPeriod = "this_month" | "last_month" | "last_3_months" | "last_12_months" | "all_time";

export interface ApiFinanceOverview {
  period: {key: OverviewPeriod; start: string | null; end: string | null};
  collected: {
    total: string | number;
    payments: number;
    by_method: {card: string | number; transfer: string | number; other: string | number};
    by_purpose: {course: string | number; exam: string | number; gems: string | number};
    refunded: string | number;
  };
  teachers: {
    earned: string | number;
    paid_out: string | number;
    owed_now: string | number;
    pending_requests: string | number;
  };
  left_for_mcc: string | number;
}

/** Endpoint: GET /admin/finance/overview -- the headline money figures for a period. */
export const getFinanceOverview = async (period: OverviewPeriod): Promise<ApiFinanceOverview> =>
  (await apiClient.get<{data: ApiFinanceOverview}>("/admin/finance/overview", {params: {period}})).data.data;
