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
