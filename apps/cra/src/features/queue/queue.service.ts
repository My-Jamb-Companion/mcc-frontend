import { apiClient } from "@mcc/api";

export interface QueueItem {
  assignment_id: string;
  student_name: string | null;
  student_email: string;
  purpose: string; // 'course' | 'exam'
  target_id: string;
  subject_name: string | null;
  onboarding_meeting_url: string | null;
  onboarding_scheduled_at: string | null;
}

export interface CompleteOnboardingPayload {
  weekly_day_of_week: number; // ISO 8601: 1=Monday..7=Sunday
  weekly_start_time: string; // HH:MM, 24-hour
  duration_minutes?: number;
}

export interface AssignmentActivated {
  id: string;
  status: string;
  teacher_user_id: string | null;
  series_id: string | null;
}

export const getMyQueue = async (): Promise<QueueItem[]> => {
  const res = await apiClient.get<{ success: boolean; data: { assignments: QueueItem[] } }>(
    "/assignment/my-queue",
  );
  return res.data.data.assignments;
};

export const completeOnboarding = async (
  assignmentId: string,
  payload: CompleteOnboardingPayload,
): Promise<AssignmentActivated> => {
  const res = await apiClient.post<{ success: boolean; data: AssignmentActivated }>(
    `/assignment/${assignmentId}/complete-onboarding`,
    payload,
  );
  return res.data.data;
};
