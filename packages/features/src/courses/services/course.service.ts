import { Course } from "../types";
import { coursesMock } from "./courses.mock";

export const getCourses = async (): Promise<Course[]> => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(coursesMock), 500);
  });
};