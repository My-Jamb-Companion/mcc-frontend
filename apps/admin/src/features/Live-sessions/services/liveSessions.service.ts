import {apiClient} from "@mcc/api";

export interface ApiLiveSession {
  session_id: string;
  title: string;
  teacher_id: string;
  teacher_name: string;
  program_type?: "course" | "exam" | null;
  program_id?: string | null;
  scheduled_at: string;
  duration_minutes: number;
  price: number;
  meeting_provider?: string | null;
  meeting_url?: string | null;
  status: "planned" | "completed" | "cancelled";
  created_at: string;
}

export interface LiveSessionsOverview {
  upcoming_sessions: number;
  total_sessions: number;
  total_calls: number;
  // Decimal serializes as a string over the wire, not a JSON number.
  total_revenue: number | string;
}

/** Endpoint: GET /admin/live-sessions/this-week */
export const listThisWeekSessions = async (): Promise<ApiLiveSession[]> => {
  const res = await apiClient.get<{data: ApiLiveSession[]}>(
    "/admin/live-sessions/this-week",
  );
  return res.data.data;
};

/** Endpoint: GET /admin/live-sessions/overview */
export const getLiveSessionsOverview = async (
  days = 30,
): Promise<LiveSessionsOverview> => {
  const res = await apiClient.get<{data: LiveSessionsOverview}>(
    "/admin/live-sessions/overview",
    {params: {days}},
  );
  return res.data.data;
};

/** Endpoint: PATCH /admin/live-sessions/{session_id}/reschedule */
export const rescheduleSession = async (
  sessionId: string,
  scheduledAt: string,
): Promise<void> => {
  await apiClient.patch(`/admin/live-sessions/${sessionId}/reschedule`, {
    scheduled_at: scheduledAt,
  });
};

/** Endpoint: DELETE /admin/live-sessions/{session_id}/cancel */
export const cancelSession = async (sessionId: string): Promise<void> => {
  await apiClient.delete(`/admin/live-sessions/${sessionId}/cancel`);
};

/** Endpoint: POST /admin/live-sessions/{session_id}/share-link */
export const shareSessionLink = async (
  sessionId: string,
  recipientId: string,
): Promise<void> => {
  await apiClient.post(`/admin/live-sessions/${sessionId}/share-link`, {
    recipient_id: recipientId,
  });
};

export interface DeliveryResult {
  session_id: string;
  status: "planned" | "completed";
  enrolments_paid: number;
  amount_credited: string;
  enrolments_with_budget_used_up: number;
  legacy_enrolments: number;
}

/** Endpoint: POST /admin/live-sessions/{session_id}/delivered -- pays the teacher, as if they'd confirmed it. */
export const markSessionDelivered = async (sessionId: string): Promise<DeliveryResult> =>
  (await apiClient.post<{data: DeliveryResult}>(`/admin/live-sessions/${sessionId}/delivered`)).data.data;

/** Endpoint: DELETE /admin/live-sessions/{session_id}/delivered -- reverses the teacher's pay for it. */
export const undoSessionDelivered = async (sessionId: string): Promise<DeliveryResult> =>
  (await apiClient.delete<{data: DeliveryResult}>(`/admin/live-sessions/${sessionId}/delivered`)).data.data;
