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
  assigned_cra_id?: string | null;
  assigned_cra_name?: string | null;
}

export interface ApiProgramPerformance {
  program_id: string;
  program_name: string;
  program_type: "course" | "exam";
  level: string;
  average_performance: number;
  total_points: number;
}

export interface ApiUpcomingSession {
  session_id: string;
  title: string;
  teacher_id: string;
  scheduled_at: string;
  duration_minutes: number;
  meeting_url?: string | null;
  program_type?: string | null;
  program_id?: string | null;
}

export interface ApiProgramTeacher {
  teacher_id: string;
  teacher_name: string;
  subject: string;
  email: string;
}

export interface ApiActiveStudentDetail {
  user_id: string;
  full_name: string;
  email: string;
  phone?: string | null;
  username?: string | null;
  status: string;
  location: string;
  onboarding_progress: number;
  onboarded_at?: string | null;
  leaderboard_position?: number | null;
  average_performance_per_course: number;
  total_points: number;
  total_points_all_time: number;
  enrolled_program_id: string;
  program_name: string;
  program_level: string;
  program_courses: string[];
  date_joined: string;
  date_onboarded?: string | null;
  assigned_cra_id?: string | null;
  assigned_cra_name?: string | null;
  program_performance: ApiProgramPerformance[];
  badges: unknown[];
  upcoming_sessions: ApiUpcomingSession[];
  program_teachers: ApiProgramTeacher[];
}

export interface ApiProspectiveStudent {
  user_id: string;
  full_name: string | null;
  email: string;
  education_level?: string | null;
  phone?: string | null;
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
  params?: ListParams & {
    program?: string;
    location?: string;
    date_from?: string;
    date_to?: string;
  },
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
 * Fetches one active student's full detail, including per-program performance
 * (used to build the "currently enrolled" list in EnrollStudentModal).
 * Endpoint: GET /admin/active-students/{user_id}
 */
export const getActiveStudent = async (
  userId: string,
): Promise<ApiActiveStudentDetail> => {
  const res = await apiClient.get<{data: ApiActiveStudentDetail}>(
    `/admin/active-students/${userId}`,
  );
  return res.data.data;
};

/**
 * Admin-comp enrollment into an additional course or exam program --
 * always active and free, regardless of the program's real price.
 * Endpoint: POST /admin/active-students/{user_id}/enroll
 */
export const enrollActiveStudent = async (
  userId: string,
  programId: string,
  programType: "course" | "exam",
): Promise<void> => {
  await apiClient.post(`/admin/active-students/${userId}/enroll`, {
    program_id: programId,
    program_type: programType,
  });
};

/**
 * Cancels a student's enrollment/exam_access row for one program.
 * Endpoint: POST /admin/active-students/{user_id}/unenroll
 */
export const unenrollActiveStudent = async (
  userId: string,
  programId: string,
  programType: "course" | "exam",
): Promise<void> => {
  await apiClient.post(`/admin/active-students/${userId}/unenroll`, {
    program_id: programId,
    program_type: programType,
  });
};

/**
 * Assigns or changes the CRA (Customer Relationship Associate) for an
 * already-onboarded student. Distinct from assignCraToProspectiveStudent --
 * see backend app/features/admin/students/prospective/repository.py::reassign_cra
 * for why the prospective-students endpoint cannot be reused here.
 * Endpoint: POST /admin/active-students/{user_id}/assign-cra
 */
export const assignCraToActiveStudent = async (
  userId: string,
  craId: string,
): Promise<void> => {
  await apiClient.post(`/admin/active-students/${userId}/assign-cra`, {
    cra_id: craId,
  });
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
 * Fetches one prospective student's full detail (same field set as the
 * list row -- there is no separate enrichment for a prospective student,
 * since they hold no enrollment/exam_access row to join against).
 * Endpoint: GET /admin/prospective-students/{user_id}
 */
export const getProspectiveStudent = async (
  userId: string,
): Promise<ApiProspectiveStudent> => {
  const res = await apiClient.get<{data: ApiProspectiveStudent}>(
    `/admin/prospective-students/${userId}`,
  );
  return res.data.data;
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

/**
 * Assigns a prospective student to a CRA (Customer Relationship Associate).
 * Endpoint: POST /admin/prospective-students/{user_id}/assign-cra
 */
export const assignCraToProspectiveStudent = async (
  userId: string,
  craId: string,
): Promise<void> => {
  await apiClient.post(`/admin/prospective-students/${userId}/assign-cra`, {
    cra_id: craId,
  });
};
