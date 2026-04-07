import { useQuery, useMutation } from "@tanstack/react-query";
import { getCourses, createCourse } from "../services/course.service";

export const useCourses = () => {
  const query = useQuery({
    queryKey: ["courses"],
    queryFn: getCourses,
  });

  const mutation = useMutation({
    mutationFn: createCourse,
  });

  return {
    ...query,
    createCourse: mutation.mutate,
  };
};