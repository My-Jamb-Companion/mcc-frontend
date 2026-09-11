import {useQuery} from "@tanstack/react-query";
import {getLeaderboard, getPlatformOverview, getUserGrowth} from "../services/dashboard.service";

export const usePlatformOverview = () =>
  useQuery({queryKey: ["dashboard", "overview"], queryFn: getPlatformOverview});

export const useUserGrowth = () =>
  useQuery({queryKey: ["dashboard", "user-growth"], queryFn: getUserGrowth});

export const useLeaderboard = () =>
  useQuery({queryKey: ["dashboard", "leaderboard"], queryFn: getLeaderboard});
