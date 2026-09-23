import { apiClient } from "@mcc/api";

export interface ChildSummary {
  child_id: string;
  email: string;
  full_name: string | null;
  relationship: string;
  linked_at: string;
}

export interface ProgramPerformance {
  program_id: string;
  program_name: string;
  level: string;
  average_performance: number;
  total_points: number;
}

export interface UpcomingSession {
  session_id: string;
  title: string;
  teacher_id: string;
  scheduled_at: string;
  duration_minutes: number;
  meeting_url: string | null;
  program_type: string | null;
  program_id: string | null;
}

export interface ProgramTeacher {
  teacher_id: string;
  teacher_name: string;
  subject: string;
  email: string;
}

export interface ChildDetail {
  child_id: string;
  email: string;
  full_name: string | null;
  has_active_enrollment: boolean;
  program_performance: ProgramPerformance[];
  badges: unknown[];
  upcoming_sessions: UpcomingSession[];
  program_teachers: ProgramTeacher[];
}

export const getChildren = async (): Promise<ChildSummary[]> => {
  const res = await apiClient.get<{ success: boolean; data: { children: ChildSummary[] } }>(
    "/parent/children",
  );
  return res.data.data.children;
};

export const getChildDetail = async (childId: string): Promise<ChildDetail> => {
  const res = await apiClient.get<{ success: boolean; data: ChildDetail }>(
    `/parent/children/${childId}`,
  );
  return res.data.data;
};
