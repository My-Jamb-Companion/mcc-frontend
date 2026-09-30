import {apiClient} from "@mcc/api";

export interface ApiStudentSession {
  session_id: string;
  title: string;
  teacher_id: string;
  teacher_name?: string | null;
  series_id?: string | null;
  scheduled_at: string;
  duration_minutes: number;
  meeting_url?: string | null;
  program_type?: string | null;
  program_id?: string | null;
  is_cohort: boolean;
}

/** Endpoint: GET /student/sessions */
export const getUpcomingSessions = async (): Promise<ApiStudentSession[]> => {
  const res = await apiClient.get<{data: {sessions: ApiStudentSession[]}}>(
    "/student/sessions",
  );
  return res.data.data.sessions;
};

export interface RescheduleOutcome {
  session_id: string;
  status: "auto_accommodated" | "escalated";
  scheduled_at?: string | null;
}

/** Endpoint: POST /assignment/reschedule-request -- only applies to a
 * recurring weekly session (a real `sessions` row). The one-off onboarding
 * call has its own separate reschedule path -- see booking.service.ts's
 * requestOnboardingReschedule (POST /assignment/<assignment_id>/reschedule-request). */
export const requestReschedule = async (input: {
  session_id: string;
  proposed_time: string;
}): Promise<RescheduleOutcome> => {
  const res = await apiClient.post<{data: RescheduleOutcome}>(
    "/assignment/reschedule-request",
    input,
  );
  return res.data.data;
};
