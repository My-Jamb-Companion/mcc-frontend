"use client";

import {CourseDetail, Lessons} from "@/src/features/constants/demoCourses";
import CoursePlayModules from "./CourseModules";
import Link from "next/link";
import CoursePlayer from "./CoursePlayer";
import {useState, useCallback, useEffect} from "react";
import {useAllLessons} from "@/src/features/learnings/hooks/useLesson";
import {Button, Icon} from "@mcc/ui";
import {useRouter, usePathname, useSearchParams} from "next/navigation";
import CommunityTab from "./tabs/CommunityTab";
import NotesTab from "./tabs/NotesTab";
import FacilitatorTab from "./tabs/FacilitatorTab";
import OverviewTab from "./tabs/OverviewTab";
import BrainyCourseSidePanel from "./BrainyCourseSidePanel";
import {motion, AnimatePresence} from "@mcc/ui";
import {CoursePractice} from "./CoursePractice";
import CourseTestFlow from "./CourseExamFlow";
import CourseExercise from "./CourseExcercise";

export default function CourseContent({course}: {course: CourseDetail}) {
  const allLessons = useAllLessons(course);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [isMobile, setIsMobile] = useState(false);

  const tabQuery = searchParams.get("tab");
  const tabs = [
    "content",
    "ai",
    "overview",
    "community",
    "notes",
    "facilitator",
  ];
  const [sidePanel, setSidePanel] = useState<"course" | "ai">("course");
  const [isSidePanelOpen, setIsSidePanelOpen] = useState(true);

  const activeTab = tabQuery && tabs.includes(tabQuery) ? tabQuery : "overview";

  const [activeLesson, setActiveLesson] = useState<Lessons | null>(
    allLessons[0] || null,
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

  const handleVideoEnded = () => {
    if (!activeLesson) return;
    const currentIndex = allLessons.findIndex(
      (item) => item.id === activeLesson.id,
    );
    if (currentIndex >= 0 && currentIndex < allLessons.length - 1) {
      setActiveLesson(allLessons[currentIndex + 1]);
    }
  };

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (!isMobile) {
      handleTabChange("tab", "overview");
    }
  }, [isMobile]);

  return (
    <section className="flex flex-col">
      <nav className="flex items-center gap-1 text-sm py-8 px-4">
        <Link href="/learnings" className="text-subtle hover:underline">
          Course
        </Link>

        <span className="text-subtle">/</span>

        <span className="text-muted/50 cursor-default text-nowrap truncate">
          {course.title}
        </span>
      </nav>

      <div
        className={`grid grid-cols-1 ${isSidePanelOpen ? "lg:grid-cols-[1fr_.1fr]" : "lg:grid-cols-[1fr_2rem]"} gap-6 transition-[grid-template-columns] duration-400 ease-in-out`}
      >
        <motion.div
          layout
          transition={{
            type: "spring",
            stiffness: 120,
            damping: 20,
          }}
          className="pb-8"
        >
          <div className="w-full min-w-full overflow-hidden">
            <AnimatePresence mode="wait">
              {activeLesson?.type === "video" && (
                <motion.div
                  key={`video-${activeLesson?.id}`}
                  initial={{opacity: 0, scale: 0.98}}
                  animate={{opacity: 1, scale: 1}}
                  exit={{opacity: 0, scale: 0.98}}
                  transition={{duration: 0.25}}
                >
                  <CoursePlayer
                    src={activeLesson?.src}
                    poster={course.imgBig}
                    onEnded={handleVideoEnded}
                    onTimeUpdate={setCurrentVideoTime}
                  />
                </motion.div>
              )}

              {activeLesson?.type === "audio" && (
                <motion.div
                  key={`audio-${activeLesson?.id}`}
                  initial={{opacity: 0, scale: 0.98}}
                  animate={{opacity: 1, scale: 1}}
                  exit={{opacity: 0, scale: 0.98}}
                  transition={{duration: 0.25}}
                >
                  <CoursePlayer
                    src={activeLesson?.src}
                    isAudio={true}
                    onEnded={handleVideoEnded}
                    onTimeUpdate={setCurrentVideoTime}
                  />
                </motion.div>
              )}

              {activeLesson?.type === "doc" && (
                <motion.div
                  key={`doc-${activeLesson?.id}`}
                  initial={{opacity: 0, scale: 0.98}}
                  animate={{opacity: 1, scale: 1}}
                  exit={{opacity: 0, scale: 0.98}}
                  transition={{duration: 0.25}}
                >
                  Document...
                </motion.div>
              )}

              {activeLesson?.type === "practice" && (
                <motion.div
                  key={`practice-${activeLesson?.id}`}
                  initial={{opacity: 0, scale: 0.98}}
                  animate={{opacity: 1, scale: 1}}
                  exit={{opacity: 0, scale: 0.98}}
                  transition={{duration: 0.25}}
                >
                  <CoursePractice
                    questions={activeLesson?.practice?.questions || []}
                    // onComplete={(answers) => console.log("Correct!", answers)}
                    onDone={() => handleVideoEnded()}
                  />
                </motion.div>
              )}

              {activeLesson?.type === "exercise" && (
                <motion.div
                  key={`exercise-${activeLesson?.id}`}
                  initial={{opacity: 0, scale: 0.98}}
                  animate={{opacity: 1, scale: 1}}
                  exit={{opacity: 0, scale: 0.98}}
                  transition={{duration: 0.25}}
                >
                  <CourseExercise
                    questions={activeLesson?.exercise?.questions || []}
                    title={course?.title}
                    // onComplete={(answers) => {
                    //   console.log("answers", answers);
                    // }}
                  />
                </motion.div>
              )}

              {activeLesson?.type === "exam" && (
                <motion.div
                  key={`exam-${activeLesson?.id}`}
                  initial={{opacity: 0, scale: 0.98}}
                  animate={{opacity: 1, scale: 1}}
                  exit={{opacity: 0, scale: 0.98}}
                  transition={{duration: 0.25}}
                >
                  <CourseTestFlow
                    questions={activeLesson?.exam?.questions || []}
                    // onCorrect={(problem, index) =>
                    //   console.log("Correct!", problem.id, index)
                    // }
                    // onUpNext={() => handleVideoEnded()}
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
                  className={`capitalize text-nowrap  ${activeTab === tab ? "font-bold text-black" : "text-muted"} ${
                    tab === "content" || tab === "ai" ? "lg:hidden" : ""
                  }`}
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
              {activeTab === "content" && isMobile && (
                <CoursePlayModules
                  levels={course.curriculums}
                  setActiveLessonSrc={setActiveLesson}
                  activeLesson={activeLesson?.id}
                />
              )}
              {activeTab === "ai" && isMobile && (
                <div className="h-[550px] w-full">
                  <BrainyCourseSidePanel className="h-full" />
                </div>
              )}
              {activeTab === "overview" && (
                <OverviewTab
                  title={course.title}
                  description={course.description}
                  rating={course.rating}
                  reviewCount={course.reviewCount}
                  enrolledStudents={course.enrolledStudents}
                  hours={course.hours}
                  lastUpdated={course.lastUpdated}
                  certificate={course.certificate}
                  instructor={course.instructor}
                  instructorBio={course.instructorBio}
                  instructorAvatar={course.instructorAvatar}
                  instructorSocial={course.instructorSocial}
                  availableLanguage={course.availableLanguage}
                  instructorRole={course.instructorRole}
                />
              )}
              {activeTab === "community" && (
                <CommunityTab
                // currentVideoTime={currentVideoTime}
                />
              )}
              {activeTab === "notes" && (
                <NotesTab currentTimestamp={currentVideoTime} />
              )}
              {activeTab === "facilitator" && (
                <FacilitatorTab
                  instructorName={course.instructor}
                  courseDescription={course.description}
                  instructorAvatar={course.instructorAvatar}
                  currentTime={currentVideoTime}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </motion.div>

        {/* side panel */}
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
                  levels={course.curriculums}
                  setActiveLessonSrc={setActiveLesson}
                  activeLesson={activeLesson?.id}
                />
              )}

              {sidePanel === "ai" && <BrainyCourseSidePanel />}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
