import {useQuery} from "@tanstack/react-query";
import {getExamHistory, getExamResult} from "../services/results.service";

export const useExamHistory = () => {
  const query = useQuery({queryKey: ["exam-history"], queryFn: getExamHistory});
  return {...query, history: query.data ?? []};
};

export const useExamResult = (sessionId: string) =>
  useQuery({
    queryKey: ["exam-result", sessionId],
    queryFn: () => getExamResult(sessionId),
    enabled: !!sessionId,
  });
