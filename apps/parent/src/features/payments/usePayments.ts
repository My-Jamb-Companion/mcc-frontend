import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  enrollChildInCourse,
  getCourseCatalogue,
  getProgramCatalogue,
  registerChildForExam,
} from "./payments.service";
import type { LiveFormat } from "./formats";

// Keyed by childId even though the catalogue itself no longer varies by
// viewer, so each child's enrolment screen still caches independently.
export const useCourseCatalogue = (childId: string) =>
  useQuery({ queryKey: ["courses", "catalogue", childId], queryFn: getCourseCatalogue });

export const useProgramCatalogue = (childId: string) =>
  useQuery({ queryKey: ["exams", "catalogue", childId], queryFn: getProgramCatalogue });

export const useEnrollChildInCourse = (childId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ courseId, price, tierId, liveFormat }: { courseId: string; price: string; tierId?: string; liveFormat?: LiveFormat }) =>
      enrollChildInCourse(childId, courseId, price, tierId, liveFormat),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["parent", "children", childId] }),
  });
};

export const useRegisterChildForExam = (childId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ programId, tierId, liveFormat }: { programId: string; tierId?: string; liveFormat?: LiveFormat }) =>
      registerChildForExam(childId, programId, tierId, liveFormat),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["parent", "children", childId] }),
  });
};
