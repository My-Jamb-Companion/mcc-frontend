import { CourseList as BaseCourseList } from "@mcc/features";
import { EnrollButton } from "./EnrollButton";

export const CourseList = () => {
  const handleEnroll = (_id: string) => {
  };

  return (
    <BaseCourseList
      renderActions={(course) => (
        <EnrollButton onClick={() => handleEnroll(course.id)} />
      )}
    />
  );
};