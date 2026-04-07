import { useCourses } from "../hooks/useCourses";
import { CourseCard } from "./CourseCard";

export const CourseList = ({ renderActions }: { renderActions?: (course: any) => React.ReactNode }) => {
  const { data } = useCourses();

  return (
    <div>
      {data?.map((course: any) => (
        <CourseCard key={course.id} title={course.title}>
          {renderActions?.(course)}
        </CourseCard>
      ))}
    </div>
  );
};