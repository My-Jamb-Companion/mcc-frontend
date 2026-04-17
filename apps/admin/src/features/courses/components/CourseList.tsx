import { CreateCourseButton } from "./CreateCourseButton";
import { CourseList as BaseCourseList } from "@mcc/features/courses";

export const CourseList = () => {

  const handleCreate = () => {
  // TODO: implement create course
};

const handleEdit = (_id: string) => {
  // TODO: implement edit
};

  return (
    <div>
      <CreateCourseButton onClick={handleCreate} />

      <BaseCourseList
        renderActions={(course) => (
          <button onClick={() => handleEdit(course.id)}>
            Edit
          </button>
        )}
      />
    </div>
  );
};