import {useState} from "react";
import {Icon, Button} from "@mcc/ui";
import {
  useLessonsDuration,
  useLevelProgress,
  useModuleProgress,
  formatDuration,
} from "@/src/features/learnings/hooks/useLesson";
import {
  CourseModule,
  CourseLevel,
  Lessons,
  LessonType,
} from "@/src/features/constants/demoCourses";

interface CourseContentSidebarProps {
  levels: CourseLevel[];
  onClose?: () => void;
  setActiveLessonSrc: (lesson: Lessons) => void;
  activeLesson?: string | null;
}

const lessonIconMap: Record<LessonType, {icon: string; className: string}> = {
  video: {
    icon: "line-md:youtube",
    className: "text-primary",
  },
  doc: {
    icon: "ri:booklet-line",
    className: "text-primary",
  },
  //   quiz: {
  //     icon: "ph:clock",
  //     className: "text-primary",
  //   },
};

export default function CoursePlayModules({
  levels,
  onClose,
  setActiveLessonSrc,
  activeLesson = null,
}: CourseContentSidebarProps) {
  const [activeTab, setActiveTab] = useState<"course" | "ai">("course");

  return (
    <div className="w-full min-w-fit max-w-120 max-sm:w-full pt-6 px-1 flex flex-col rounded-xl overflow-hidden bg-background">
      <div className="flex gap-2 justify-between py-2">
        <div className="flex gap-2">
          {(["course", "ai"] as const).map((tab) => (
            <Button
              key={tab}
              variant={activeTab === tab ? "outline" : "ghost"}
              onClick={() => setActiveTab(tab)}
              width="fit"
              className={`text-nowrap py-1!  ${activeTab == tab ? "" : "opacity-60"}`}
            >
              <p className="flex items-center gap-2">
                {tab === "ai" && <Icon icon={"mingcute:ai-fill"} size={14} />}
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
            aria-label="Bookmark"
            className="p-1.5 rounded text-subtle hover:bg-muted/10 transition-colors"
          >
            <Icon icon="ri:sidebar-unfold-line" size={15} />
          </button>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="p-1.5 rounded text-subtle hover:bg-muted/10 transition-colors"
          >
            <Icon icon="ph:x" size={15} />
          </button>
        </div>
      </div>

      {activeTab === "course" && (
        <div className="overflow-y-auto">
          {levels.map((level) => (
            <LevelSection
              key={level.title}
              level={level}
              activeLesson={activeLesson}
              setActiveLessonSrc={setActiveLessonSrc}
            />
          ))}
        </div>
      )}

      {activeTab === "ai" && (
        <div className="flex flex-col items-center justify-center gap-2 py-10 text-subtle text-[13px]">
          <Icon icon="ph:sparkle" size={32} />
          <p>{"AI assistant panel"}</p>
        </div>
      )}
    </div>
  );
}

function LevelSection({
  level,
  activeLesson,
  setActiveLessonSrc,
}: {
  level: CourseLevel;
  activeLesson: string | null;
  setActiveLessonSrc: (key: Lessons) => void;
}) {
  const progress = useLevelProgress(level.modules);
  const progressIconMap = {
    0: "hugeicons:progress-01",
    1: "ri:progress-2-line",
    2: "ri:progress-3-line",
    3: "ri:progress-4-line",
    4: "ri:progress-5-line",
    5: "ri:progress-6-line",
    6: "ri:progress-7-line",
    7: "ri:progress-8-line",
  };
const iconIndex = (
  progress <= 0  ? 0
  : progress < 15 ? 1
  : progress < 30 ? 2
  : progress < 45 ? 3
  : progress < 60 ? 4
  : progress < 75 ? 5
  : progress < 90 ? 6
  : 7
) as 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;
  
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between pt-6 text-muted py-3 sticky top-0 bg-background z-10">
        <span className="text-sm font-bold tracking-widest text-subtle uppercase">
          {level.title}
        </span>
        {progress !== 0 ? (
          <span className="flex items-center justify-center gap-2">
            <span className="text-primary">
              <Icon icon={progressIconMap[iconIndex]} size={16} />
            </span>
            <span className="text-muted text-xs font-medium translate-y-[1.5px]">
              {progress}% completed
            </span>
          </span>
        ) : (
          <span className="flex items-center gap-2 text-xs font-medium text-muted">
            <Icon icon="octicon:play-16" size={14} />
            Not Started
          </span>
        )}
      </div>

      {level.modules.map((module) => (
        <ModuleAccordion
          key={module.title}
          module={module}
          activeLesson={activeLesson}
          setActiveLessonSrc={setActiveLessonSrc}
        />
      ))}
    </div>
  );
}

function ModuleAccordion({
  module,
  activeLesson,
  setActiveLessonSrc,
}: {
  module: CourseModule;
  activeLesson: string | null;
  setActiveLessonSrc: (key: Lessons) => void;
}) {
  const [open, setOpen] = useState(false);
  const hasLessons = !!module.lessons?.length;
  const moduleDuration = useLessonsDuration(module.lessons || []);
  const moduleProgress = useModuleProgress(module.lessons || []);
  const isCompleted = moduleProgress === 100;
  return (
    <div className="">
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
            <p className="text-subtle text-xs">{moduleDuration.formatted}</p>
            <Icon
              icon="ph:caret-down"
              size={14}
              className={`text-subtle shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
            />
          </div>
        )}
      </button>

      {hasLessons && open && (
        <div className="pl-4 pt-6 pb-4 flex flex-col gap-4">
          {module.lessons!.map((lesson) => {
            const key = lesson.id;
            const isActive = activeLesson === key;
            const iconConfig = lessonIconMap[lesson.type];

            return (
              <button
                key={key}
                type="button"
                onClick={() => {
                  console.log(lesson);
                  setActiveLessonSrc(lesson);
                }}
                className={`flex gap-2.5 w-full pl-1 pr-3.5 text-left hover:bg-muted/5 transition-colors ${
                  isActive ? "border-l-primary  border-l-3" : "border-l-0"
                }`}
              >
                <div
                  className={`flex items-center justify-center size-5.5 rounded shrink-0 text-[13px] ${iconConfig.className}`}
                >
                  <Icon icon={iconConfig.icon} size={16} />
                </div>
                <div className="min-w-0">
                  <p
                    className={`text-sm truncate ${
                      isActive ? "text-primary" : "text-subtle"
                    }`}
                  >
                    {lesson.title}
                  </p>
                  <p className="text-sm mt-0.5 text-muted">
                    {formatDuration(lesson.duration)}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
