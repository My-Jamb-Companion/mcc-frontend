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

export interface ApiStaffCount {
  total: number;
  new_in_period: number;
  new_in_previous_period: number;
}

export interface ApiStaffOverview {
  days: number;
  teachers: ApiStaffCount;
  admins: ApiStaffCount;
  pending_teachers: number;
  live_sessions: number;
  live_sessions_previous: number;
}

/** Endpoint: GET /admin/analytics/staff */
export const getStaffOverview = async (days: number): Promise<ApiStaffOverview> =>
  (await apiClient.get<{ data: ApiStaffOverview }>("/admin/analytics/staff", { params: { days } })).data.data;

export interface ApiEnrollmentItem {
  id: string;
  title: string;
  status: string;
  /** Learners with an active enrollment. */
  total: number;
  paid: number;
  free: number;
  new_in_period: number;
  new_in_previous_period: number;
}

export interface ApiEnrollmentGroup {
  /** Distinct learners across all of these. */
  learners: number;
  /** Enrollments: one learner in two courses counts twice. */
  total: number;
  paid: number;
  free: number;
  new_in_period: number;
  new_in_previous_period: number;
  items: ApiEnrollmentItem[];
}

export interface ApiEnrollmentTrendPoint {
  /** First day (YYYY-MM-DD, Lagos) of this bar. */
  start: string;
  courses: number;
  exam_programs: number;
  /** How many of the new ones were paid. */
  paid: number;
  /** All enrollments up to the end of this bar, counting those still active today. */
  total: number;
}

export interface ApiEnrollmentTrend {
  bucket: "day" | "week" | "month";
  points: ApiEnrollmentTrendPoint[];
}

export interface ApiEnrollmentReport {
  days: number;
  learners: number;
  paying_learners: number;
  courses: ApiEnrollmentGroup;
  exam_programs: ApiEnrollmentGroup;
  /** Missing from a server that has not been updated yet. */
  trend?: ApiEnrollmentTrend;
}

/** Endpoint: GET /admin/analytics/enrollments */
export const getEnrollmentReport = async (days: number): Promise<ApiEnrollmentReport> => {
  const res = await apiClient.get<{ data: ApiEnrollmentReport }>(
    "/admin/analytics/enrollments",
    { params: { days } },
  );
  return res.data.data;
};
