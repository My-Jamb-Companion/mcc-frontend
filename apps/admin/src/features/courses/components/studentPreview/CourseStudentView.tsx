"use client";

import {useEffect, useMemo, useState} from "react";
import {AnimatePresence, Button, Icon, motion} from "@mcc/ui";
import type {AdditionalCourseTypes, CoursesFormValues} from "@/src/features/courses/types/types";
import {youTubeEmbedUrl} from "@/src/features/courses/helper/video";
import {
  allStudentLessons,
  formatLessonDuration,
  studentOverview,
  toPracticeCardQuestions,
  toStudentModules,
} from "@/src/features/courses/helper/studentView";
import CoursePlayer from "./CoursePlayer";
import {CoursePractice} from "./CoursePractice";
import InteractiveLesson from "./InteractiveLesson";
import PurchasePreview from "./PurchasePreview";
import StudentModules from "./StudentModules";
import StudentOverview from "./StudentOverview";

export interface CourseStudentViewProps {
  course: CoursesFormValues & Partial<AdditionalCourseTypes>;
}

type Page = "learn" | "landing";

const TABS = ["content", "ai", "overview", "community", "notes", "facilitator"] as const;
type Tab = (typeof TABS)[number];

/** Tabs that only mean something for an enrolled student with real activity. */
const STUDENT_ONLY_TABS: Record<string, string> = {
  community: "Students discuss the course with each other here.",
  notes: "Students take timestamped notes on lessons here.",
  facilitator: "Students message the course facilitator here.",
};

/**
 * "View as a student" for a course. It shows what is actually saved, in the
 * layout the learner app uses: a flat list of modules (topics are an
 * authoring grouping students never see), lessons, and one "Practice quiz"
 * per module. "Before enrolling" shows the page a student sees prior to
 * enrolling. Nothing here is sent anywhere.
 */
