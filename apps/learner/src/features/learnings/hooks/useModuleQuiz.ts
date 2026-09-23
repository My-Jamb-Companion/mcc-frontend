import {useMutation, useQuery} from "@tanstack/react-query";
import {getModuleQuestions, submitModuleAnswers} from "../services/moduleQuiz.service";

export const useModuleQuestions = (courseId: string, moduleId: string | null) => {
  const query = useQuery({
    queryKey: ["courses", courseId, "modules", moduleId, "questions"],
    queryFn: () => getModuleQuestions(courseId, moduleId as string),
    enabled: !!moduleId,
  });
  return {...query, questions: query.data ?? []};
};

export const useSubmitModuleAnswers = (courseId: string, moduleId: string) =>
  useMutation({
    mutationFn: (answers: Record<string, string[]>) =>
      submitModuleAnswers(courseId, moduleId, answers),
  });
