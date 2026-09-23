import { apiClient } from "@mcc/api";

export interface ApiContentReport {
  id: string;
  reporter_id: string;
  content_type: string;
  content_id: string;
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
