import {useState} from "react";
import {Icon, motion, AnimatePresence} from "@mcc/ui";
import {useLessonsDuration, useModuleProgress} from "@/src/features/learnings/hooks/useLesson";
import {Lesson, LessonKind, Module, lessonKind} from "@/src/features/learnings/helper/content.mapper";

interface CourseModulesProps {
  modules: Module[];
  completedLessonIds: Set<string>;
  onSelectLesson: (lesson: Lesson) => void;
  activeLesson?: string | null;
}

const kindIconMap: Record<LessonKind, {icon: string; className: string}> = {
  video: {icon: "solar:play-circle-bold", className: "text-primary"},
  youtube: {icon: "line-md:youtube", className: "text-red-500"},
  pdf: {icon: "ri:booklet-line", className: "text-primary"},
};

export default function CoursePlayModules({
  modules,
  completedLessonIds,
  onSelectLesson,
  activeLesson = null,
}: CourseModulesProps) {
  return (
    <div className="flex flex-col gap-3">
      {modules.map((module, index) => (
        <motion.div
          key={module.id}
          initial={{opacity: 0, y: 12}}
          animate={{opacity: 1, y: 0}}
          transition={{delay: index * 0.08, duration: 0.3}}
        >
          <ModuleAccordion
            module={module}
            completedLessonIds={completedLessonIds}
            activeLesson={activeLesson}
            onSelectLesson={onSelectLesson}
          />
        </motion.div>
      ))}
    </div>
  );
}

function ModuleAccordion({
  module,
  completedLessonIds,
  activeLesson,
  onSelectLesson,
}: {
  module: Module;
  completedLessonIds: Set<string>;
  activeLesson: string | null;
  onSelectLesson: (lesson: Lesson) => void;
}) {
  const [open, setOpen] = useState(false);
  const hasLessons = !!module.lessons.length;
  const moduleDuration = useLessonsDuration(module.lessons);
  const moduleProgress = useModuleProgress(module.lessons, completedLessonIds);
  const isCompleted = moduleProgress === 100;

  return (
    <div>
      <button
        type="button"
        onClick={() => hasLessons && setOpen((o) => !o)}
        className="border border-muted/20 rounded-2xl flex items-center justify-between w-full px-3.5 py-5.5 hover:bg-muted/5 transition-colors text-left gap-2"
      >
        <div className="flex items-center gap-2 min-w-0">
          <div
            className={`rounded-md h-4 w-4 flex items-center justify-center shrink-0 ${
              isCompleted
                ? "bg-primary text-white"
                : "border border-muted/20 text-transparent"
            }`}
          >
            <Icon icon="ci:check" size={16} />
          </div>
          <span className="text-sm font-medium truncate">{module.title}</span>
        </div>

        {hasLessons && (
          <div className="flex items-center gap-2">
            <p className="text-subtle text-xs text-nowrap">{moduleDuration.formatted}</p>
            <Icon
              icon="ph:caret-down"
              size={14}
              className={`text-subtle shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
            />
          </div>
        )}
      </button>

      <AnimatePresence initial={false}>
        {hasLessons && open && (
          <motion.div
            key="lessons"
            initial={{height: 0, opacity: 0}}
            animate={{height: "auto", opacity: 1}}
            exit={{height: 0, opacity: 0}}
            transition={{duration: 0.25, ease: "easeInOut"}}
            className="overflow-hidden"
          >
            <div className="pl-4 pt-6 pb-4 flex flex-col gap-4">
              {module.lessons.map((lesson, i) => {
                const isActive = activeLesson === lesson.id;
                const iconConfig = kindIconMap[lessonKind(lesson)];

                return (
                  <motion.button
                    key={lesson.id}
                    type="button"
                    initial={{opacity: 0, x: -8}}
                    animate={{opacity: 1, x: 0}}
                    transition={{delay: i * 0.04, duration: 0.2}}
                    onClick={() => onSelectLesson(lesson)}
                    className={`flex gap-2.5 w-full pl-1 pr-3.5 text-left hover:bg-muted/5 transition-colors ${
                      isActive ? "border-l-primary border-l-3" : "border-l-0"
                    }`}
                  >
                    <div
                      className={`flex items-center justify-center size-5.5 rounded shrink-0 text-[13px] ${iconConfig.className}`}
                    >
                      <Icon icon={iconConfig.icon} size={16} />
                    </div>
                    <div className="min-w-0">
                      <p
                        className={`text-sm truncate ${isActive ? "text-primary" : "text-subtle"}`}
                      >
                        {lesson.title}
                      </p>
                      {!!lesson.duration && (
                        <p className="text-sm mt-0.5 text-muted">
                          {Math.ceil(lesson.duration / 60)} min
                        </p>
                      )}
                    </div>
                    {completedLessonIds.has(lesson.id) && (
                      <Icon
                        icon="ci:check"
                        size={16}
                        className="ml-auto shrink-0 text-primary"
                      />
                    )}
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
