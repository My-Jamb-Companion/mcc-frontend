import { apiClient } from "@mcc/api";

export interface TeacherSession {
  session_id: string;
  title: string;
  scheduled_at: string;
  duration_minutes: number;
  meeting_url: string | null;
  student_id: string | null;
  program_type: string | null;
  program_id: string | null;
}

export const getUpcomingSessions = async (): Promise<TeacherSession[]> => {
  const res = await apiClient.get<{ success: boolean; data: { sessions: TeacherSession[] } }>(
    "/teacher/sessions",
  );
  return res.data.data.sessions;
};

export interface DeliveryResult {
  session_id: string;
  enrolments_paid: number;
  amount_credited: string;
  enrolments_with_budget_used_up: number;
  legacy_enrolments: number;
}

/** Endpoint: GET /teacher/sessions/awaiting-delivery -- started, not yet marked delivered. */
export const getSessionsAwaitingDelivery = async (): Promise<TeacherSession[]> => {
  const res = await apiClient.get<{ success: boolean; data: { sessions: TeacherSession[] } }>(
    "/teacher/sessions/awaiting-delivery",
  );
  return res.data.data.sessions;
};

/** Endpoint: POST /teacher/sessions/{id}/delivered -- how a teacher is paid for a session. */
export const markSessionDelivered = async (sessionId: string): Promise<DeliveryResult> => {
  const res = await apiClient.post<{ success: boolean; data: DeliveryResult }>(
    `/teacher/sessions/${encodeURIComponent(sessionId)}/delivered`,
  );
  return res.data.data;
};
