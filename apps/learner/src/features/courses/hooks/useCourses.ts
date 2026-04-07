import { useQuery, useMutation } from "@tanstack/react-query";
import { getCourses, enrollCourse } from "../services/course.service";

export const useCourses = () => {
  const coursesQuery = useQuery({
    queryKey: ["courses"],
    queryFn: getCourses,
  });

  const enrollMutation = useMutation({
    mutationFn: enrollCourse,
  });

  return {
    ...coursesQuery,
    enrollCourse: enrollMutation.mutate,
  };
};