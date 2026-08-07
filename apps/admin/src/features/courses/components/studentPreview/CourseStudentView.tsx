"use client";

import CoursePlayer from "./CoursePlayer";
import {useState, useCallback} from "react";
import {Button, Icon, motion, AnimatePresence} from "@mcc/ui";
import {useRouter, usePathname, useSearchParams} from "next/navigation";
import CommunityTab from "./tabs/CommunityTab";
import NotesTab from "./tabs/NotesTab";
import FacilitatorTab from "./tabs/FacilitatorTab";
import {CoursePractice} from "./CoursePractice";
import CourseTestFlow from "./CourseExamFlow";
import CoursePlayModules from "./CourseModules";
import OverviewTab from "./tabs/OverviewTab";
import {
  AdditionalCourseTypes,
  CoursesFormValues,
  CreatPracticeQuestionType,
  ModuleContent,
  Option,
} from "../../types/types";
import {useAllModuleContents} from "../../hooks/useLesson";

export interface CourseStudentViewProps {
  course: CoursesFormValues & Partial<AdditionalCourseTypes>;
}

export default function CourseStudentView({course}: CourseStudentViewProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const tabQuery = searchParams.get("tab");
  const tabs = ["overview", "community", "notes", "facilitator"];
  const [sidePanel] = useState<"course" | "ai">("course");
  const [isSidePanelOpen, setIsSidePanelOpen] = useState(true);

  const activeTab = tabQuery && tabs.includes(tabQuery) ? tabQuery : "overview";

  const allContents = useAllModuleContents(course?.content?.topics || []);

  const [activeContent, setActiveContent] = useState<ModuleContent | null>(
    allContents[0] || null,
  );
  const [currentVideoTime, setCurrentVideoTime] = useState(0);

  const handleTabChange = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set(name, value);
      router.push(pathname + "?" + params.toString(), {scroll: false});
    },
    [searchParams, pathname, router],
  );

  const handleContentEnded = () => {
    if (!activeContent) return;
    const currentIndex = allContents.findIndex(
      (item) => item.id === activeContent.id,
    );
    if (currentIndex >= 0 && currentIndex < allContents.length - 1) {
      setActiveContent(allContents[currentIndex + 1]);
    }
  };

  return (
    <section className="flex flex-col">
      <div
        className={`grid grid-cols-1 ${
          isSidePanelOpen
            ? "lg:grid-cols-[1fr_.1fr]"
            : "lg:grid-cols-[1fr_2rem]"
        } gap-6 transition-[grid-template-columns] duration-400 ease-in-out`}
      >
        <motion.div
          layout
          transition={{type: "spring", stiffness: 120, damping: 20}}
          className="pb-8"
        >
          <div className="w-full min-w-full overflow-hidden">
            <AnimatePresence mode="wait">
              {activeContent?.type === "lesson" && (
                <motion.div
                  key={`video-${activeContent.id}`}
                  initial={{opacity: 0, scale: 0.98}}
                  animate={{opacity: 1, scale: 1}}
                  exit={{opacity: 0, scale: 0.98}}
                  transition={{duration: 0.25}}
                >
                  <CoursePlayer
                    src={activeContent.previewUrl}
                    onEnded={handleContentEnded}
                    onTimeUpdate={setCurrentVideoTime}
                  />
                </motion.div>
              )}

              {activeContent?.type === "practice" && (
                <motion.div
                  key={`practice-${activeContent.id}`}
                  initial={{opacity: 0, scale: 0.98}}
                  animate={{opacity: 1, scale: 1}}
                  exit={{opacity: 0, scale: 0.98}}
                  transition={{duration: 0.25}}
                >
                  <CoursePractice
                    questions={
                      activeContent.questions?.map(
                        (q: CreatPracticeQuestionType) => {
                          const correctTexts = q.options
                            .filter((o: Option) => o.isCorrect)
                            .map((o: Option) => o.text);
                          const isMulti = q.type === "multiple";

                          return {
                            id: q.id,
                            question: q.question,
                            answers: q.options.map((o: Option) => o.text),
                            correctAnswer: isMulti
                              ? correctTexts
                              : (correctTexts[0] ?? ""),
                            explanation: q.explanation || "",
                            multiSelect: isMulti,
                          };
                        },
                      ) || []
                    }
                    onDone={handleContentEnded}
                  />
                </motion.div>
              )}

              {activeContent?.type === "quiz" && (
                <motion.div
                  key={`quiz-${activeContent.id}`}
                  initial={{opacity: 0, scale: 0.98}}
                  animate={{opacity: 1, scale: 1}}
                  exit={{opacity: 0, scale: 0.98}}
                  transition={{duration: 0.25}}
                >
                  <CourseTestFlow
                    questions={activeContent.questions || []}
                    onCertificateReady={handleContentEnded}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="flex items-center justify-between my-8">
            <div className="flex items-center gap-6 p-4 max-lg:overflow-x-auto">
              {tabs.map((tab) => (
                <Button
                  key={tab}
                  variant={activeTab === tab ? "outline" : "ghost"}
                  size="sm"
                  disabled={tab === "ai"}
                  className={`capitalize text-nowrap ${activeTab === tab ? "font-bold text-black" : "text-muted"}`}
                  width="fit"
                  onClick={() => handleTabChange("tab", tab)}
                >
                  <span className="flex items-center gap-2">
                    {tab === "ai" && (
                      <Icon icon={"mingcute:ai-fill"} size={14} />
                    )}
                    {tab === "ai"
                      ? "AI Assistant"
                      : tab === "content"
                        ? "Course Content"
                        : tab}
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
              {activeTab === "content" && (
                <CoursePlayModules
                  topics={course?.content?.topics || []}
                  setActiveContent={setActiveContent}
                  activeContentId={activeContent?.id}
                />
              )}
              {activeTab === "overview" && (
                <OverviewTab
                  title={course.courseName}
                  description={course.description}
                  rating={course?.rating || 0}
                  reviewCount={course?.reviewCount || 0}
                  enrolledStudents={course?.enrolledStudents || 0}
                  hours={course?.hours || 0}
                  lastUpdated={course?.lastUpdated || "N/A"}
                  certificate={course?.certificate || "N/A"}
                  instructor={course?.instructor || "N/A"}
                  instructorBio={course?.instructorBio || "N/A"}
                  instructorAvatar={course?.instructorAvatar || ""}
                  instructorSocial={course?.instructorSocial || []}
                  availableLanguage={course?.availableLanguage || []}
                  instructorRole={course?.instructorRole || "N/A"}
                />
              )}
              {activeTab === "community" && <CommunityTab />}
              {activeTab === "notes" && (
                <NotesTab currentTimestamp={currentVideoTime} />
              )}
              {activeTab === "facilitator" && (
                <FacilitatorTab
                  courseDescription={course.description}
                  currentTime={currentVideoTime}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </motion.div>

        {/* Side panel */}
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
              className="w-[300px] pt-6 px-1 lg:flex flex-col rounded-xl overflow-hidden bg-background h-fit hidden"
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
                      width="fit"
                      className={`text-nowrap py-1! ${
                        sidePanel == tab ? "" : "opacity-60"
                      } ${tab === "ai" ? "cursor-not-allowed" : ""}`}
                    >
                      <p className="flex items-center gap-2">
                        {tab === "ai" && (
                          <Icon icon={"mingcute:ai-fill"} size={14} />
                        )}
                        <span>
                          {tab === "course" ? "Course content" : "AI assistant"}
                        </span>
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
                  topics={course?.content?.topics || []}
                  setActiveContent={setActiveContent}
                  activeContentId={activeContent?.id}
                />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
