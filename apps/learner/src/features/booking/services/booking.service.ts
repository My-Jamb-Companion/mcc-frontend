import {apiClient} from "@mcc/api";

export interface ApiAssignmentStatus {
  id: string;
  purpose: string; // 'course' | 'exam'
  target_id: string;
  status: string; // pending_cra | cra_escalated | onboarding_scheduled | teacher_escalated | active
  cra_user_id?: string | null;
  cra_is_fallback: boolean;
  onboarding_meeting_url?: string | null;
  onboarding_scheduled_at?: string | null;
  teacher_user_id?: string | null;
  teacher_escalated: boolean;
  series_id?: string | null;
  created_at: string;
  updated_at: string;
}

/** Endpoint: GET /assignment/status -- the caller's own assignment
 * journeys, one per enrollment that has gone through select-slot. */
export const getAssignmentStatus = async (): Promise<ApiAssignmentStatus[]> => {
  const res = await apiClient.get<{data: {assignments: ApiAssignmentStatus[]}}>(
    "/assignment/status",
  );
  return res.data.data.assignments;
};

/** Endpoint: POST /assignment/select-slot -- the flow diagram's "Slot
 * selection" step, picking the one-off onboarding call time. */
export const selectSlot = async (input: {
  purpose: "course" | "exam";
  target_id: string;
  scheduled_at: string;
}): Promise<ApiAssignmentStatus> => {
  const res = await apiClient.post<{data: ApiAssignmentStatus}>(
    "/assignment/select-slot",
    input,
  );
  return res.data.data;
};
