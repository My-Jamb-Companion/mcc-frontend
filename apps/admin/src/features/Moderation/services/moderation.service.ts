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
  /** The author's history, so a moderator can see whether this is a one-off. */
  author_total_posts?: number;
  /** Their posts a moderator or teacher removed in the last 90 days. */
  author_removed_posts?: number;
  /** The author is muted from course discussions right now. */
  author_muted?: boolean;
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

export interface ApiCommunityMute {
  mute_id: string;
  user_id: string;
  user_name: string | null;
  user_email: string | null;
  reason: string;
  /** Null: until a moderator lifts it. */
  muted_until: string | null;
  source: "moderator" | "auto";
  created_at: string;
}

/** Endpoint: GET /admin/moderation/community-mutes -- who is muted from course discussions right now. */
export const listMutes = async (): Promise<ApiCommunityMute[]> => {
  const res = await apiClient.get<{ data: { mutes: ApiCommunityMute[] } }>("/admin/moderation/community-mutes");
  return res.data.data.mutes;
};

/** Endpoint: POST /admin/moderation/community-mutes -- `days` null means until lifted. The person is told why. */
export const muteUser = async (input: { user_id: string; reason: string; days: number | null }): Promise<ApiCommunityMute> => {
  const res = await apiClient.post<{ data: ApiCommunityMute }>("/admin/moderation/community-mutes", {
    user_id: input.user_id,
    reason: input.reason,
    ...(input.days ? { days: input.days } : {}),
  });
  return res.data.data;
};

/** Endpoint: DELETE /admin/moderation/community-mutes/{user_id} */
export const unmuteUser = async (userId: string): Promise<void> => {
  await apiClient.delete(`/admin/moderation/community-mutes/${userId}`);
};
