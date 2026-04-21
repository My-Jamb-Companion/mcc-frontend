import { useQuery } from "@tanstack/react-query";
import { getCourses } from "../services/course.service";
import { Course } from "../types";

export const useCourses = () => {
  return useQuery<Course[]>({
    queryKey: ["courses"],
    queryFn: getCourses,
  });
};