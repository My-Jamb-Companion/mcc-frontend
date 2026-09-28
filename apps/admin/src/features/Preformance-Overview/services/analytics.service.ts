import { apiClient } from "@mcc/api";

export interface ApiAtRiskStudent {
  user_id: string;
  email: string;
  full_name: string;
  last_activity_at: string;
}

export interface ApiAtRiskStudentsResponse {
  threshold_days: number;
  total_active_students: number;
  at_risk_count: number;
  items: ApiAtRiskStudent[];
}

export interface ApiTeacherPerformance {
  teacher_id: string;
  teacher_name: string;
  student_count: number;
  average_performance: number;
  total_points: number;
}

/** Endpoint: GET /admin/analytics/at-risk-students */
export const getAtRiskStudents = async (days: number): Promise<ApiAtRiskStudentsResponse> => {
  const res = await apiClient.get<{ data: ApiAtRiskStudentsResponse }>(
    "/admin/analytics/at-risk-students",
    { params: { days } },
  );
  return res.data.data;
};

/** Endpoint: GET /admin/analytics/teacher-performance */
export const getTeacherPerformance = async (): Promise<ApiTeacherPerformance[]> => {
  const res = await apiClient.get<{ data: { items: ApiTeacherPerformance[] } }>(
    "/admin/analytics/teacher-performance",
  );
  return res.data.data.items;
};

export interface ApiPlatformOverview {
  total_users: number;
  total_sessions: number;
  average_performance: number;
  total_students: number;
  total_courses: number;
}

/** Endpoint: GET /admin/analytics/overview */
export const getPlatformOverview = async (): Promise<ApiPlatformOverview> => {
  const res = await apiClient.get<{ data: ApiPlatformOverview }>(
    "/admin/analytics/overview",
  );
  return res.data.data;
};

/**
 * Cheap population counts -- both list endpoints already compute `total` for
 * pagination, so limit=1 gets the count without pulling any student rows.
 * Endpoints: GET /admin/active-students, GET /admin/prospective-students
 */
export const getActiveStudentsTotal = async (): Promise<number> => {
  const res = await apiClient.get<{ data: { total: number } }>(
    "/admin/active-students",
    { params: { limit: 1 } },
  );
  return res.data.data.total;
};

export const getProspectiveStudentsTotal = async (): Promise<number> => {
  const res = await apiClient.get<{ data: { total: number } }>(
    "/admin/prospective-students",
    { params: { limit: 1 } },
  );
  return res.data.data.total;
};
