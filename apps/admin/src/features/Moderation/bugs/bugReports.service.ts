import {apiClient} from "@mcc/api";
import type {BugStatus, BugUrgency} from "./bugStatus";

export interface ApiBugReport {
  report_id: string;
  reporter_id: string | null;
  reporter_name: string | null;
  reporter_email: string | null;
  reporter_role: string | null;
  description: string;
  page_url: string;
  urgency: BugUrgency;
  screenshot_url: string | null;
  user_agent: string | null;
  status: BugStatus;
  admin_note: string | null;
  resolved_by: string | null;
  resolved_at: string | null;
  created_at: string;
}

export interface BugReportPage {
  reports: ApiBugReport[];
  counts: Record<BugStatus | "total", number>;
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface BugReportFilters {
  status?: BugStatus | "";
  urgency?: BugUrgency | "";
  search?: string;
  page?: number;
  limit?: number;
}

/** Endpoint: GET /admin/moderation/bug-reports */
export const listBugReports = async (filters: BugReportFilters): Promise<BugReportPage> => {
  const params = Object.fromEntries(Object.entries(filters).filter(([, v]) => v !== undefined && v !== ""));
  const res = await apiClient.get<{data: BugReportPage}>("/admin/moderation/bug-reports", {params});
  return res.data.data;
};

/** Endpoint: PATCH /admin/moderation/bug-reports/<id> */
export const updateBugReport = async (
  reportId: string,
  input: {status?: BugStatus; admin_note?: string},
): Promise<ApiBugReport> => {
  const res = await apiClient.patch<{data: ApiBugReport}>(`/admin/moderation/bug-reports/${reportId}`, input);
  return res.data.data;
};
