"use client";

import {useState} from "react";
import {Icon, motion, AnimatePresence} from "@mcc/ui";
import {MakeModule, ModuleContent, Topic} from "../../types/types";
import {
  formatDuration,
  useLessonsDuration,
  useLevelProgress,
  useModuleProgress,
} from "../../hooks/useLesson";

interface CourseContentSidebarProps {
  topics: Topic[];
  onClose?: () => void;
  setActiveContent: (item: ModuleContent) => void;
  activeContentId?: string | null;
}

const VIDEO_EXTENSIONS = new Set(["MP4", "MOV", "WEBM", "AVI", "MKV", "M4V"]);

function getContentIcon(item: ModuleContent): {
  icon: string;
  className: string;
} {
  switch (item.type) {
    case "lesson":
      return VIDEO_EXTENSIONS.has((item.format || "").toUpperCase())
        ? {icon: "line-md:youtube", className: "text-primary"}
        : {icon: "ri:booklet-line", className: "text-primary"};
    case "practice":
      return {
        icon: "material-symbols:quiz-outline",
        className: "text-orange-500",
      };
    case "exercise":
      return {
        icon: "ph:clock",
        className: "text-blue-500",
      };
    case "quiz":
      return {icon: "mdi:certificate-outline", className: "text-green-500"};
    default:
      return {icon: "mdi:unknown", className: "text-gray-500"};
  }
}

function contentLabel(item: ModuleContent): string {
  switch (item.type) {
    case "lesson":
      return item.title || "Untitled Lesson";
    case "practice":
      return item.name || "Untitled Practice";
    case "exercise":
      return item.name || "Untitled Exercise";
    case "quiz":
      return item.title || "Untitled Quiz";
    default:
      return "Untitled";
  }
}

export default function CoursePlayModules({
  topics,
  setActiveContent,
  activeContentId = null,
}: CourseContentSidebarProps) {
  return (
    <div>
      {topics.map((topic, index) => (
        <motion.div
          key={topic.id}
          initial={{opacity: 0, y: 12}}
          animate={{opacity: 1, y: 0}}
          transition={{delay: index * 0.08, duration: 0.3}}
        >
          <TopicSection
            topic={topic}
            activeContentId={activeContentId}
            setActiveContent={setActiveContent}
          />
        </motion.div>
      ))}
    </div>
  );
}

function TopicSection({
  topic,
  activeContentId,
  setActiveContent,
}: {
  topic: Topic;
  activeContentId: string | null;
  setActiveContent: (item: ModuleContent) => void;
}) {
  const progress = useLevelProgress(topic.modules);
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
    progress <= 0
      ? 0
      : progress < 15
        ? 1
        : progress < 30
          ? 2
          : progress < 45
            ? 3
            : progress < 60
              ? 4
              : progress < 75
                ? 5
                : progress < 90
                  ? 6
                  : 7
  ) as 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between pt-6 text-muted py-3 sticky top-0 bg-background z-10">
        <span className="text-sm font-bold tracking-widest text-subtle uppercase">
          {topic.label || "Topic"}
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

      {topic.modules.map((module) => (
        <ModuleAccordion
          key={module.id}
          module={module}
          activeContentId={activeContentId}
          setActiveContent={setActiveContent}
        />
      ))}
    </div>
  );
}

function ModuleAccordion({
  module,
  activeContentId,
  setActiveContent,
}: {
  module: MakeModule;
  activeContentId: string | null;
  setActiveContent: (item: ModuleContent) => void;
}) {
  const [open, setOpen] = useState(false);
  const hasContent = !!module.content?.length;
  const moduleDuration = useLessonsDuration(module.content || []);
  const moduleProgress = useModuleProgress(module.content || []);
  const isCompleted = moduleProgress === 100;

  return (
    <div>
      <button
        type="button"
        onClick={() => hasContent && setOpen((o) => !o)}
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
          <span className="text-sm font-medium truncate">
            {module.label || "Untitled Module"}
          </span>
        </div>

        {hasContent && (
          <div className="flex items-center gap-2">
            <p className="text-subtle text-xs text-nowrap">
              {moduleDuration.formatted}
            </p>
            <Icon
              icon="ph:caret-down"
              size={14}
              className={`text-subtle shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
            />
          </div>
        )}
      </button>

      <AnimatePresence initial={false}>
        {hasContent && open && (
          <motion.div
            key="content-list"
            initial={{height: 0, opacity: 0}}
            animate={{height: "auto", opacity: 1}}
            exit={{height: 0, opacity: 0}}
            transition={{duration: 0.25, ease: "easeInOut"}}
            className="overflow-hidden"
          >
            <div className="pl-4 pt-6 pb-4 flex flex-col gap-4">
              {module.content.map((item, i) => {
                const isActive = activeContentId === item.id;
                const iconConfig = getContentIcon(item);

                return (
                  <motion.button
                    key={item.id}
                    type="button"
                    initial={{opacity: 0, x: -8}}
                    animate={{opacity: 1, x: 0}}
                    transition={{delay: i * 0.04, duration: 0.2}}
                    onClick={() => setActiveContent(item)}
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
                        {contentLabel(item)}
                      </p>
                      {item.type === "lesson" && item.duration && (
                        <p className="text-xs text-muted">
                          {formatDuration(item.duration)}
                        </p>
                      )}
                      {item.type === "practice" && (
                        <p className="text-xs text-orange-500">Practice Quiz</p>
                      )}

                      {item.type === "exercise" && (
                        <p className="text-xs text-blue-500">Exercise</p>
                      )}

                      {item.type === "quiz" && (
                        <p className="text-xs text-green-500">
                          Certification Exam
                        </p>
                      )}
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
