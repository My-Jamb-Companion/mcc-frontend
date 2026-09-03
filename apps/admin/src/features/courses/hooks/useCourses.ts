import { useQuery } from "@tanstack/react-query";
import { getCourse, listCourses } from "../services/course.service";
import {
  fromApiCourseDetail,
  fromApiCourseSummary,
} from "../helper/course.mapper";
import { ListCoursesParams } from "../types/types";

/**
 * Lists courses from the live backend (GET /admin/courses), adapted into
 * CoursesFormValues so consumers don't need to know the API's key names.
 */
export const useCourses = (params?: ListCoursesParams) => {
  const query = useQuery({
    queryKey: ["courses", params],
    queryFn: () =>
      listCourses(params).then((res) => ({
        courses: res.data.map(fromApiCourseSummary),
        meta: res.meta,
      })),
  });

  return {
    ...query,
    courses: query.data?.courses ?? [],
    meta: query.data?.meta,
  };
};

/**
 * Fetches one course's full detail (GET /admin/courses/{course_id}),
 * adapted into CoursesFormValues so it can be dropped straight into
 * methods.reset(...).
 */
export const useCourse = (courseId: string | null | undefined) => {
  return useQuery({
    queryKey: ["course", courseId],
    queryFn: () => getCourse(courseId as string).then((res) => fromApiCourseDetail(res.data)),
    enabled: !!courseId,
    // EditCourse.tsx resets an in-progress wizard from this query's data
    // exactly once (see its loadedCourseIdRef guard) — but a background
    // refetch a user never asked for (e.g. tabbing away to pick a file,
    // then back) has no business happening at all while a course might be
    // mid-edit. Callers that do want a fresh copy (OpenCourse.tsx's
    // publish/unpublish) already call refetch() explicitly.
    refetchOnWindowFocus: false,
  });
};
