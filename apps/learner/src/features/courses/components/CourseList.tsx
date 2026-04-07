import { CourseList as BaseCourseList } from "@mcc/features/courses";
import { EnrollButton } from "./EnrollButton";

export const CourseList = () => {
  const handleEnroll = (id: string) => {
    console.log("Enroll", id);
  };

  return (
    <BaseCourseList
      renderActions={(course) => (
        <EnrollButton onClick={() => handleEnroll(course.id)} />
      )}
    />
  );
};