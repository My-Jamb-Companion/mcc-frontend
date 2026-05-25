import {useState} from "react";
import {Icon} from "@mcc/ui";

type LessonType = "video" | "quiz" | "doc";

interface Lesson {
  title: string;
  duration: string;
  type: LessonType;
}

interface Module {
  title: string;
  lessons?: Lesson[];
}

export interface CourseModuleLevel {
  title: string;
  status?: "completed" | "not started";
  progress?: number;
  modules: Module[];
}

interface CourseContentSidebarProps {
  levels: CourseModuleLevel[];
  onClose?: () => void;
}

const lessonIconMap: Record<LessonType, {icon: string; className: string}> = {
  video: {
    icon: "ph:play-fill",
    className:
      "bg-[var(--color-background-info)] text-[var(--color-text-info)]",
  },
  quiz: {
    icon: "ph:file-text",
    className:
      "bg-[var(--color-background-warning)] text-[var(--color-text-warning)]",
  },
  doc: {
    icon: "ph:clock",
    className:
      "bg-[var(--color-background-secondary)] text-[var(--color-text-secondary)]",
  },
};

function ModuleAccordion({
  module,
  activeLesson,
  onSelectLesson,
}: {
  module: Module;
  activeLesson: string | null;
  onSelectLesson: (key: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const hasLessons = !!module.lessons?.length;

  return (
    <div className="border-t border-muted/20">
      <button
        type="button"
        onClick={() => hasLessons && setOpen((o) => !o)}
        className="flex items-center justify-between w-full px-3.5 py-2.5 hover:bg-muted/5 transition-colors text-left gap-2"
      >
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-[13px] font-medium truncate">
            {module.title}
          </span>
        </div>
        {hasLessons && (
          <Icon
            icon="ph:caret-down"
            size={14}
            className={`text-subtle shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          />
        )}
      </button>

      {hasLessons && open && (
        <div>
          {module.lessons!.map((lesson) => {
            const key = `${module.title}__${lesson.title}`;
            const isActive = activeLesson === key;
            const iconConfig = lessonIconMap[lesson.type];

            return (
              <button
                key={key}
                type="button"
                onClick={() => onSelectLesson(key)}
                className={`flex items-center gap-2.5 w-full pl-9 pr-3.5 py-2 text-left border-l-2 transition-colors ${
                  isActive
                    ? "border-l-[var(--color-text-info)] bg-[var(--color-background-info)]"
                    : "border-l-transparent hover:bg-muted/5"
                }`}
              >
                <div
                  className={`flex items-center justify-center size-[22px] rounded shrink-0 text-[13px] ${iconConfig.className}`}
                >
                  <Icon icon={iconConfig.icon} size={12} />
                </div>
                <div className="min-w-0">
                  <p
                    className={`text-[12.5px] truncate ${
                      isActive
                        ? "text-[var(--color-text-info)]"
                        : "text-primary"
                    }`}
                  >
                    {lesson.title}
                  </p>
                  <p className="text-[11px] text-subtle mt-0.5">
                    {lesson.duration}
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

export default function CoursePlayModules({
  levels,
  onClose,
}: CourseContentSidebarProps) {
  const [activeTab, setActiveTab] = useState<"course" | "ai">("course");
  const [activeLesson, setActiveLesson] = useState<string | null>(null);

  return (
    <div className="w-full max-w-[340px] flex flex-col border border-muted/20 rounded-xl overflow-hidden bg-background">
      {/* Tabs */}
      <div className="flex border-b border-muted/20">
        {(["course", "ai"] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-[13px] font-medium border-b-2 -mb-px transition-colors ${
              activeTab === tab
                ? "border-b-primary text-primary"
                : "border-b-transparent text-subtle hover:text-primary"
            }`}
          >
            <Icon
              icon={tab === "course" ? "ph:list" : "ph:sparkle"}
              size={14}
            />
            {tab === "course" ? "Course content" : "AI assistant"}
          </button>
        ))}

        <div className="flex items-center gap-1 px-2.5">
          <button
            type="button"
            aria-label="Bookmark"
            className="p-1.5 rounded text-subtle hover:bg-muted/10 transition-colors"
          >
            <Icon icon="ph:bookmark" size={15} />
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

      {/* Course content tab */}
      {activeTab === "course" && (
        <div className="overflow-y-auto max-h-[520px]">
          {levels.map((level) => (
            <div key={level.title}>
              {/* Level header */}
              <div className="flex items-center justify-between px-3.5 py-3 sticky top-0 bg-background z-10">
                <span className="text-[11px] font-medium tracking-widest text-subtle uppercase">
                  {level.title}
                </span>
                {level.progress !== undefined ? (
                  <span className="flex items-center gap-1 text-[11px] text-[var(--color-text-info)]">
                    <Icon icon="ph:check-circle" size={14} />
                    {level.progress}% completed
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-[11px] text-subtle">
                    <Icon icon="ph:info" size={14} />
                    {level.status}
                  </span>
                )}
              </div>

              {/* Modules */}
              {level.modules.map((module) => (
                <ModuleAccordion
                  key={module.title}
                  module={module}
                  activeLesson={activeLesson}
                  onSelectLesson={setActiveLesson}
                />
              ))}
            </div>
          ))}
        </div>
      )}

      {/* AI assistant tab */}
      {activeTab === "ai" && (
        <div className="flex flex-col items-center justify-center gap-2 py-10 text-subtle text-[13px]">
          <Icon icon="ph:sparkle" size={32} />
          <p>AI assistant panel</p>
        </div>
      )}
    </div>
  );
}
