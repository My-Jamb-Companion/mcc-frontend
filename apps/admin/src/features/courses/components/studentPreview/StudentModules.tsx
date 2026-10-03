"use client";

import {useState} from "react";
import {AnimatePresence, Icon, motion} from "@mcc/ui";
import {
  formatTotalDuration,
  StudentLessonKind,
  StudentModule,
} from "@/src/features/courses/helper/studentView";

const kindIcon: Record<StudentLessonKind, {icon: string; className: string}> = {
  video: {icon: "solar:play-circle-bold", className: "text-primary"},
  youtube: {icon: "line-md:youtube", className: "text-red-500"},
  pdf: {icon: "ri:booklet-line", className: "text-primary"},
  html: {icon: "lucide:align-left", className: "text-primary"},
};

/**
 * The student's course-content list: a flat list of modules, each opening to
 * its lessons and a single "Practice quiz". A port of the learner app's
 * CourseModules; the per-lesson download / bookmark icons are shown but inert.
 */
export default function StudentModules({
  modules,
  completedLessonIds,
  activeLessonId,
  activeQuizModuleId,
  activeExercise,
  onSelectLesson,
  onSelectQuiz,
  onSelectExercise,
}: {
  modules: StudentModule[];
  completedLessonIds: Set<string>;
  activeLessonId: string | null;
  activeQuizModuleId: string | null;
  activeExercise: {moduleId: string; name: string} | null;
  onSelectLesson: (moduleId: string, lessonId: string) => void;
  onSelectQuiz: (moduleId: string) => void;
  onSelectExercise: (moduleId: string, name: string) => void;
}) {
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
            activeLessonId={activeLessonId}
            activeQuizModuleId={activeQuizModuleId}
            activeExercise={activeExercise}
            onSelectLesson={onSelectLesson}
            onSelectQuiz={onSelectQuiz}
            onSelectExercise={onSelectExercise}
          />
        </motion.div>
      ))}
    </div>
  );
}

function ModuleAccordion({
  module,
  completedLessonIds,
  activeLessonId,
  activeQuizModuleId,
  activeExercise,
  onSelectLesson,
  onSelectQuiz,
  onSelectExercise,
}: {
  module: StudentModule;
  completedLessonIds: Set<string>;
  activeLessonId: string | null;
  activeQuizModuleId: string | null;
  activeExercise: {moduleId: string; name: string} | null;
  onSelectLesson: (moduleId: string, lessonId: string) => void;
  onSelectQuiz: (moduleId: string) => void;
  onSelectExercise: (moduleId: string, name: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const hasLessons = module.lessons.length > 0;
  const isCompleted = hasLessons && module.lessons.every((l) => completedLessonIds.has(l.id));
  const isQuizActive = activeQuizModuleId === module.id;
  const seconds = module.lessons.reduce((sum, l) => sum + l.durationSeconds, 0);

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="border border-muted/20 rounded-2xl flex items-center justify-between w-full px-3.5 py-5.5 hover:bg-muted/5 transition-colors text-left gap-2"
      >
        <div className="flex items-center gap-2 min-w-0">
          <div
            className={`rounded-md h-4 w-4 flex items-center justify-center shrink-0 ${
              isCompleted ? "bg-primary text-white" : "border border-muted/20 text-transparent"
            }`}
          >
            <Icon icon="ci:check" size={16} />
          </div>
          <span className="text-sm font-medium truncate">{module.title}</span>
        </div>

        <div className="flex items-center gap-2">
          {hasLessons && <p className="text-subtle text-xs text-nowrap">{formatTotalDuration(seconds)}</p>}
          <Icon
            icon="ph:caret-down"
            size={14}
            className={`text-subtle shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          />
        </div>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="lessons"
            initial={{height: 0, opacity: 0}}
            animate={{height: "auto", opacity: 1}}
            exit={{height: 0, opacity: 0}}
            transition={{duration: 0.25, ease: "easeInOut"}}
            className="overflow-hidden"
          >
            <div className="pl-4 pt-6 pb-4 flex flex-col gap-4">
              {module.lessons.map((lesson) => {
                const isActive = activeLessonId === lesson.id;
                const icon = kindIcon[lesson.kind];
                return (
                  <div key={lesson.id} className="flex items-center gap-1 pr-1">
                    <button
                      type="button"
                      onClick={() => onSelectLesson(module.id, lesson.id)}
                      className={`flex gap-2.5 flex-1 min-w-0 pl-1 pr-3.5 text-left hover:bg-muted/5 transition-colors ${
                        isActive ? "border-l-primary border-l-3" : "border-l-0"
                      }`}
                    >
                      <div className={`flex items-center justify-center size-5.5 rounded shrink-0 text-[13px] ${icon.className}`}>
                        <Icon icon={icon.icon} size={16} />
                      </div>
                      <div className="min-w-0">
                        <p className={`text-sm truncate ${isActive ? "text-primary" : "text-subtle"}`}>{lesson.title}</p>
                        {!!lesson.durationSeconds && (
                          <p className="text-sm mt-0.5 text-muted">{Math.ceil(lesson.durationSeconds / 60)} min</p>
                        )}
                      </div>
                      {completedLessonIds.has(lesson.id) && (
                        <Icon icon="ci:check" size={16} className="ml-auto shrink-0 text-primary" />
                      )}
                    </button>
                    {lesson.url && lesson.kind !== "youtube" && (
                      <Icon icon="solar:download-minimalistic-linear" size={16} className="shrink-0 text-subtle" />
                    )}
                    <Icon icon="solar:bookmark-linear" size={16} className="shrink-0 text-subtle" />
                  </div>
                );
              })}

              <button
                type="button"
                onClick={() => onSelectQuiz(module.id)}
                className={`flex gap-2.5 w-full pl-1 pr-3.5 text-left hover:bg-muted/5 transition-colors ${
                  isQuizActive ? "border-l-primary border-l-3" : "border-l-0"
                }`}
              >
                <div className="flex items-center justify-center size-5.5 rounded shrink-0 text-[13px] text-orange-500">
                  <Icon icon="material-symbols:quiz-outline" size={16} />
                </div>
                <p className={`text-sm truncate ${isQuizActive ? "text-primary" : "text-subtle"}`}>Practice quiz</p>
              </button>

              {module.exerciseSets.map((set) => {
                const isActive = activeExercise?.moduleId === module.id && activeExercise.name === set.name;
                return (
                  <button
                    key={set.name}
                    type="button"
                    onClick={() => onSelectExercise(module.id, set.name)}
                    className={`flex gap-2.5 w-full pl-1 pr-3.5 text-left hover:bg-muted/5 transition-colors ${
                      isActive ? "border-l-primary border-l-3" : "border-l-0"
                    }`}
                  >
                    <div className="flex items-center justify-center size-5.5 rounded shrink-0 text-[13px] text-blue-500">
                      <Icon icon="ph:pencil-simple-line" size={16} />
                    </div>
                    <p className={`text-sm truncate ${isActive ? "text-primary" : "text-subtle"}`}>
                      Exercise: {set.name}
                    </p>
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
