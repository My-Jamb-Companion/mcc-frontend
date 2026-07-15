import {Icon} from "@iconify/react";
import {SubLessonNode} from "@/src/features/constants/demoExams";

export function ClassroomPlayerSidebar({
  unitName,
  unitSubject,
  lessons,
  activeLessonId,
  setActiveLessonId,
}: {
  unitName: string;
  unitSubject: string;
  lessons: SubLessonNode[];
  activeLessonId: string | null;
  setActiveLessonId: (lessonId: string) => void;
}) {
  const activeIndex = lessons.findIndex(
    (lesson) => lesson.id === activeLessonId,
  );

  const activeLesson = lessons[activeIndex];

  const canGoPrevious = activeIndex > 0;
  const canGoNext = activeIndex !== -1 && activeIndex < lessons.length - 1;

  return (
    <aside className="flex h-full flex-col border-r border-gray-200">
      {/* Header */}
      <div className="px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-sky-500">
            <Icon
              icon="mdi:book-open-page-variant"
              className="text-white"
              width={16}
            />
          </div>

          <span className="min-w-0 truncate text-[15px] font-medium text-gray-900">
            {unitName}
          </span>
        </div>
      </div>

      {/* Breadcrumb */}
      <div className="flex items-start ">
        <button
          disabled={!canGoPrevious}
          onClick={() => {
            if (canGoPrevious) {
              setActiveLessonId(lessons[activeIndex - 1].id);
            }
          }}
          className={`p-1 hover:text-gray-700 ${
            lessons.findIndex((lesson) => lesson.id === activeLessonId) === 0
              ? "text-gray-300 cursor-not-allowed"
              : "text-gray-500 cursor-pointer"
          }`}
        >
          <Icon icon="mdi:chevron-left" width={20} />
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <span>{unitSubject}</span>
            <Icon icon="mdi:chevron-right" width={12} />
            <span>Classroom</span>
          </div>

          <p className="mt-2 truncate text-[13px] font-medium text-gray-900">
            {activeLesson
              ? `Lesson ${activeIndex + 1}: ${activeLesson.title}`
              : "Select a lesson"}
          </p>
        </div>

        <button
          disabled={!canGoNext}
          onClick={() => {
            if (canGoNext) {
              setActiveLessonId(lessons[activeIndex + 1].id);
            }
          }}
          className={`p-1 hover:text-gray-700 ${
            activeIndex === lessons.length - 1
              ? "text-gray-300 cursor-not-allowed"
              : "text-gray-500 cursor-pointer"
          }`}
        >
          <Icon icon="mdi:chevron-right" width={20} />
        </button>
      </div>

      {/* Lessons */}
      <div className="flex-1 overflow-y-auto pt-5">
        {lessons && lessons.length > 0 ? (
          lessons.map((lesson) => (
            <button
              key={lesson.id}
              onClick={() => {
                setActiveLessonId(lesson.id);
              }}
              className={`relative flex h-14 w-full items-center gap-3 border-b border-gray-100 px-4 text-left transition-colors ${
                activeLessonId === lesson.id
                  ? "bg-violet-50"
                  : "hover:bg-gray-50"
              }`}
            >
              {activeLessonId === lesson.id && (
                <div className="absolute left-0 top-0 h-full w-1 rounded-r bg-violet-600" />
              )}

              <div className="flex h-5 w-5 items-center justify-center rounded border border-gray-300 bg-white">
                <Icon
                  icon="mdi:play"
                  width={14}
                  className="ml-[1px] text-gray-500"
                />
              </div>

              <span className="truncate text-sm text-gray-800">
                {lesson.title}
              </span>
            </button>
          ))
        ) : (
          <div className="flex flex-1 items-center justify-center text-sm text-gray-500">
            No lesson available
          </div>
        )}
      </div>
    </aside>
  );
}
