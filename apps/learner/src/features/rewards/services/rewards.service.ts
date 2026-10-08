import {apiClient} from "@mcc/api";

export interface ApiLeaderboardEntry {
  rank: number;
  user: string;
  score: number;
  photo?: string | null;
  /** This row is the signed-in student. */
  is_me: boolean;
}

/** Narrow the leaderboard: this week or all time; everyone, or only the student's own country/state;
 * and optionally one exam program. */
export interface LeaderboardFilters {
  period: "all" | "week";
  scope: "everyone" | "country" | "state";
  programId?: string;
}

export const DEFAULT_LEADERBOARD_FILTERS: LeaderboardFilters = {period: "all", scope: "everyone"};

const leaderboardParams = (f: LeaderboardFilters) => ({
  period: f.period,
  scope: f.scope,
  ...(f.programId ? {program_id: f.programId, program_type: "exam"} : {}),
});

export interface ApiLeaderboardMe {
  rank: number;
  total_score: number;
}

export interface ApiLeaderboardStatus {
  percentile: number;
  can_claim: boolean;
  /** Gems in this week's prize. */
  prize_gems: number;
  /** The share of active learners a student must be ahead of to win it. */
  min_percentile: number;
  // Not "message" -- api_success (backend) treats any data["message"] key
  // as the response envelope's own message and strips it out of data, so
  // the service returns this field as status_message instead.
  status_message: string;
}

export type ApiGamificationRules = Record<string, number>;

/** What an action (a finished quiz, a lesson, a course) just did for the student. */
export interface ApiGamificationUpdate {
  points_earned: number;
  /** The day's limit on quiz points is used up. */
  daily_cap_reached: boolean;
  daily_goal: {earned: number; target: number; status: string; just_achieved: boolean} | null;
  streak: {current_streak: number; extended: boolean} | null;
  /** Rewards waiting to be claimed on the Rewards page. */
  pending_rewards: number;
}

/** Response of the course and exam-program progress endpoints. */
export interface ApiProgressUpdate {
  progress_percent: number;
  points_earned: number;
  certificate_issued: boolean;
  gamification: ApiGamificationUpdate;
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
export const getLeaderboard = async (
  filters: LeaderboardFilters = DEFAULT_LEADERBOARD_FILTERS,
): Promise<ApiLeaderboardEntry[]> => {
  const res = await apiClient.get<{data: ApiLeaderboardEntry[]}>("/leaderboard", {
    params: leaderboardParams(filters),
  });
  return res.data.data;
};

/** Endpoint: GET /leaderboard/me */
export const getMyLeaderboardStanding = async (
  filters: LeaderboardFilters = DEFAULT_LEADERBOARD_FILTERS,
): Promise<ApiLeaderboardMe> => {
  const res = await apiClient.get<{data: ApiLeaderboardMe}>("/leaderboard/me", {
    params: leaderboardParams(filters),
  });
  return res.data.data;
};

/** Endpoint: GET /leaderboard/status -- the caller's standing this week and
 * prize eligibility. A learner in the top 40% of the week gets one prize for
 * the week; when can_claim is true it is waiting under Rewards (claimed with
 * POST /rewards/claim, source "leaderboard"). */
export const getLeaderboardStatus = async (): Promise<ApiLeaderboardStatus> => {
  const res = await apiClient.get<{data: ApiLeaderboardStatus}>("/leaderboard/status");
  return res.data.data;
};

/** Endpoint: GET /gamification/rules -- static, not personalised. */
export const getGamificationRules = async (): Promise<ApiGamificationRules> => {
  const res = await apiClient.get<{data: ApiGamificationRules}>("/gamification/rules");
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
