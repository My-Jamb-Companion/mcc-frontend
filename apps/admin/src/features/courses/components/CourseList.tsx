import { CreateCourseButton } from "./CreateCourseButton";
import { CourseList as BaseCourseList } from "@mcc/features/courses";

export const CourseList = () => {

  return (
    <div>
      <CreateCourseButton onClick={() => console.log("create")} />

      <BaseCourseList
        renderActions={(course) => (
          <button onClick={() => console.log("edit", course.id)}>
            Edit
          </button>
        )}
      />
    </div>
  );
};