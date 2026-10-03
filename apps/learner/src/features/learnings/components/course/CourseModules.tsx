import {useState} from "react";
import {Icon, motion, AnimatePresence} from "@mcc/ui";
import {useLessonsDuration, useModuleProgress} from "@/src/features/learnings/hooks/useLesson";
import {Lesson, LessonKind, Module, lessonKind} from "@/src/features/learnings/helper/content.mapper";
import {describeDuration} from "@/src/features/learnings/helper/countdown";
import BookmarkButton from "@/src/features/bookmarks/BookmarkButton";
import DownloadButton from "../DownloadButton";

interface CourseModulesProps {
  modules: Module[];
  completedLessonIds: Set<string>;
  onSelectLesson: (lesson: Lesson) => void;
  onSelectQuiz: (moduleId: string) => void;
  onSelectExercise: (moduleId: string, name: string) => void;
  onSelectQuizSet: (moduleId: string, name: string) => void;
  activeLesson?: string | null;
  activeQuizModuleId?: string | null;
  activeExercise?: {moduleId: string; name: string} | null;
  activeQuizSet?: {moduleId: string; name: string} | null;
}

const kindIconMap: Record<LessonKind, {icon: string; className: string}> = {
  video: {icon: "solar:play-circle-bold", className: "text-primary"},
  youtube: {icon: "line-md:youtube", className: "text-red-500"},
  pdf: {icon: "ri:booklet-line", className: "text-primary"},
  html: {icon: "lucide:align-left", className: "text-primary"},
};

