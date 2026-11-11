import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import {useGamificationRefresh} from "@/src/features/rewards/hooks/useGamificationRefresh";
import {getModuleQuestions, getQuizGrades, submitModuleAnswers} from "../services/moduleQuiz.service";

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
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (answers: Record<string, string[]>) =>
      submitModuleAnswers(courseId, moduleId, answers),
    // A passed quiz can earn points, a level or a badge.
    onSuccess: (result) => {
      if (result.gamification) refreshGamification();
      // The grade was just kept, so the content list shows it as done.
      queryClient.invalidateQueries({queryKey: ["courses", courseId, "quiz-grades"]});
    },
  });
};

/** The learner's grades on this course's Practice quizzes, Smart Zones and Tests (empty until one is taken). */
export const useQuizGrades = (courseId: string) => {
  const query = useQuery({
    queryKey: ["courses", courseId, "quiz-grades"],
    queryFn: () => getQuizGrades(courseId),
    enabled: !!courseId,
  });
  return {...query, grades: query.data ?? []};
};
