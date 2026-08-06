import {Icon} from "@mcc/ui";
import {SubLessonNode} from "@/src/features/constants/demoExams";

type ClassroomPlayerSidebarProps = {
  unitName: string;
  unitSubject: string;
  lessons: SubLessonNode[];
  activeLessonId: string | null;
  setActiveLessonId: (id: string) => void;

  openTopics: string[];
  setOpenTopics: React.Dispatch<React.SetStateAction<string[]>>;

  canGoPrevious: boolean;
  canGoNext: boolean;

  goPrevious: () => void;
  goNext: () => void;

  activeTitle?: string;
  activeTopicTitle?: string;

  activeIndex: number;
};

export function ClassroomPlayerSidebar({
  unitName,
  unitSubject,
  lessons,
  activeLessonId,
  setActiveLessonId,
  openTopics,
  setOpenTopics,
  canGoPrevious,
  canGoNext,
  goPrevious,
  goNext,
  activeTitle,
  activeTopicTitle,
  activeIndex,
}: ClassroomPlayerSidebarProps) {
  const toggleTopic = (topicId: string) => {
    setOpenTopics((previous) =>
      previous.includes(topicId)
        ? previous.filter((id) => id !== topicId)
        : [...previous, topicId],
    );
  };

  return (
    <aside className="relative flex h-full flex-col border-r border-gray-200">
      {/* Header */}
      <div className="px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-sky-500">
            <Icon
              icon="mdi:book-open-page-variant"
              className="text-white"
              size={16}
            />
          </div>

          <span className="truncate text-[15px] font-medium text-gray-900">
            {unitName}
          </span>
        </div>
      </div>

      {/* Breadcrumb */}
      <div className="flex items-start">
        <button
          disabled={!canGoPrevious}
          onClick={goPrevious}
          className={`p-1 ${
            canGoPrevious
              ? "text-gray-500 hover:text-gray-700"
              : "cursor-not-allowed text-gray-300"
          }`}
        >
          <Icon icon="mdi:chevron-left" size={20} />
        </button>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <span>{unitSubject}</span>
            <Icon icon="mdi:chevron-right" size={12} />
            <span>Classroom</span>
          </div>

          {activeTopicTitle && (
            <p className="mt-2 truncate text-xs text-gray-500">
              Unit {activeIndex + 1}: {activeTopicTitle}
            </p>
          )}

          <p className="truncate text-[13px] font-medium text-gray-900">
            Lesson {activeIndex + 1}: {activeTitle ?? "Select a lesson"}
          </p>
        </div>

        <button
          disabled={!canGoNext}
          onClick={goNext}
          className={`p-1 ${
            canGoNext
              ? "text-gray-500 hover:text-gray-700"
              : "cursor-not-allowed text-gray-300"
          }`}
        >
          <Icon icon="mdi:chevron-right" size={20} />
        </button>
      </div>

      {/* Lessons */}
      <div className="flex-1 overflow-y-auto pt-5">
        {lessons.map((lesson) => {
          if (lesson.type === "topic") {
            const open = openTopics.includes(lesson.id);

            const topicActive = lesson.learnItems?.some(
              (item) => item.id === activeLessonId,
            );

            return (
              <div
                key={lesson.id}
                className="border-b border-muted/30 first:border-t"
              >
                <button
                  onClick={() => toggleTopic(lesson.id)}
                  className={`flex w-full items-center justify-between px-4 py-3 ${
                    topicActive ? "bg-violet-50" : "hover:bg-gray-50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon icon="mdi:folder-outline" size={16} />

                    <span className="text-sm font-medium">{lesson.title}</span>
                  </div>

                  <Icon
                    icon={open ? "mdi:chevron-down" : "mdi:chevron-right"}
                    size={18}
                  />
                </button>

                {open &&
                  lesson.learnItems?.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setActiveLessonId(item.id)}
                      className={`relative flex h-11 w-full items-center gap-3 pl-10 pr-4 ${
                        activeLessonId === item.id
                          ? "bg-violet-50 text-violet-700"
                          : "hover:bg-gray-50"
                      }`}
                    >
                      {activeLessonId === item.id && (
                        <div className="absolute left-0 top-0 h-full w-1 bg-violet-600" />
                      )}

                      <Icon icon="mdi:play-circle-outline" size={16} />

                      <span className="truncate text-sm">{item.title}</span>
                    </button>
                  ))}
              </div>
            );
          }

          return (
            <button
              key={lesson.id}
              onClick={() => setActiveLessonId(lesson.id)}
              className={`relative flex w-full items-center gap-3 border-b border-muted/30 px-4 py-3 ${
                activeLessonId === lesson.id
                  ? "bg-violet-50"
                  : "hover:bg-gray-50"
              }`}
            >
              <Icon
                icon={
                  lesson.type === "quiz" || lesson.type === "test"
                    ? "tdesign:pen-ball"
                    : "mdi:play-circle-outline"
                }
                size={15}
              />

              <span className="truncate text-sm">{lesson.title}</span>
            </button>
          );
        })}
      </div>
    </aside>
  );
}