export default function CoursePlayModules({
  modules,
  completedLessonIds,
  onSelectLesson,
  onSelectQuiz,
  onSelectExercise,
  onSelectQuizSet,
  activeLesson = null,
  activeQuizModuleId = null,
  activeExercise = null,
  activeQuizSet = null,
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
            activeQuizModuleId={activeQuizModuleId}
            activeExercise={activeExercise}
            activeQuizSet={activeQuizSet}
            onSelectLesson={onSelectLesson}
            onSelectQuiz={onSelectQuiz}
            onSelectExercise={onSelectExercise}
            onSelectQuizSet={onSelectQuizSet}
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
  activeQuizModuleId,
  activeExercise,
  activeQuizSet,
  onSelectLesson,
  onSelectQuiz,
  onSelectExercise,
  onSelectQuizSet,
}: {
  module: Module;
  completedLessonIds: Set<string>;
  activeLesson: string | null;
  activeQuizModuleId: string | null;
  activeExercise: {moduleId: string; name: string} | null;
  activeQuizSet: {moduleId: string; name: string} | null;
  onSelectLesson: (lesson: Lesson) => void;
  onSelectQuiz: (moduleId: string) => void;
  onSelectExercise: (moduleId: string, name: string) => void;
  onSelectQuizSet: (moduleId: string, name: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const hasLessons = !!module.lessons.length;
  const moduleDuration = useLessonsDuration(module.lessons);
  const moduleProgress = useModuleProgress(module.lessons, completedLessonIds);
  const isCompleted = hasLessons && moduleProgress === 100;
  const isQuizActive = activeQuizModuleId === module.id;

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
              isCompleted
                ? "bg-primary text-white"
                : "border border-muted/20 text-transparent"
            }`}
          >
            <Icon icon="ci:check" size={16} />
          </div>
          <span className="text-sm font-medium truncate">{module.title}</span>
        </div>

        <div className="flex items-center gap-2">
          {hasLessons && <p className="text-subtle text-xs text-nowrap">{moduleDuration.formatted}</p>}
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
              {module.lessons.map((lesson, i) => {
                const isActive = activeLesson === lesson.id;
                const iconConfig = kindIconMap[lessonKind(lesson)];

                return (
                  <div key={lesson.id} className="flex items-center gap-1 pr-1">
                    <motion.button
                      type="button"
                      initial={{opacity: 0, x: -8}}
                      animate={{opacity: 1, x: 0}}
                      transition={{delay: i * 0.04, duration: 0.2}}
                      onClick={() => onSelectLesson(lesson)}
                      className={`flex gap-2.5 flex-1 min-w-0 pl-1 pr-3.5 text-left hover:bg-muted/5 transition-colors ${
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
                    <DownloadButton url={lesson.videoUrl} filename={lesson.title} />
                    <BookmarkButton contentType="course_lecture" contentId={lesson.id} />
                  </div>
                );
              })}

              <motion.button
                type="button"
                initial={{opacity: 0, x: -8}}
                animate={{opacity: 1, x: 0}}
                transition={{delay: module.lessons.length * 0.04, duration: 0.2}}
                onClick={() => onSelectQuiz(module.id)}
                className={`flex gap-2.5 w-full pl-1 pr-3.5 text-left hover:bg-muted/5 transition-colors ${
                  isQuizActive ? "border-l-primary border-l-3" : "border-l-0"
                }`}
              >
                <div className="flex items-center justify-center size-5.5 rounded shrink-0 text-[13px] text-orange-500">
                  <Icon icon="material-symbols:quiz-outline" size={16} />
                </div>
                <div className="min-w-0">
                  <p className={`text-sm truncate ${isQuizActive ? "text-primary" : "text-subtle"}`}>
                    Practice quiz
                  </p>
                </div>
              </motion.button>

              {module.quizSets.map((set, i) => {
                const isActive = activeQuizSet?.moduleId === module.id && activeQuizSet.name === set.name;
                const meta = [
                  `${set.count} ${set.count === 1 ? "question" : "questions"}`,
                  set.timerMinutes ? describeDuration(set.timerMinutes) : null,
                  set.passingScore !== null ? `pass ${set.passingScore}%` : null,
                ].filter(Boolean);
                return (
                  <motion.button
                    key={`quiz-${set.name}`}
                    type="button"
                    initial={{opacity: 0, x: -8}}
                    animate={{opacity: 1, x: 0}}
                    transition={{delay: (module.lessons.length + 1 + i) * 0.04, duration: 0.2}}
                    onClick={() => onSelectQuizSet(module.id, set.name)}
                    className={`flex gap-2.5 w-full pl-1 pr-3.5 text-left hover:bg-muted/5 transition-colors ${
                      isActive ? "border-l-primary border-l-3" : "border-l-0"
                    }`}
                  >
                    <div className="flex items-center justify-center size-5.5 rounded shrink-0 text-[13px] text-green-600">
                      <Icon icon="mdi:certificate-outline" size={16} />
                    </div>
                    <div className="min-w-0">
                      <p className={`text-sm truncate ${isActive ? "text-primary" : "text-subtle"}`}>Quiz: {set.name}</p>
                      <p className="text-sm mt-0.5 text-muted">{meta.join(" · ")}</p>
                    </div>
                  </motion.button>
                );
              })}

              {module.exerciseSets.map((set, i) => {
                const isActive = activeExercise?.moduleId === module.id && activeExercise.name === set.name;
                return (
                  <motion.button
                    key={set.name}
                    type="button"
                    initial={{opacity: 0, x: -8}}
                    animate={{opacity: 1, x: 0}}
                    transition={{delay: (module.lessons.length + 1 + i) * 0.04, duration: 0.2}}
                    onClick={() => onSelectExercise(module.id, set.name)}
                    className={`flex gap-2.5 w-full pl-1 pr-3.5 text-left hover:bg-muted/5 transition-colors ${
                      isActive ? "border-l-primary border-l-3" : "border-l-0"
                    }`}
                  >
                    <div className="flex items-center justify-center size-5.5 rounded shrink-0 text-[13px] text-blue-500">
                      <Icon icon="ph:pencil-simple-line" size={16} />
                    </div>
                    <div className="min-w-0">
                      <p className={`text-sm truncate ${isActive ? "text-primary" : "text-subtle"}`}>
                        Exercise: {set.name}
                      </p>
                      <p className="text-sm mt-0.5 text-muted">
                        {set.count} {set.count === 1 ? "question" : "questions"}
                      </p>
                    </div>
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
