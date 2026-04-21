import { useCourses } from "../hooks/useCourses";
import { Course } from "../types";
import { CourseCard } from "./CourseCard";

export const CourseList = ({ renderActions }: { renderActions?: (course: Course) => React.ReactNode }) => {
  const { data } = useCourses();

  return (
    <div>
      {data?.map((course) => (
        <CourseCard key={course.id} title={course.title}>
          {renderActions?.(course)}
        </CourseCard>
      ))}
    </div>
  );
};