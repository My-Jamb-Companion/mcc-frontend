import type {ApiBreakdownTotals} from "../services/finance.service";

export interface FinanceRow {
  key: string;
  label: string;
  sales: number;
  refunds: number;
  net: number;
}

const DIRECT_COST_LABELS: Record<string, string> = {
  ai: "AI usage",
  messaging: "Messaging",
  hosting: "Hosting & video delivery",
  acquisition: "Ads per enrolment",
  marking: "Mock exam marking",
  materials: "Materials",
  other: "Other direct costs",
};

/**
 * Where the money from published-price sales went, bucket by bucket, with
 * refunds netted off. Direct-cost categories from either side are all listed,
 * so a category only refunded in the period still shows.
 */
export const financeRows = (sales: ApiBreakdownTotals, refunds: ApiBreakdownTotals): FinanceRow[] => {
  const row = (key: string, label: string, s: string | undefined, r: string | undefined): FinanceRow => {
    const salesValue = Number(s ?? 0);
    const refundValue = Number(r ?? 0);
    return {key, label, sales: salesValue, refunds: refundValue, net: salesValue - refundValue};
  };
  const categories = Array.from(new Set([...Object.keys(sales.direct_costs), ...Object.keys(refunds.direct_costs)])).sort();
  return [
    row("amount", "Paid by students (VAT included)", sales.amount, refunds.amount),
    row("vat", "VAT to remit", sales.vat, refunds.vat),
    row("gateway_fee", "Gateway fees", sales.gateway_fee, refunds.gateway_fee),
    row("referral_payout", "Referral payouts", sales.referral_payout, refunds.referral_payout),
    row("refund_reserve", "Refund reserve", sales.refund_reserve, refunds.refund_reserve),
    row("live_teaching", "Live teaching (paid as sessions are delivered)", sales.live_teaching, refunds.live_teaching),
    ...categories.map((c) =>
      row(`direct-${c}`, DIRECT_COST_LABELS[c] ?? c, sales.direct_costs[c], refunds.direct_costs[c]),
    ),
    row("development_recovery", "Development recovery", sales.development_recovery, refunds.development_recovery),
    row("overhead_recovery", "Overhead recovery", sales.overhead_recovery, refunds.overhead_recovery),
    row("profit_before_tax", "Profit before tax", sales.profit_before_tax, refunds.profit_before_tax),
    row("income_tax_provision", "Set aside for company tax", sales.income_tax_provision, refunds.income_tax_provision),
  ];
};

const pad = (n: number) => String(n).padStart(2, "0");
const iso = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

/** Quick period choices, as inclusive [from, to] dates relative to `today`. */
export const periods = (today: Date) => {
  const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);
  const lastMonthStart = new Date(lastMonthEnd.getFullYear(), lastMonthEnd.getMonth(), 1);
  const quarterStart = new Date(today.getFullYear(), Math.floor(today.getMonth() / 3) * 3, 1);
  return {
    "This month": [iso(thisMonth), iso(today)],
    "Last month": [iso(lastMonthStart), iso(lastMonthEnd)],
    "This quarter": [iso(quarterStart), iso(today)],
    "This year": [iso(new Date(today.getFullYear(), 0, 1)), iso(today)],
  } as Record<string, [string, string]>;
};
