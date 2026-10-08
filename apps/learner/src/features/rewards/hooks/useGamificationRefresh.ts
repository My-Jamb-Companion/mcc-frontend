import {useCallback} from "react";
import {useQueryClient} from "@tanstack/react-query";

/**
 * After anything that can earn something (a quiz, a lesson, a course), refetch the numbers the
 * student sees: points and gems, goals and streak, the leaderboard, pending rewards. Without it
 * they stay stale until the page is reloaded.
 */
export const useGamificationRefresh = () => {
  const queryClient = useQueryClient();
  return useCallback(() => {
    for (const key of ["rewards", "goals", "leaderboard", "gamification"]) {
      queryClient.invalidateQueries({queryKey: [key]});
    }
  }, [queryClient]);
};
