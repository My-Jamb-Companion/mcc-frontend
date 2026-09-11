import {apiClient} from "@mcc/api";

export interface ApiDashboardStats {
  courses_in_progress: number;
  courses_completed: number;
  certificates_earned: number;
  total_hours: number;
}

/** Endpoint: GET /user/dashboard */
export const getDashboardStats = async (): Promise<ApiDashboardStats> => {
  const res = await apiClient.get<{data: ApiDashboardStats}>("/user/dashboard");
  return res.data.data;
};
