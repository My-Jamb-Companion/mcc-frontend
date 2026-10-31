import { apiClient } from "@mcc/api";

export interface ApiContentReport {
  id: string;
  /** Null for an automatic report: a post the platform held for review (source "auto"). */
  reporter_id: string | null;
  source?: "user" | "auto";
  reporter_name?: string | null;
  content_type: string;
  content_id: string;
  /** The reported post or message, first 600 characters. */
  content_preview?: string | null;
  /** A community post's state now. */
  content_status?: "visible" | "held" | "hidden" | "removed" | null;
  author_id?: string | null;
  author_name?: string | null;
  course_id?: string | null;
  course_title?: string | null;
  /** Open reports on this same content, this one included. */
  pending_reports?: number;
  reason: string;
  status: "pending" | "resolved" | "dismissed";
  resolved_at: string | null;
  resolved_by: string | null;
  created_at: string;
}

/** Endpoint: GET /admin/moderation/reports */
export const listReports = async (status?: string): Promise<ApiContentReport[]> => {
  const res = await apiClient.get<{ data: { reports: ApiContentReport[] } }>(
    "/admin/moderation/reports",
    { params: status ? { status } : undefined },
  );
  return res.data.data.reports;
};

/** Endpoint: PATCH /admin/moderation/reports/{id}/resolve */
export const resolveReport = async (id: string): Promise<ApiContentReport> => {
  const res = await apiClient.patch<{ data: ApiContentReport }>(
    `/admin/moderation/reports/${id}/resolve`,
  );
  return res.data.data;
};

/** Endpoint: PATCH /admin/moderation/reports/{id}/dismiss */
export const dismissReport = async (id: string): Promise<ApiContentReport> => {
  const res = await apiClient.patch<{ data: ApiContentReport }>(
    `/admin/moderation/reports/${id}/dismiss`,
  );
  return res.data.data;
};
