import {MonthlyFlowDatum} from "../IncomeAndPayouts";
import {ProgramPerformanceDatum} from "../Performance";
import {
  ProgramOverviewItem,
  StudentOverviewItem,
} from "../FinanceProgramsOverview";
import {
  ApiMonthlyFlowItem,
  ApiProgramRevenueItem,
  ApiRecentPaymentItem,
} from "../services/finance.service";

const MONTH_LABELS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

function monthLabel(yyyyMm: string): string {
  const monthIndex = Number(yyyyMm.slice(5, 7)) - 1;
  return MONTH_LABELS[monthIndex] ?? yyyyMm;
}

export function fromApiMonthlyFlow(api: ApiMonthlyFlowItem[]): MonthlyFlowDatum[] {
  return api.map((item) => ({
    month: monthLabel(item.month),
    income: Number(item.income),
    payout: Number(item.payout),
  }));
}

export interface FinancialHealthSummary {
  /** Income minus payout for the most recent month -- what the FinancialHealthCard's amount represents. */
  netThisMonth: number;
  /** Percent change in netThisMonth vs the previous month. */
  changePercent: number;
  /** netThisMonth as a percentage of that month's income -- "% of monthly income saved". */
  savedPercent: number;
  isHealthy: boolean;
}

/**
 * Derives the Finance dashboard's "Financial Health" card from the same
 * monthly income/payout series already fetched for the Income and Payouts
 * chart -- no separate concept or endpoint needed. `flow` is oldest-first,
 * ending with the current month (get_monthly_income_and_payouts' own
 * ordering).
 */
export function computeFinancialHealth(
  flow: MonthlyFlowDatum[],
): FinancialHealthSummary {
  const current = flow[flow.length - 1];
  const previous = flow[flow.length - 2];

  const netThisMonth = current ? current.income - current.payout : 0;
  const netLastMonth = previous ? previous.income - previous.payout : 0;

  const savedPercent =
    current && current.income > 0
      ? Math.round((netThisMonth / current.income) * 100)
      : 0;

  const changePercent =
    netLastMonth !== 0
      ? Math.round(((netThisMonth - netLastMonth) / Math.abs(netLastMonth)) * 100)
      : netThisMonth > 0
        ? 100
        : 0;

  return {
    netThisMonth,
    changePercent,
    savedPercent,
    isHealthy: netThisMonth >= 0,
  };
}

export function fromApiProgramRevenueToOverview(
  api: ApiProgramRevenueItem[],
): ProgramOverviewItem[] {
  return api.map((item) => ({
    id: item.program_id,
    programTitle: item.title,
    programSubtitle: item.subtitle ?? "",
    programIconUrl: item.icon_url ?? undefined,
    teacherName: item.teacher_name,
    teacherAvatar: item.teacher_avatar,
    number: item.enrollment_count,
    revenuePrimary: Number(item.revenue_gross),
    revenueSecondary: Number(item.revenue_net),
  }));
}

export function fromApiProgramRevenueToPerformance(
  api: ApiProgramRevenueItem[],
): ProgramPerformanceDatum[] {
  return api.map((item) => ({
    id: item.program_id,
    label: item.title,
    sublabel: item.subtitle ?? "",
    value: Number(item.revenue_gross),
    iconUrl: item.icon_url ?? undefined,
  }));
}

function formatDateOnboarded(iso: string | null): string {
  if (!iso) return "—";
  const date = new Date(iso);
  const datePart = date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
  const timePart = date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
  return `${datePart}| ${timePart}`;
}

export function fromApiRecentPayments(
  api: ApiRecentPaymentItem[],
): StudentOverviewItem[] {
  return api.map((item) => ({
    id: item.tx_ref,
    studentName: item.student_name,
    studentEmail: item.student_email,
    avatarUrl:
      item.avatar_url ||
      `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(item.student_email)}`,
    programTitle: item.program_title,
    programSubtitle: item.program_subtitle ?? "",
    programIconUrl: item.program_icon_url ?? undefined,
    amount: Number(item.amount),
    dateOnboarded: formatDateOnboarded(item.completed_at),
  }));
}
