import {apiClient} from "@mcc/api";

/** Pricing model build step 5 -- figures summed from each checkout's recorded breakdown. Money is Decimal strings. */

export interface ApiBreakdownTotals {
  count: number;
  amount: string;
  vat: string;
  gateway_fee: string;
  referral_payout: string;
  refund_reserve: string;
  live_teaching: string;
  direct_costs: Record<string, string>;
  development_recovery: string;
  overhead_recovery: string;
  profit_before_tax: string;
  income_tax_provision: string;
}

export interface ApiFinanceSummary {
  start: string;
  /** Exclusive. */
  end: string;
  published_sales: ApiBreakdownTotals;
  published_refunds: ApiBreakdownTotals;
  vat_payable: string;
  legacy_sales: {count: number; amount: string; teacher_share: string};
  legacy_refunds: {count: number; amount: string; teacher_share: string};
  gems_sales: {count: number; amount: string};
  session_pay: {credits: number; credited: string; reversed: string};
  teaching_owed: {enrolments: number; sessions: number; amount: string};
}

/** Endpoint: GET /admin/pricing/finance-summary?from=&to= (inclusive dates) */
export const getFinanceSummary = async (from: string, to: string) =>
  (await apiClient.get<{data: ApiFinanceSummary}>("/admin/pricing/finance-summary", {params: {from, to}})).data.data;
