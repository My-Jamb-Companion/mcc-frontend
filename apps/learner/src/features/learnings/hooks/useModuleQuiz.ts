import {useMutation, useQuery} from "@tanstack/react-query";
import {useGamificationRefresh} from "@/src/features/rewards/hooks/useGamificationRefresh";
import {getModuleQuestions, submitModuleAnswers} from "../services/moduleQuiz.service";

export const useModuleQuestions = (
  courseId: string,
  moduleId: string | null,
  set?: {exercise?: string; quiz?: string},
) => {
  const query = useQuery({
    queryKey: ["courses", courseId, "modules", moduleId, "questions", set?.exercise ?? null, set?.quiz ?? null],
    queryFn: () => getModuleQuestions(courseId, moduleId as string, set),
    enabled: !!moduleId,
  });
  return {...query, questions: query.data ?? []};
};

export const useSubmitModuleAnswers = (courseId: string, moduleId: string) => {
  const refreshGamification = useGamificationRefresh();
  return useMutation({
    mutationFn: (answers: Record<string, string[]>) =>
      submitModuleAnswers(courseId, moduleId, answers),
    // A passed quiz can earn points, a level or a badge.
    onSuccess: (result) => {
      if (result.gamification) refreshGamification();
    },
  });
};
