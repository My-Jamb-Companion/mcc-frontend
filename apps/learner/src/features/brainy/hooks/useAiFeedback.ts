import {useMutation, useQueryClient} from "@tanstack/react-query";
import {getAnalysis, getQuestionHelp} from "../services/brainy.service";
import {ALLOWANCE_QUERY_KEY, USAGE_QUERY_KEY} from "./useBrainyChat";

/** Both mutations invalidate the allowance/usage queries on success, same
 * as Brainy.tsx's own chat-send handler does -- these are metered calls
 * too. */
export const useAnalysis = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: getAnalysis,
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: USAGE_QUERY_KEY});
      queryClient.invalidateQueries({queryKey: ALLOWANCE_QUERY_KEY});
    },
  });
};

export const useQuestionHelp = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (questionId: string) => getQuestionHelp(questionId),
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: USAGE_QUERY_KEY});
      queryClient.invalidateQueries({queryKey: ALLOWANCE_QUERY_KEY});
    },
  });
};
