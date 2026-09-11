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
