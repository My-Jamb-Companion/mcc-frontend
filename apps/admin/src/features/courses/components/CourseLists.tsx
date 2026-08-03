import {CourseListRow, CourseListRowData} from "./CoursesRow";
import {NoCourses} from "./EmptyCourses";

interface CourseListProps {
  course: CourseListRowData[];
  onShareLink?: (id: string) => void;
  onOpen?: (course: CourseListRowData) => void;
  onEditCourse?: (id: string) => void;
  onPublishCourse?: (id: string) => void;
  onMessageTeacher?: (id: string) => void;
  onViewParentCourse?: (id: string) => void;
  onDeleteCourse?: (id: string) => void;
}

export function CourseList({
  course,
  onShareLink,
  onOpen,
  onEditCourse,
  onPublishCourse,
  onMessageTeacher,
  onViewParentCourse,
  onDeleteCourse,
}: CourseListProps) {
  if (course.length === 0) {
    return <NoCourses />;
  }

  return (
    <div className="flex flex-col w-full h-full gap-4">
      {course.map((item) => (
        <CourseListRow
          key={item.id}
          course={item}
          onShareLink={() => onShareLink?.(item.id)}
          onOpen={() => onOpen?.(item)}
          menuHandlers={{
            onOpenCourse: () => onOpen?.(item),
            onEditCourse: () => onEditCourse?.(item.id),
            onPublishCourse: () => onPublishCourse?.(item.id),
            onMessageTeacher: () => onMessageTeacher?.(item.id),
            onViewParentCourse: () => onViewParentCourse?.(item.id),
            onDeleteCourse: () => onDeleteCourse?.(item.id),
          }}
        />
      ))}
    </div>
  );
}
