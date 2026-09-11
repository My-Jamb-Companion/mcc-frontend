import {apiClient} from "@mcc/api";

export interface ApiLeaderboardEntry {
  rank: number;
  user: string;
  score: number;
  photo?: string | null;
}

export interface ApiLeaderboardMe {
  rank: number;
  total_score: number;
}

export interface ApiGoalPeriod {
  target: number;
  earned: number;
  metric: string;
  description: string;
  completion_percent: number;
  status: string;
}

export interface ApiGoalsSummary {
  daily: ApiGoalPeriod & {date: string};
  weekly: ApiGoalPeriod & {week_start: string; week_end: string};
  streak: {current_streak: number; longest_streak: number};
}

export interface ApiMonthlyGoal {
  month: string;
  goal_id: string;
  target: number;
  earned: number;
  metric: string;
  description: string;
  completion_percent: number;
  status: string;
  reward: {type: string; amount: number};
  started_at: string;
  ends_at: string;
}

export interface ApiWeeklyMilestone {
  day: string;
  date: string;
  achieved: boolean | null;
}

export interface ApiWeeklyMilestones {
  week_start: string;
  milestones: ApiWeeklyMilestone[];
}

export interface ApiRewardsBalance {
  total_points: number;
  total_gems: number;
  total_silver: number;
  last_earned_at?: string | null;
}

export interface ApiClaimedReward {
  id: string;
  amount: number;
  reward_type: string;
  source: string;
  title: string;
  claimed_at: string;
}

export interface ApiRewardsStats {
  cumulative_points: number;
  total_count: number;
  rewards: ApiClaimedReward[];
}

export interface ApiPendingReward {
  id: string;
  source: "goal" | "referral" | "leaderboard";
  reward_type: string;
  amount: number;
  status: string;
  created_at: string;
  title?: string;
}

/** Endpoint: GET /leaderboard */
export const getLeaderboard = async (): Promise<ApiLeaderboardEntry[]> => {
  const res = await apiClient.get<{data: ApiLeaderboardEntry[]}>("/leaderboard");
  return res.data.data;
};

/** Endpoint: GET /leaderboard/me */
export const getMyLeaderboardStanding = async (): Promise<ApiLeaderboardMe> => {
  const res = await apiClient.get<{data: ApiLeaderboardMe}>("/leaderboard/me");
  return res.data.data;
};

/** Endpoint: GET /goals/summary */
export const getGoalsSummary = async (): Promise<ApiGoalsSummary> => {
  const res = await apiClient.get<{data: ApiGoalsSummary}>("/goals/summary");
  return res.data.data;
};

/** Endpoint: GET /goals/monthly */
export const getMonthlyGoal = async (): Promise<ApiMonthlyGoal> => {
  const res = await apiClient.get<{data: ApiMonthlyGoal}>("/goals/monthly");
  return res.data.data;
};

/** Endpoint: GET /goals/weekly/milestones */
export const getWeeklyMilestones = async (): Promise<ApiWeeklyMilestones> => {
  const res = await apiClient.get<{data: ApiWeeklyMilestones}>(
    "/goals/weekly/milestones",
  );
  return res.data.data;
};

/** Endpoint: GET /goals/rewards/balance */
export const getRewardsBalance = async (): Promise<ApiRewardsBalance> => {
  const res = await apiClient.get<{data: ApiRewardsBalance}>(
    "/goals/rewards/balance",
  );
  return res.data.data;
};

/** Endpoint: GET /goals/rewards/stats */
export const getRewardsStats = async (): Promise<ApiRewardsStats> => {
  const res = await apiClient.get<{data: ApiRewardsStats}>("/goals/rewards/stats");
  return res.data.data;
};

/** Endpoint: GET /rewards/pending */
export const getPendingRewards = async (): Promise<ApiPendingReward[]> => {
  const res = await apiClient.get<{data: {total_count: number; rewards: ApiPendingReward[]}}>(
    "/rewards/pending",
  );
  return res.data.data.rewards;
};

/** Endpoint: POST /rewards/claim */
export const claimReward = async (
  id: string,
  source: "goal" | "referral" | "leaderboard",
): Promise<{new_balance: number}> => {
  const res = await apiClient.post<{data: {new_balance: number}}>("/rewards/claim", {
    id,
    source,
  });
  return res.data.data;
};
