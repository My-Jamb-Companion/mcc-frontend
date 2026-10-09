import type {ApiFinanceOverview, OverviewPeriod} from "../services/finance.service";

export const PERIOD_OPTIONS: {value: OverviewPeriod; label: string}[] = [
  {value: "this_month", label: "This month"},
  {value: "last_month", label: "Last month"},
  {value: "last_3_months", label: "Last 3 months"},
  {value: "last_12_months", label: "Last 12 months"},
  {value: "all_time", label: "All time"},
];

const num = (v: string | number | null | undefined): number => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

const naira = new Intl.NumberFormat("en-NG", {maximumFractionDigits: 0});

/** ₦1,250,000, never a fraction of a kobo's worth of noise on a headline figure. */
export const formatNaira = (v: string | number | null | undefined): string => `₦${naira.format(num(v))}`;

/** ₦20.8m for the small breakdown lines, ₦950 below a thousand. */
export function formatCompactNaira(v: string | number | null | undefined): string {
  const n = num(v);
  if (Math.abs(n) >= 1_000_000) return `₦${(n / 1_000_000).toFixed(1)}m`;
  if (Math.abs(n) >= 10_000) return `₦${(n / 1_000).toFixed(1)}k`;
  return formatNaira(n);
}

export interface OverviewCards {
  collected: {total: string; payments: number; card: string; transfer: string; other: string | null; refunded: string | null};
  income: {course: string; exam: string; gems: string; leftForMcc: string};
  teachers: {earned: string; paidOut: string; owed: string; pending: string | null};
}

/** The three cards' words and numbers from the API's figures. "Other" and "refunded" only appear when non-zero. */
export function toOverviewCards(o: ApiFinanceOverview): OverviewCards {
  return {
    collected: {
      total: formatNaira(o.collected.total),
      payments: o.collected.payments,
      card: formatCompactNaira(o.collected.by_method.card),
      transfer: formatCompactNaira(o.collected.by_method.transfer),
      other: num(o.collected.by_method.other) !== 0 ? formatCompactNaira(o.collected.by_method.other) : null,
      refunded: num(o.collected.refunded) > 0 ? formatCompactNaira(o.collected.refunded) : null,
    },
    income: {
      course: formatCompactNaira(o.collected.by_purpose.course),
      exam: formatCompactNaira(o.collected.by_purpose.exam),
      gems: formatCompactNaira(o.collected.by_purpose.gems),
      leftForMcc: formatNaira(o.left_for_mcc),
    },
    teachers: {
      earned: formatNaira(o.teachers.earned),
      paidOut: formatCompactNaira(o.teachers.paid_out),
      owed: formatCompactNaira(o.teachers.owed_now),
      pending: num(o.teachers.pending_requests) > 0 ? formatCompactNaira(o.teachers.pending_requests) : null,
    },
  };
}
