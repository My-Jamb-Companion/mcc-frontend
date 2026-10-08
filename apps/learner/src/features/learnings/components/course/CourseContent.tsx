"use client";

import {useCallback, useState, useEffect} from "react";
import Link from "next/link";
import {useRouter, usePathname, useSearchParams} from "next/navigation";
import {Button, Icon, motion, AnimatePresence, showError} from "@mcc/ui";
import CoursePlayModules from "./CourseModules";
import CoursePlayer from "./CoursePlayer";
import BrainyCourseSidePanel from "./BrainyCourseSidePanel";
import InteractiveLessonContent from "../InteractiveLessonContent";
import CommunityTab from "./tabs/CommunityTab";
import NotesTab from "./tabs/NotesTab";
import FacilitatorTab from "./tabs/FacilitatorTab";
import OverviewTab from "./tabs/OverviewTab";
import {CoursePractice} from "./CoursePractice";
import {BookingSection} from "@/src/features/booking/components/BookingSection";
import {Lesson, Module, lessonKind} from "@/src/features/learnings/helper/content.mapper";
import {youTubeEmbedUrl} from "@/src/features/learnings/helper/video";
import {useAllLessons, useLessonsDuration, formatDuration} from "@/src/features/learnings/hooks/useLesson";
import {useCertificates, useCompleteLecture, useCourseProgress} from "@/src/features/courses/hooks/useCourses";
import {useModuleQuestions} from "@/src/features/learnings/hooks/useModuleQuiz";
import {chatReplyText, sendChatMessage} from "@/src/features/brainy/services/brainy.service";

interface CourseContentProps {
  courseId: string;
  title: string;
  description?: string | null;
  coverImageUrl?: string | null;
  modules: Module[];
}

const TABS = ["content", "ai", "overview", "community", "notes", "facilitator"];

