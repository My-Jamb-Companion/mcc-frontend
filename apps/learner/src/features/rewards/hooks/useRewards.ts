import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import {
  DEFAULT_LEADERBOARD_FILTERS,
  LeaderboardFilters,
  claimReward,
  getGamificationRules,
  getMyGamification,
  getGoalsSummary,
  getLeaderboard,
  getLeaderboardStatus,
  getMonthlyGoal,
  getMyLeaderboardStanding,
  getPendingRewards,
  getRewardsBalance,
  getRewardsStats,
  getWeeklyMilestones,
} from "../services/rewards.service";

export const useLeaderboard = (filters: LeaderboardFilters = DEFAULT_LEADERBOARD_FILTERS) => {
  const query = useQuery({queryKey: ["leaderboard", "list", filters], queryFn: () => getLeaderboard(filters)});
  return {...query, entries: query.data ?? []};
};

export const useMyLeaderboardStanding = (filters: LeaderboardFilters = DEFAULT_LEADERBOARD_FILTERS) =>
  useQuery({queryKey: ["leaderboard", "me", filters], queryFn: () => getMyLeaderboardStanding(filters)});

export const useLeaderboardStatus = () =>
  useQuery({queryKey: ["leaderboard", "status"], queryFn: getLeaderboardStatus});

export const useMyGamification = () =>
  useQuery({queryKey: ["gamification", "me"], queryFn: getMyGamification});

export const useGamificationRules = () =>
  useQuery({queryKey: ["gamification", "rules"], queryFn: getGamificationRules});

export const useGoalsSummary = () =>
  useQuery({queryKey: ["goals", "summary"], queryFn: getGoalsSummary});

export const useMonthlyGoal = () =>
  useQuery({queryKey: ["goals", "monthly"], queryFn: getMonthlyGoal});

export const useWeeklyMilestones = () =>
  useQuery({queryKey: ["goals", "weekly-milestones"], queryFn: getWeeklyMilestones});

export const useRewardsBalance = () =>
  useQuery({queryKey: ["rewards", "balance"], queryFn: getRewardsBalance});

export const useRewardsStats = () =>
  useQuery({queryKey: ["rewards", "stats"], queryFn: getRewardsStats});

export const usePendingRewards = () => {
  const query = useQuery({queryKey: ["rewards", "pending"], queryFn: getPendingRewards});
  return {...query, rewards: query.data ?? []};
};

export const useClaimReward = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({id, source}: {id: string; source: "goal" | "referral" | "leaderboard"}) =>
      claimReward(id, source),
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ["rewards"]});
    },
  });
};
