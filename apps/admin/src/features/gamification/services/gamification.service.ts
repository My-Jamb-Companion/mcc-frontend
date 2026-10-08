import {apiClient} from "@mcc/api";

/** Admin-editable gamification rules. Endpoints: /admin/gamification/config (app/features/admin/gamification). */

export type RewardType = "points" | "gems" | "silver";
export type GoalPeriod = "daily" | "weekly" | "monthly";

export interface ApiGoalRule {
  target: number;
  reward_type: RewardType;
  reward_amount: number;
}

export interface ApiStreakMilestone {
  days: number;
  reward_type: RewardType;
  reward_amount: number;
  title: string;
}

export interface ApiActionRules {
  lesson_points: number;
  lesson_daily_cap: number;
  module_quiz_points: number;
  module_quiz_daily_cap: number;
  attendance_points: number;
  attendance_min_percent: number;
  study_day_points: number;
  study_day_min_cards: number;
  daily_login_points: number;
  onboarding_points: number;
  survey_points: number;
}

export interface ApiLevelRule {
  xp: number;
  name: string;
}

export interface ApiBadgeRule {
  key: string;
  name: string;
  description: string;
  target: number;
  enabled: boolean;
}

export interface ApiGamificationConfig {
  quiz: {points: number; pass_percent: number; daily_cap: number};
  progress: {step_points: number; step_daily_cap: number; completion_points: number};
  goals: Record<GoalPeriod, ApiGoalRule>;
  streaks: ApiStreakMilestone[];
  weekly_prize: {gems: number; min_percentile: number};
  referral: {reward_gems: number};
  gem_packs: {packs: number[]; custom_max: number};
  actions: ApiActionRules;
  levels: ApiLevelRule[];
  badges: ApiBadgeRule[];
}

export interface ApiGamificationVersion {
  /** Null while the built-in defaults are in force. */
  version_number: number | null;
  config: ApiGamificationConfig;
  change_reason: string | null;
  created_by: string | null;
  created_by_name: string | null;
  created_at: string | null;
}

export interface ApiGamificationVersionSummary {
  version_number: number;
  change_reason: string;
  created_by: string | null;
  created_by_name: string | null;
  created_at: string | null;
}

export interface GamificationConfigInput {
  config: ApiGamificationConfig;
  change_reason: string;
  based_on_version: number | null;
}

export const getActiveGamificationConfig = async (): Promise<ApiGamificationVersion> =>
  (await apiClient.get<{data: ApiGamificationVersion}>("/admin/gamification/config")).data.data;

export const saveGamificationConfig = async (input: GamificationConfigInput): Promise<ApiGamificationVersion> =>
  (await apiClient.post<{data: ApiGamificationVersion}>("/admin/gamification/config", input)).data.data;

export const listGamificationVersions = async (): Promise<ApiGamificationVersionSummary[]> =>
  (await apiClient.get<{data: {versions: ApiGamificationVersionSummary[]}}>("/admin/gamification/config/versions"))
    .data.data.versions;

export const getGamificationVersion = async (n: number): Promise<ApiGamificationVersion> =>
  (await apiClient.get<{data: ApiGamificationVersion}>(`/admin/gamification/config/versions/${n}`)).data.data;

/** The server's own explanation of a failed save, which is usually a plain sentence. */
export const gamificationErrorMessage = (error: unknown, fallback: string): string => {
  const data = (error as {response?: {data?: {message?: string; error?: {details?: Record<string, string[]>}}}})
    ?.response?.data;
  const first = data?.error?.details ? Object.values(data.error.details).flat()[0] : undefined;
  if (first) return first.replace(/^Value error,\s*/, "");
  return data?.message || fallback;
};
