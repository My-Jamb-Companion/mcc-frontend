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
