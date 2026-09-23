import {apiClient} from "@mcc/api";

export interface PlatformOverview {
  total_users: number;
  total_sessions: number;
  average_performance: number;
}

export interface UserGrowthPoint {
  date: string;
  new_users: number;
}

export interface LeaderboardEntry {
  full_name: string;
  leaderboard_position: number;
  total_points: number;
}

/** Endpoint: GET /admin/analytics/overview */
export const getPlatformOverview = async (): Promise<PlatformOverview> => {
  const res = await apiClient.get<{data: PlatformOverview}>(
    "/admin/analytics/overview",
  );
  return res.data.data;
};

/** Endpoint: GET /admin/analytics/users/growth */
export const getUserGrowth = async (): Promise<UserGrowthPoint[]> => {
  const res = await apiClient.get<{data: {items: UserGrowthPoint[]}}>(
    "/admin/analytics/users/growth",
  );
  return res.data.data.items;
};

/** Endpoint: GET /admin/analytics/leaderboard */
export const getLeaderboard = async (): Promise<LeaderboardEntry[]> => {
  const res = await apiClient.get<{data: {items: LeaderboardEntry[]}}>(
    "/admin/analytics/leaderboard",
  );
  return res.data.data.items;
};
