import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  enrollChildInCourse,
  getCourseCatalogue,
  getProgramCatalogue,
  registerChildForExam,
} from "./payments.service";

// Keyed by childId even though the catalogue itself no longer varies by
// viewer, so each child's enrolment screen still caches independently.
export const useCourseCatalogue = (childId: string) =>
  useQuery({ queryKey: ["courses", "catalogue", childId], queryFn: getCourseCatalogue });

export const useProgramCatalogue = (childId: string) =>
  useQuery({ queryKey: ["exams", "catalogue", childId], queryFn: getProgramCatalogue });

export const useEnrollChildInCourse = (childId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ courseId, price, tierId }: { courseId: string; price: string; tierId?: string }) =>
      enrollChildInCourse(childId, courseId, price, tierId),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["parent", "children", childId] }),
  });
};

export const useRegisterChildForExam = (childId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ programId, tierId }: { programId: string; tierId?: string }) =>
      registerChildForExam(childId, programId, tierId),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["parent", "children", childId] }),
  });
};
