import { coursesMock } from "./course.mock";

export const getCourses = async () => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(coursesMock), 500);
  });
};

export const enrollCourse = async (_id: string) => {
  return new Promise((resolve) => {
    setTimeout(() => resolve({ success: true }), 300);
  });
};