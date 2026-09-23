import { apiClient } from "@mcc/api";

export interface EarningsTransaction {
  id: string;
  type: string;
  amount: string;
  description: string | null;
  reference_id: string | null;
  created_at: string;
}

export interface EarningsSummary {
  balance: string;
  transactions: EarningsTransaction[];
}

export interface PayoutRequest {
  id: string;
  teacher_id: string;
  amount: string;
  status: "pending" | "approved" | "rejected";
  notes: string | null;
  requested_at: string;
  resolved_at: string | null;
  resolved_by: string | null;
}

export const getEarnings = async (): Promise<EarningsSummary> => {
  const res = await apiClient.get<{ success: boolean; data: EarningsSummary }>(
    "/teacher/earnings",
  );
  return res.data.data;
};

export const getPayouts = async (): Promise<PayoutRequest[]> => {
  const res = await apiClient.get<{ success: boolean; data: { payouts: PayoutRequest[] } }>(
    "/teacher/payouts",
  );
  return res.data.data.payouts;
};

export const requestPayout = async (amount: string): Promise<PayoutRequest> => {
  const res = await apiClient.post<{ success: boolean; data: PayoutRequest }>(
    "/teacher/payouts/request",
    { amount },
  );
  return res.data.data;
};
