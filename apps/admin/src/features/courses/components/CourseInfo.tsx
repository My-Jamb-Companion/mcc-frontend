"use client";

import {useState} from "react";
import {Icon} from "@mcc/ui";
import {FileRow} from "../types/types";

// Model matching your Step 2 state definitions
export type ContentType = "lesson" | "practice" | "exercise" | "quiz";

export type ContentItem = {
  id: string;
  type: ContentType;
  title?: string;
  files?: FileRow[];
};

export type MakeModule = {
  id: string;
  label: string;
  content: ContentItem[];
};

export type Topic = {
  id: string;
  label: string;
  modules: MakeModule[];
};

type CourseInfoProps = {
  instructor?: string;
  title?: string;
  description?: string;
  topics?: Topic[];
  isPaying?: boolean;
};

function ModuleAccordionItem({module}: {module: MakeModule}) {
  const [isOpen, setIsOpen] = useState(false);

  const lessonCount =
    module.content?.filter((c) => c.type === "lesson").length || 0;
  const practiceCount =
    module.content?.filter((c) => c.type === "practice").length || 0;
  const exerciseCount =
    module.content?.filter((c) => c.type === "exercise").length || 0;
  const quizCount =
    module.content?.filter((c) => c.type === "quiz").length || 0;

  return (
    <div className="py-4 border-b border-muted/20 last:border-none">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="w-full flex items-center justify-between text-left group"
      >
        <span className="text-sm font-semibold text-gray-800 dark:text-gray-200 group-hover:text-primary transition-colors">
          {module.label || (
            <span className="italic text-gray-400">Untitled module</span>
          )}
        </span>
        <Icon
          icon={isOpen ? "ri:close-line" : "ri:add-line"}
          size={18}
          className="text-gray-400"
        />
      </button>

      {isOpen && (
        <div className="mt-3 flex flex-col gap-2 pl-2">
          {/* Summary counts badge list */}
          <div className="flex flex-wrap items-center gap-2 text-xs text-subtle">
            {lessonCount > 0 && (
              <span className="inline-flex items-center gap-1 rounded-md bg-gray-100 dark:bg-gray-800 px-2 py-1 font-medium">
                <Icon icon="lucide:play-circle" size={13} /> {lessonCount}{" "}
                Lessons
              </span>
            )}
            {practiceCount > 0 && (
              <span className="inline-flex items-center gap-1 rounded-md bg-gray-100 dark:bg-gray-800 px-2 py-1 font-medium">
                <Icon icon="lucide:list-checks" size={13} /> {practiceCount}{" "}
                Practice
              </span>
            )}
            {exerciseCount > 0 && (
              <span className="inline-flex items-center gap-1 rounded-md bg-gray-100 dark:bg-gray-800 px-2 py-1 font-medium">
                <Icon icon="lucide:dumbbell" size={13} /> {exerciseCount}{" "}
                Exercises
              </span>
            )}
            {quizCount > 0 && (
              <span className="inline-flex items-center gap-1 rounded-md bg-gray-100 dark:bg-gray-800 px-2 py-1 font-medium">
                <Icon icon="lucide:help-circle" size={13} /> {quizCount} Quizzes
              </span>
            )}
          </div>

          {/* Optional itemized breakdown if content has titles */}
          {module.content && module.content.length > 0 && (
            <div className="mt-1 flex flex-col gap-1.5">
              {module.content.map((item, idx) => (
                <div
                  key={item.id || idx}
                  className="flex items-center gap-2 text-xs text-subtle"
                >
                  <Icon
                    icon={
                      item.type === "lesson"
                        ? "lucide:play-circle"
                        : item.type === "practice"
                          ? "lucide:list-checks"
                          : item.type === "exercise"
                            ? "lucide:dumbbell"
                            : "lucide:help-circle"
                    }
                    size={13}
                  />
                  <span>
                    {item.title ||
                      `${item.type.charAt(0).toUpperCase() + item.type.slice(1)} ${idx + 1}`}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function CourseInfo({
  instructor,
  title,
  description,
  topics = [],
  isPaying = false,
}: CourseInfoProps) {
  return (
    <div className="flex flex-col gap-8">
      {/* Course Overview Header */}
      <div className="flex flex-col gap-2 max-w-[60%] max-md:max-w-full">
        <p className="text-sm text-subtle">
          A course by{" "}
          <span className="font-semibold text-foreground">{instructor}</span>
        </p>
        <h1 className="text-3xl font-bold leading-tight">{title}</h1>
        <p className="text-sm text-subtle leading-relaxed">{description}</p>
      </div>

      {/* Topics & Modules Section */}
      {!isPaying && (
        <div className="flex flex-col gap-6">
          <p className="text-xs font-semibold uppercase tracking-widest text-subtle">
            Course table of contents
          </p>

          {topics.length === 0 ? (
            <p className="text-sm text-gray-400 italic">
              No topics available for this course.
            </p>
          ) : (
            <div className="flex flex-col gap-6">
              {topics.map((topic) => (
                <div key={topic.id} className="flex flex-col gap-3">
                  {/* Topic Label Header */}
                  <h3 className="text-base font-bold text-gray-900 dark:text-white">
                    {topic.label || "Untitled Topic"}
                  </h3>

                  {/* Modules Accordion Card */}
                  <div className="border border-muted/30 rounded-2xl px-5 bg-white dark:bg-[#222225]">
                    {topic.modules && topic.modules.length > 0 ? (
                      topic.modules.map((mod) => (
                        <ModuleAccordionItem key={mod.id} module={mod} />
                      ))
                    ) : (
                      <p className="py-4 text-xs text-gray-400 italic">
                        No modules in this topic.
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