export default function CourseStudentView({course}: CourseStudentViewProps) {
  const modules = useMemo(() => toStudentModules(course?.content?.topics), [course]);
  const lessons = useMemo(() => allStudentLessons(modules), [modules]);
  const overview = useMemo(() => studentOverview(modules), [modules]);

  const title = course.courseName || "Untitled course";
  const coverUrl =
    course.upload?.coverImageUrl ||
    course.upload?.coverImage?.remoteUrl ||
    course.upload?.coverImage?.previewUrl ||
    null;

  const [page, setPage] = useState<Page>("learn");
  const [activeLessonId, setActiveLessonId] = useState<string | null>(lessons[0]?.id ?? null);
  const [activeQuizModuleId, setActiveQuizModuleId] = useState<string | null>(null);
  const [activeExercise, setActiveExercise] = useState<{moduleId: string; name: string} | null>(null);
  const [activeQuizSet, setActiveQuizSet] = useState<{moduleId: string; name: string} | null>(null);
  const [completed, setCompleted] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [sidePanel, setSidePanel] = useState<"course" | "ai">("course");
  const [isSidePanelOpen, setIsSidePanelOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const activeLesson = lessons.find((l) => l.id === activeLessonId) ?? null;
  const activeQuizModule = modules.find((m) => m.id === activeQuizModuleId) ?? null;
  const activeQuizSetInfo =
    modules
      .find((m) => m.id === activeQuizSet?.moduleId)
      ?.quizSets.find((s) => s.name === activeQuizSet?.name) ?? null;
  const activeExerciseSet =
    modules
      .find((m) => m.id === activeExercise?.moduleId)
      ?.exerciseSets.find((s) => s.name === activeExercise?.name) ?? null;

  const markComplete = (id: string) => setCompleted((prev) => new Set(prev).add(id));

  const selectLesson = (_moduleId: string, lessonId: string) => {
    setActiveLessonId(lessonId);
    setActiveQuizModuleId(null);
    setActiveExercise(null);
    setActiveQuizSet(null);
  };

  const handleLessonEnded = () => {
    if (!activeLesson) return;
    markComplete(activeLesson.id);
    const index = lessons.findIndex((l) => l.id === activeLesson.id);
    if (index >= 0 && index < lessons.length - 1) setActiveLessonId(lessons[index + 1].id);
  };

  const modulesList = (
    <StudentModules
      modules={modules}
      completedLessonIds={completed}
      activeLessonId={activeLesson?.id ?? null}
      activeQuizModuleId={activeQuizModuleId}
      activeExercise={activeExercise}
      activeQuizSet={activeQuizSet}
      onSelectLesson={selectLesson}
      onSelectQuiz={(moduleId) => {
        setActiveExercise(null);
        setActiveQuizSet(null);
        setActiveQuizModuleId(moduleId);
      }}
      onSelectExercise={(moduleId, name) => {
        setActiveQuizModuleId(null);
        setActiveQuizSet(null);
        setActiveExercise({moduleId, name});
      }}
      onSelectQuizSet={(moduleId, name) => {
        setActiveQuizModuleId(null);
        setActiveExercise(null);
        setActiveQuizSet({moduleId, name});
      }}
    />
  );

  const aiPlaceholder = (
    <div className="rounded-2xl border border-dashed border-muted/30 p-6 text-center text-sm text-muted">
      <Icon icon="mingcute:ai-fill" size={18} className="mx-auto mb-2 text-primary" />
      Students ask Brainy questions about this course and lesson here.
    </div>
  );

  return (
    <section className="flex flex-col">
      <div className="mb-4 inline-flex w-fit rounded-full bg-gray-100 p-1 text-sm font-semibold">
        {(
          [
            ["learn", "After enrolling"],
            ["landing", "Before enrolling"],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => setPage(key)}
            aria-pressed={page === key}
            className={`rounded-full px-4 py-1.5 ${page === key ? "bg-white shadow-sm" : "text-muted"}`}
          >
            {label}
          </button>
        ))}
      </div>

      {page === "landing" ? (
        <PurchasePreview
          breadcrumbRoot="Course"
          title={title}
          description={course.description}
          coverUrl={coverUrl}
          price={Number(course.price || 0)}
          ctaLabel="Enroll course"
          ctaFreeLabel="Enroll for free"
        />
      ) : (
        <>
          <nav className="flex items-center gap-1 text-sm py-8 px-4">
            <span className="text-subtle">Course</span>
            <span className="text-subtle">/</span>
            <span className="text-muted/50 cursor-default text-nowrap truncate">{title}</span>
          </nav>

          <div
            className={`grid grid-cols-1 ${
              isSidePanelOpen ? "lg:grid-cols-[1fr_.1fr]" : "lg:grid-cols-[1fr_2rem]"
            } gap-6 transition-[grid-template-columns] duration-400 ease-in-out`}
          >
            <div className="min-w-0 pb-8">
              <div className="w-full min-w-0 overflow-hidden">
                {activeQuizSetInfo ? (
                  <CoursePractice
                    key={`quiz-${activeQuizSet?.moduleId}-${activeQuizSetInfo.name}`}
                    questions={toPracticeCardQuestions(activeQuizSetInfo.questions)}
                    label={`Quiz: ${activeQuizSetInfo.name}`}
                    timerMinutes={activeQuizSetInfo.timerMinutes}
                    passingScore={activeQuizSetInfo.passingScore}
                    onDone={() => setActiveQuizSet(null)}
                  />
                ) : activeExerciseSet ? (
                  <CoursePractice
                    key={`${activeExercise?.moduleId}-${activeExerciseSet.name}`}
                    questions={toPracticeCardQuestions(activeExerciseSet.questions)}
                    label={`Exercise: ${activeExerciseSet.name}`}
                    onDone={() => setActiveExercise(null)}
                  />
                ) : activeQuizModule ? (
                  activeQuizModule.questions.length === 0 ? (
                    <div className="flex min-h-[300px] w-full items-center justify-center rounded-2xl bg-muted/10 px-8 text-center text-sm text-muted">
                      No practice questions for this module yet.
                    </div>
                  ) : (
                    <CoursePractice
                      key={activeQuizModule.id}
                      questions={toPracticeCardQuestions(activeQuizModule.questions)}
                      onDone={() => setActiveQuizModuleId(null)}
                    />
                  )
                ) : !activeLesson ? (
                  <div className="flex aspect-video w-full items-center justify-center rounded-2xl bg-muted/10 text-sm text-muted">
                    This course has no lessons yet.
                  </div>
                ) : activeLesson.kind === "youtube" ? (
                  <iframe
                    src={youTubeEmbedUrl(activeLesson.url) ?? undefined}
                    title={activeLesson.title}
                    className="aspect-video w-full rounded-2xl"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : activeLesson.kind === "pdf" ? (
                  <iframe
                    src={activeLesson.url ?? undefined}
                    title={activeLesson.title}
                    className="aspect-video w-full rounded-2xl border border-muted/20"
                  />
                ) : activeLesson.kind === "html" ? (
                  <InteractiveLesson
                    key={activeLesson.id}
                    html={activeLesson.html ?? ""}
                    onComplete={handleLessonEnded}
                  />
                ) : (
                  <CoursePlayer
                    src={activeLesson.url ?? undefined}
                    poster={activeLesson.thumbnailUrl ?? coverUrl ?? undefined}
                    onEnded={handleLessonEnded}
                  />
                )}
              </div>

              {!activeQuizModule && !activeQuizSetInfo && !activeExerciseSet && activeLesson && (
                <div className="mt-4 flex items-center justify-between px-1">
                  <div>
                    <p className="text-lg font-semibold">{activeLesson.title}</p>
                    {!!activeLesson.durationSeconds && (
                      <p className="text-sm text-muted">{formatLessonDuration(activeLesson.durationSeconds)}</p>
                    )}
                  </div>
                  {activeLesson.kind !== "html" && (
                    <Button
                      variant={completed.has(activeLesson.id) ? "outline" : "primary"}
                      width="fit"
                      onClick={() => markComplete(activeLesson.id)}
                      disabled={completed.has(activeLesson.id)}
                    >
                      {completed.has(activeLesson.id) ? "Completed" : "Mark as complete"}
                    </Button>
                  )}
                </div>
              )}

              <div className="flex items-center justify-between my-8">
                <div className="flex items-center gap-6 p-4 max-lg:overflow-x-auto">
                  {TABS.map((tab) => (
                    <Button
                      key={tab}
                      variant={activeTab === tab ? "outline" : "ghost"}
                      size="sm"
                      width="fit"
                      onClick={() => setActiveTab(tab)}
                      className={`capitalize text-nowrap ${activeTab === tab ? "font-bold text-black" : "text-muted"} ${
                        tab === "content" || tab === "ai" ? "lg:hidden" : ""
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        {tab === "ai" && <Icon icon="mingcute:ai-fill" size={14} />}
                        {tab === "ai" ? "AI Assistant" : tab === "content" ? "Course Content" : tab}
                      </span>
                    </Button>
                  ))}
                </div>
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{opacity: 0, y: 10}}
                  animate={{opacity: 1, y: 0}}
                  exit={{opacity: 0, y: -10}}
                  transition={{duration: 0.15}}
                  className="px-4"
                >
                  {activeTab === "content" && isMobile && modulesList}
                  {activeTab === "ai" && isMobile && aiPlaceholder}
                  {activeTab === "overview" && (
                    <StudentOverview
                      title={title}
                      description={course.description}
                      lessonCount={overview.lessonCount}
                      totalDurationLabel={overview.totalDurationLabel}
                    />
                  )}
                  {activeTab in STUDENT_ONLY_TABS && (
                    <div className="rounded-2xl border border-dashed border-muted/30 p-6 text-center text-sm text-muted">
                      {STUDENT_ONLY_TABS[activeTab]}
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            <AnimatePresence mode="wait">
              {!isSidePanelOpen ? (
                <motion.button
                  key="open-btn"
                  onClick={() => setIsSidePanelOpen(true)}
                  className="max-lg:hidden p-1.5 text-subtle hover:bg-muted/10 transition-colors flex items-center gap-1.5 text-sm font-medium h-fit w-fit border rounded-full border-muted/40 cursor-pointer"
                  initial={{opacity: 0, scale: 0.8}}
                  animate={{opacity: 1, scale: 1}}
                  exit={{opacity: 0, scale: 0.8}}
                  transition={{duration: 0.2}}
                >
                  <Icon icon="ri:sidebar-unfold-line" size={15} />
                </motion.button>
              ) : (
                <motion.div
                  key="side-panel"
                  className="w-full min-w-fit md:max-w-80 pt-6 px-1 lg:flex flex-col rounded-xl overflow-hidden bg-background h-fit hidden"
                  initial={{opacity: 0, x: 40}}
                  animate={{opacity: 1, x: 0}}
                  exit={{opacity: 0, x: 40}}
                  transition={{type: "spring", stiffness: 300, damping: 30}}
                >
                  <div className="flex gap-2 justify-between py-2">
                    <div className="flex gap-2">
                      {(["course", "ai"] as const).map((tab) => (
                        <Button
                          key={tab}
                          variant={sidePanel === tab ? "outline" : "ghost"}
                          onClick={() => setSidePanel(tab)}
                          width="fit"
                          className={`text-nowrap py-1! ${sidePanel === tab ? "" : "opacity-60"}`}
                        >
                          <p className="flex items-center gap-2">
                            {tab === "ai" && <Icon icon="mingcute:ai-fill" size={14} />}
                            <span>{tab === "course" ? "Course content" : "AI assistant"}</span>
                          </p>
                        </Button>
                      ))}
                    </div>

                    <div className="flex items-center gap-1 px-2.5">
                      <button
                        type="button"
                        onClick={() => setIsSidePanelOpen(false)}
                        aria-label="Close Sidepanel"
                        className="p-1.5 rounded text-subtle hover:bg-muted/10 transition-colors"
                      >
                        <Icon icon="ri:sidebar-unfold-line" size={15} />
                      </button>
                    </div>
                  </div>

                  {sidePanel === "course" ? modulesList : aiPlaceholder}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </>
      )}
    </section>
  );
}
