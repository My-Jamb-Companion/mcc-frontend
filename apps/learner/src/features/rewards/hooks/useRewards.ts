import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import {
  claimReward,
  getGoalsSummary,
  getLeaderboard,
  getMonthlyGoal,
  getMyLeaderboardStanding,
  getPendingRewards,
  getRewardsBalance,
  getRewardsStats,
  getWeeklyMilestones,
} from "../services/rewards.service";

export const useLeaderboard = () => {
  const query = useQuery({queryKey: ["leaderboard"], queryFn: getLeaderboard});
  return {...query, entries: query.data ?? []};
};

export const useMyLeaderboardStanding = () =>
  useQuery({queryKey: ["leaderboard", "me"], queryFn: getMyLeaderboardStanding});

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