export default function CourseContent({
  courseId,
  title,
  description,
  coverImageUrl,
  modules,
}: CourseContentProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const completeLecture = useCompleteLecture();
  const {data: savedProgress} = useCourseProgress(courseId);
  const {certificates} = useCertificates();

  const allLessons = useAllLessons(modules);
  const totalDuration = useLessonsDuration(allLessons);
  const certificate = certificates.find((c) => c.course_id === courseId) ?? null;

  const [isMobile, setIsMobile] = useState(false);
  const [sidePanel, setSidePanel] = useState<"course" | "ai">("course");
  const [isSidePanelOpen, setIsSidePanelOpen] = useState(true);
  const [completedLessonIds, setCompletedLessonIds] = useState<Set<string>>(new Set());
  const lectureParam = searchParams.get("lecture");
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(
    (lectureParam && allLessons.find((l) => l.id === lectureParam)) || allLessons[0] || null,
  );
  const [activeQuizModuleId, setActiveQuizModuleId] = useState<string | null>(null);
  const [activeExercise, setActiveExercise] = useState<{moduleId: string; name: string} | null>(null);
  const [activeQuizSet, setActiveQuizSet] = useState<{moduleId: string; name: string} | null>(null);
  const [currentVideoTime, setCurrentVideoTime] = useState(0);
  const quizQuestions = useModuleQuestions(courseId, activeQuizModuleId);
  const exerciseQuestions = useModuleQuestions(
    courseId,
    activeExercise?.moduleId ?? null,
    activeExercise ? {exercise: activeExercise.name} : undefined,
  );
  const quizSetQuestions = useModuleQuestions(
    courseId,
    activeQuizSet?.moduleId ?? null,
    activeQuizSet ? {quiz: activeQuizSet.name} : undefined,
  );
  const activeQuizSetInfo = activeQuizSet
    ? modules.find((m) => m.id === activeQuizSet.moduleId)?.quizSets.find((q) => q.name === activeQuizSet.name)
    : undefined;

  const tabQuery = searchParams.get("tab");
  const activeTab = tabQuery && TABS.includes(tabQuery) ? tabQuery : "overview";

  const handleTabChange = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set(name, value);
      router.push(pathname + "?" + params.toString(), {scroll: false});
    },
    [searchParams, pathname, router],
  );

  const handleSelectLesson = (lesson: Lesson) => {
    setActiveLesson(lesson);
    setActiveQuizModuleId(null);
    setActiveExercise(null);
    setActiveQuizSet(null);
    setCurrentVideoTime(0);
  };

  const handleSelectQuiz = (moduleId: string) => {
    setActiveExercise(null);
    setActiveQuizSet(null);
    setActiveQuizModuleId(moduleId);
  };

  const handleSelectExercise = (moduleId: string, name: string) => {
    setActiveQuizModuleId(null);
    setActiveQuizSet(null);
    setActiveExercise({moduleId, name});
  };

  const handleSelectQuizSet = (moduleId: string, name: string) => {
    setActiveQuizModuleId(null);
    setActiveExercise(null);
    setActiveQuizSet({moduleId, name});
  };

  // The lessons already finished, as the server recorded them: a reload keeps its ticks.
  useEffect(() => {
    if (!savedProgress?.completed_lecture_ids.length) return;
    setCompletedLessonIds((prev) => new Set([...prev, ...savedProgress.completed_lecture_ids]));
  }, [savedProgress]);

  // Finishing a lesson is the server's to record and count: the tick appears at once, and is taken
  // back if the server refuses.
  const markComplete = useCallback(
    (lessonId: string) => {
      if (completedLessonIds.has(lessonId)) return;
      setCompletedLessonIds((prev) => new Set(prev).add(lessonId));
      completeLecture.mutate(
        {courseId, lectureId: lessonId},
        {
          onSuccess: (result) =>
            setCompletedLessonIds((prev) => new Set([...prev, ...result.completed_lecture_ids])),
          onError: () => {
            setCompletedLessonIds((prev) => {
              const next = new Set(prev);
              next.delete(lessonId);
              return next;
            });
            showError("Couldn't save your progress. Please try again.");
          },
        },
      );
    },
    [completedLessonIds, completeLecture, courseId],
  );

  const handleLessonEnded = () => {
    if (!activeLesson) return;
    markComplete(activeLesson.id);
    const currentIndex = allLessons.findIndex((item) => item.id === activeLesson.id);
    if (currentIndex >= 0 && currentIndex < allLessons.length - 1) {
      handleSelectLesson(allLessons[currentIndex + 1]);
    }
  };

  const handleBrainySend = async (message: string): Promise<string> => {
    const result = await sendChatMessage(message, {
      context: {course_id: courseId, course_title: title, lesson_title: activeLesson?.title},
    });
    return chatReplyText(result);
  };

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (!isMobile) handleTabChange("tab", "overview");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMobile]);

  const kind = activeLesson ? lessonKind(activeLesson) : null;

  return (
    <section className="flex flex-col">
      <nav className="flex items-center gap-1 text-sm py-8 px-4">
        <Link href="/learnings" className="text-subtle hover:underline">
          Course
        </Link>
        <span className="text-subtle">/</span>
        <span className="text-muted/50 cursor-default text-nowrap truncate">{title}</span>
      </nav>

      <BookingSection purpose="course" targetId={courseId} />

      <div
        className={`grid grid-cols-1 ${isSidePanelOpen ? "lg:grid-cols-[1fr_.1fr]" : "lg:grid-cols-[1fr_2rem]"} gap-6 transition-[grid-template-columns] duration-400 ease-in-out`}
      >
        <motion.div layout transition={{type: "spring", stiffness: 120, damping: 20}} className="min-w-0 pb-8">
          <div className="w-full min-w-0 overflow-hidden">
            {activeQuizSet ? (
              quizSetQuestions.isLoading ? (
                <div className="flex min-h-[300px] w-full items-center justify-center rounded-2xl bg-muted/10 text-sm text-muted">
                  Loading quiz…
                </div>
              ) : quizSetQuestions.questions.length === 0 ? (
                <div className="flex min-h-[300px] w-full items-center justify-center rounded-2xl bg-muted/10 px-8 text-center text-sm text-muted">
                  No questions in this quiz yet.
                </div>
              ) : (
                <CoursePractice
                  key={`quiz:${activeQuizSet.moduleId}:${activeQuizSet.name}`}
                  courseId={courseId}
                  moduleId={activeQuizSet.moduleId}
                  questions={quizSetQuestions.questions}
                  label={`Quiz: ${activeQuizSet.name}`}
                  timerMinutes={activeQuizSetInfo?.timerMinutes}
                  passingScore={activeQuizSetInfo?.passingScore}
                  onDone={() => setActiveQuizSet(null)}
                />
              )
            ) : activeExercise ? (
              exerciseQuestions.isLoading ? (
                <div className="flex min-h-[300px] w-full items-center justify-center rounded-2xl bg-muted/10 text-sm text-muted">
                  Loading exercise…
                </div>
              ) : exerciseQuestions.questions.length === 0 ? (
                <div className="flex min-h-[300px] w-full items-center justify-center rounded-2xl bg-muted/10 px-8 text-center text-sm text-muted">
                  No questions in this exercise yet.
                </div>
              ) : (
                <CoursePractice
                  key={`${activeExercise.moduleId}:${activeExercise.name}`}
                  courseId={courseId}
                  moduleId={activeExercise.moduleId}
                  questions={exerciseQuestions.questions}
                  label={`Exercise: ${activeExercise.name}`}
                  onDone={() => setActiveExercise(null)}
                />
              )
            ) : activeQuizModuleId ? (
              quizQuestions.isLoading ? (
                <div className="flex min-h-[300px] w-full items-center justify-center rounded-2xl bg-muted/10 text-sm text-muted">
                  Loading practice quiz…
                </div>
              ) : quizQuestions.questions.length === 0 ? (
                <div className="flex min-h-[300px] w-full items-center justify-center rounded-2xl bg-muted/10 px-8 text-center text-sm text-muted">
                  No practice questions for this module yet.
                </div>
              ) : (
                <CoursePractice
                  key={activeQuizModuleId}
                  courseId={courseId}
                  moduleId={activeQuizModuleId}
                  questions={quizQuestions.questions}
                  showFeedback
                  onDone={() => setActiveQuizModuleId(null)}
                />
              )
            ) : !activeLesson ? (
              <div className="flex aspect-video w-full items-center justify-center rounded-2xl bg-muted/10 text-sm text-muted">
                This course has no lessons yet.
              </div>
            ) : kind === "youtube" ? (
              <iframe
                src={youTubeEmbedUrl(activeLesson.videoUrl) ?? undefined}
                className="aspect-video w-full rounded-2xl"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : kind === "pdf" ? (
              <iframe
                src={activeLesson.videoUrl ?? undefined}
                className="aspect-video w-full rounded-2xl border border-muted/20"
              />
            ) : kind === "html" ? (
              <InteractiveLessonContent
                html={activeLesson.content ?? ""}
                lessonTitle={activeLesson.title}
                onComplete={handleLessonEnded}
              />
            ) : (
              <CoursePlayer
                src={activeLesson.videoUrl ?? undefined}
                poster={activeLesson.thumbnailUrl ?? coverImageUrl ?? undefined}
                onEnded={handleLessonEnded}
                onTimeUpdate={setCurrentVideoTime}
              />
            )}
          </div>

          {!activeQuizModuleId && !activeExercise && !activeQuizSet && activeLesson && (
            <div className="mt-4 flex items-center justify-between px-1">
              <div>
                <p className="text-lg font-semibold">{activeLesson.title}</p>
                {!!activeLesson.duration && (
                  <p className="text-sm text-muted">{formatDuration(activeLesson.duration)}</p>
                )}
              </div>
              {kind !== "html" && (
                <Button
                  variant={completedLessonIds.has(activeLesson.id) ? "outline" : "primary"}
                  width="fit"
                  onClick={() => markComplete(activeLesson.id)}
                  disabled={completedLessonIds.has(activeLesson.id)}
                >
                  {completedLessonIds.has(activeLesson.id) ? "Completed" : "Mark as complete"}
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
                  className={`capitalize text-nowrap  ${activeTab === tab ? "font-bold text-black" : "text-muted"} ${
                    tab === "content" || tab === "ai" ? "lg:hidden" : ""
                  }`}
                  width="fit"
                  onClick={() => handleTabChange("tab", tab)}
                >
                  <span className="flex items-center gap-2">
                    {tab === "ai" && <Icon icon={"mingcute:ai-fill"} size={14} />}
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
              {activeTab === "content" && isMobile && (
                <CoursePlayModules
                  modules={modules}
                  completedLessonIds={completedLessonIds}
                  activeLesson={activeLesson?.id ?? null}
                  activeQuizModuleId={activeQuizModuleId}
                  activeExercise={activeExercise}
                  activeQuizSet={activeQuizSet}
                  onSelectLesson={handleSelectLesson}
                  onSelectQuiz={handleSelectQuiz}
                  onSelectExercise={handleSelectExercise}
                  onSelectQuizSet={handleSelectQuizSet}
                />
              )}
              {activeTab === "ai" && isMobile && (
                <div className="h-[550px] w-full">
                  <BrainyCourseSidePanel className="h-full" onSend={handleBrainySend} />
                </div>
              )}
              {activeTab === "overview" && (
                <OverviewTab
                  title={title}
                  description={description}
                  totalLessons={allLessons.length}
                  totalDurationLabel={totalDuration.formatted}
                  certificateEarnedAt={certificate?.issued_at ?? null}
                />
              )}
              {activeTab === "community" && <CommunityTab courseId={courseId} />}
              {activeTab === "notes" && (
                <NotesTab
                  courseId={courseId}
                  activeLessonId={activeLesson?.id ?? null}
                  currentTimestamp={currentVideoTime}
                />
              )}
              {activeTab === "facilitator" && (
                <FacilitatorTab courseId={courseId} currentTime={currentVideoTime} />
              )}
            </motion.div>
          </AnimatePresence>
        </motion.div>

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
              className="w-full min-w-fit md:max-w-80 max-sm:w-full pt-6 px-1 lg:flex flex-col rounded-xl overflow-hidden bg-background h-fit hidden"
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
                      className={`text-nowrap py-1!  ${sidePanel == tab ? "" : "opacity-60"}`}
                    >
                      <p className="flex items-center gap-2">
                        {tab === "ai" && <Icon icon={"mingcute:ai-fill"} size={14} />}
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

              {sidePanel === "course" && (
                <CoursePlayModules
                  modules={modules}
                  completedLessonIds={completedLessonIds}
                  activeLesson={activeLesson?.id ?? null}
                  activeQuizModuleId={activeQuizModuleId}
                  activeExercise={activeExercise}
                  activeQuizSet={activeQuizSet}
                  onSelectLesson={handleSelectLesson}
                  onSelectQuiz={handleSelectQuiz}
                  onSelectExercise={handleSelectExercise}
                  onSelectQuizSet={handleSelectQuizSet}
                />
              )}

              {sidePanel === "ai" && <BrainyCourseSidePanel onSend={handleBrainySend} />}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
