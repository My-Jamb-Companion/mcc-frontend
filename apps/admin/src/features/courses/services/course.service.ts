import { coursesMock } from "./course.mock";

export const getCourses = async () => {
  return Promise.resolve(coursesMock);
};

export const createCourse = async (title: string) => {
  return Promise.resolve({
    id: Date.now().toString(),
    title,
    published: false,
  });
};