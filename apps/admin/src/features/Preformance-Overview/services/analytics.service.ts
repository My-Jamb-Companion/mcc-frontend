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
