import {apiClient} from "@mcc/api";

export interface ApiActiveStudent {
  user_id: string;
  full_name: string | null;
  email: string;
  program_enrolled: string;
  program_description: string;
  program_icon?: string | null;
  date_joined: string;
  date_onboarded?: string | null;
  leaderboard_position?: number | null;
  location: string;
}

export interface ApiProspectiveStudent {
  user_id: string;
  full_name: string | null;
  email: string;
  education_level?: string | null;
  location?: string | null;
  status: string;
  avatar_url?: string | null;
  enrolled_program_id?: string | null;
  program_type?: string | null;
  onboarding_level: number;
  assigned_cra_id?: string | null;
  assigned_cra_name?: string | null;
  zoom_meeting_url?: string | null;
  enrolled_at: string;
  onboarded_at?: string | null;
  created_at: string;
}

interface ListParams {
  search?: string;
  page?: number;
  limit?: number;
}

/**
 * Lists active students for the admin dashboard.
 * Endpoint: GET /admin/active-students
 */
export const listActiveStudents = async (
  params?: ListParams & {program?: string; location?: string},
): Promise<ApiActiveStudent[]> => {
  const res = await apiClient.get<{
    data: {students: ApiActiveStudent[]; total: number};
  }>("/admin/active-students", {params});

  return res.data.data.students;
};

/**
 * Disables an active student's account.
 * Endpoint: POST /admin/active-students/{user_id}/disable
 */
export const disableActiveStudent = async (userId: string): Promise<void> => {
  await apiClient.post(`/admin/active-students/${userId}/disable`);
};

/**
 * Lists prospective students for the admin dashboard.
 * Endpoint: GET /admin/prospective-students
 */
export const listProspectiveStudents = async (
  params?: ListParams & {method?: string},
): Promise<ApiProspectiveStudent[]> => {
  const res = await apiClient.get<{
    data: {students: ApiProspectiveStudent[]; total: number};
  }>("/admin/prospective-students", {params});

  return res.data.data.students;
};

/**
 * Rejects a prospective student.
 * Endpoint: POST /admin/prospective-students/{user_id}/reject
 */
export const rejectProspectiveStudent = async (
  userId: string,
  reason?: string,
): Promise<void> => {
  await apiClient.post(`/admin/prospective-students/${userId}/reject`, {
    reason,
  });
};
