import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import {confettiCelebrate, showSuccess} from "@mcc/ui";
import {useGamificationRefresh} from "@/src/features/rewards/hooks/useGamificationRefresh";
import {progressMessage, shouldCelebrate} from "@/src/features/rewards/helper/earnings";
import {
  CourseListFilters,
  completeLecture,
  getCourseProgress,
  enrollCourse,
  getCertificates,
  getCourseContent,
  getCourses,
  getEnrolledCourses,
  initializeCoursePayment,
  submitCourseFeedback,
  updateCourseProgress,
} from "../services/course.service";

/** The public catalogue, GET /courses/ -- optionally filtered by
 * search/category_id/level. Each distinct filter combination is its own
 * query-cache entry, so switching filters triggers a real new request
 * rather than filtering an already-fetched list client-side. */
export const useCourses = (filters: CourseListFilters = {}) => {
  const query = useQuery({
    queryKey: ["courses", filters],
    queryFn: () => getCourses(filters),
  });

  return {...query, courses: query.data ?? []};
};

/** The caller's own active enrollments with progress, GET /courses/enrolled. */
export const useEnrolledCourses = () => {
  const query = useQuery({
    queryKey: ["courses", "enrolled"],
    queryFn: getEnrolledCourses,
  });

  return {...query, courses: query.data ?? []};
};

export const useCourseContent = (courseId: string | null | undefined) => {
  const query = useQuery({
    queryKey: ["courses", courseId, "content"],
    queryFn: () => getCourseContent(courseId as string),
    enabled: !!courseId,
  });

  return {...query, content: query.data ?? []};
};

export const useCertificates = () => {
  const query = useQuery({
    queryKey: ["courses", "certificates"],
    queryFn: getCertificates,
  });

  return {...query, certificates: query.data ?? []};
};

export const useEnrollCourse = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({courseId, courseType}: {courseId: string; courseType: "free" | "paid"}) =>
      enrollCourse(courseId, courseType),
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ["courses", "enrolled"]});
    },
  });
};

export const useInitializeCoursePayment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      courseId,
      courseType,
      email,
      tierId,
    }: {
      courseId: string;
      courseType: "free" | "paid";
      email?: string;
      tierId?: string;
    }) => initializeCoursePayment(courseId, courseType, email, tierId),
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ["courses", "enrolled"]});
    },
  });
};

export const useUpdateCourseProgress = () => {
  const queryClient = useQueryClient();
  const refreshGamification = useGamificationRefresh();

  return useMutation({
    mutationFn: ({courseId, progressPercent}: {courseId: string; progressPercent: number}) =>
      updateCourseProgress(courseId, progressPercent),
    onSuccess: (update) => {
      queryClient.invalidateQueries({queryKey: ["courses", "enrolled"]});
      // A progress push that completes the course issues a certificate
      // server-side -- refetch so it shows up without a reload.
      queryClient.invalidateQueries({queryKey: ["courses", "certificates"]});
      refreshGamification();
      const message = progressMessage(update);
      if (message) showSuccess(message);
      if (update?.certificate_issued || update?.gamification?.daily_goal?.just_achieved) confettiCelebrate();
    },
  });
};

/** The lessons the student has already finished in a course. */
export const useCourseProgress = (courseId: string) =>
  useQuery({queryKey: ["courses", courseId, "progress"], queryFn: () => getCourseProgress(courseId), staleTime: 0});

/** The student finishes a lesson: the server records it, works out progress and pays the points. */
export const useCompleteLecture = () => {
  const queryClient = useQueryClient();
  const refreshGamification = useGamificationRefresh();

  return useMutation({
    mutationFn: ({courseId, lectureId}: {courseId: string; lectureId: string}) => completeLecture(courseId, lectureId),
    onSuccess: (update) => {
      queryClient.invalidateQueries({queryKey: ["courses", "enrolled"]});
      queryClient.invalidateQueries({queryKey: ["courses", "certificates"]});
      refreshGamification();
      const message = progressMessage(update);
      if (message) showSuccess(message);
      if (update.certificate_issued || shouldCelebrate(update.gamification)) confettiCelebrate();
    },
  });
};

export const useSubmitCourseFeedback = () => {
  return useMutation({
    mutationFn: ({courseId, rating, comments}: {courseId: string; rating: number; comments?: string}) =>
      submitCourseFeedback(courseId, rating, comments),
  });
};
