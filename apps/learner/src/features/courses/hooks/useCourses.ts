import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import {
  enrollCourse,
  getCertificates,
  getCourseContent,
  getCourses,
  getEnrolledCourses,
  initializeCoursePayment,
  submitCourseFeedback,
  updateCourseProgress,
} from "../services/course.service";

/** The full public catalogue, GET /courses/. */
export const useCourses = () => {
  const query = useQuery({
    queryKey: ["courses"],
    queryFn: getCourses,
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
    mutationFn: ({courseId, courseType, email}: {courseId: string; courseType: "free" | "paid"; email?: string}) =>
      initializeCoursePayment(courseId, courseType, email),
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ["courses", "enrolled"]});
    },
  });
};

export const useUpdateCourseProgress = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({courseId, progressPercent}: {courseId: string; progressPercent: number}) =>
      updateCourseProgress(courseId, progressPercent),
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ["courses", "enrolled"]});
    },
  });
};

export const useSubmitCourseFeedback = () => {
  return useMutation({
    mutationFn: ({courseId, rating, comments}: {courseId: string; rating: number; comments?: string}) =>
      submitCourseFeedback(courseId, rating, comments),
  });
};
