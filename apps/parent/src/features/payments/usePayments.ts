import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  enrollChildInCourse,
  getCourseCatalogue,
  getProgramCatalogue,
  registerChildForExam,
} from "./payments.service";

export const useCourseCatalogue = () =>
  useQuery({ queryKey: ["courses", "catalogue"], queryFn: getCourseCatalogue });

export const useProgramCatalogue = () =>
  useQuery({ queryKey: ["exams", "catalogue"], queryFn: getProgramCatalogue });

export const useEnrollChildInCourse = (childId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ courseId, price }: { courseId: string; price: string }) =>
      enrollChildInCourse(childId, courseId, price),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["parent", "children", childId] }),
  });
};

export const useRegisterChildForExam = (childId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (programId: string) => registerChildForExam(childId, programId),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["parent", "children", childId] }),
  });
};
