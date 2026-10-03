"use client";

import {useState} from "react";
import {Icon} from "@mcc/ui";
import type {
  StudentExamModule,
  StudentExamSubTopic,
  StudentExamTopic,
} from "@/src/features/Exam-program/helper/studentView";

export type ActiveNode =
  | {kind: "lecture"; lectureId: string}
  | {kind: "quiz" | "practice"; moduleId: string}
  | {kind: "test"; subTopicId: string};

interface Props {
  topics: StudentExamTopic[];
  active: ActiveNode | null;
  completedLectureIds: Set<string>;
  onSelect: (node: ActiveNode) => void;
}

/**
 * The student's exam-program content list: topic > sub-topic > module >
 * lectures, with Quiz / Practice per module and Test per sub-topic. A port of
 * the learner app's ExamContentTree; download / bookmark icons are inert.
 */
export default function ExamTreePreview({topics, active, completedLectureIds, onSelect}: Props) {
  return (
    <div className="flex flex-col gap-3">
      {topics.map((topic) => (
        <TopicAccordion
          key={topic.id}
          topic={topic}
          active={active}
          completedLectureIds={completedLectureIds}
          onSelect={onSelect}
        />
      ))}
    </div>
  );
}

function TopicAccordion({topic, ...rest}: Omit<Props, "topics"> & {topic: StudentExamTopic}) {
  const [open, setOpen] = useState(true);
  return (
    <div className="border border-muted/20 rounded-2xl overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center justify-between w-full px-3.5 py-4 hover:bg-muted/5 transition-colors text-left gap-2"
      >
        <span className="text-sm font-semibold truncate">{topic.title}</span>
        <Icon
          icon="ph:caret-down"
          size={14}
          className={`text-subtle shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <div className="pl-3 pb-3 flex flex-col gap-2">
          {topic.subTopics.map((st) => (
            <SubTopicAccordion key={st.id} subTopic={st} {...rest} />
          ))}
        </div>
      )}
    </div>
  );
}

function SubTopicAccordion({
  subTopic,
  active,
  completedLectureIds,
  onSelect,
}: Omit<Props, "topics"> & {subTopic: StudentExamSubTopic}) {
  const [open, setOpen] = useState(false);
  const isTestActive = active?.kind === "test" && active.subTopicId === subTopic.id;

  return (
    <div className="rounded-xl bg-muted/5">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center justify-between w-full px-3 py-3 text-left gap-2"
      >
        <span className="text-sm font-medium truncate">{subTopic.title}</span>
        <Icon
          icon="ph:caret-down"
          size={13}
          className={`text-subtle shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="pl-3 pb-3 flex flex-col gap-2">
          {subTopic.modules.map((mod) => (
            <ModuleAccordion
              key={mod.id}
              module={mod}
              active={active}
              completedLectureIds={completedLectureIds}
              onSelect={onSelect}
            />
          ))}
          {subTopic.test.length > 0 && (
            <button
              type="button"
              onClick={() => onSelect({kind: "test", subTopicId: subTopic.id})}
              className={`flex items-center gap-2 px-2 py-2 text-left rounded-lg transition-colors ${
                isTestActive ? "bg-primary/10 text-primary" : "hover:bg-muted/10 text-subtle"
              }`}
            >
              <Icon icon="material-symbols:fact-check-outline" size={16} className="text-orange-500" />
              <span className="text-sm">Test ({subTopic.test.length})</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function ModuleAccordion({
  module: mod,
  active,
  completedLectureIds,
  onSelect,
}: Omit<Props, "topics"> & {module: StudentExamModule}) {
  const [open, setOpen] = useState(false);
  const allWatched = mod.lectures.length > 0 && mod.lectures.every((l) => completedLectureIds.has(l.id));
  const isQuizActive = active?.kind === "quiz" && active.moduleId === mod.id;
  const isPracticeActive = active?.kind === "practice" && active.moduleId === mod.id;

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center justify-between w-full px-2 py-2 hover:bg-muted/10 transition-colors text-left gap-2 rounded-lg"
      >
        <div className="flex items-center gap-2 min-w-0">
          <div
            className={`rounded-md h-4 w-4 flex items-center justify-center shrink-0 ${
              allWatched ? "bg-primary text-white" : "border border-muted/20 text-transparent"
            }`}
          >
            <Icon icon="ci:check" size={14} />
          </div>
          <span className="text-sm truncate">{mod.title}</span>
        </div>
        <Icon
          icon="ph:caret-down"
          size={12}
          className={`text-subtle shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="pl-6 pt-1 pb-1 flex flex-col gap-1.5">
          {mod.lectures.map((lecture) => {
            const isActive = active?.kind === "lecture" && active.lectureId === lecture.id;
            return (
              <div key={lecture.id} className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => onSelect({kind: "lecture", lectureId: lecture.id})}
                  className={`flex items-center gap-2 flex-1 min-w-0 pl-1 pr-2 py-1.5 text-left rounded-lg transition-colors ${
                    isActive ? "border-l-primary border-l-3 bg-primary/5" : "border-l-0 hover:bg-muted/5"
                  }`}
                >
                  <Icon
                    icon="solar:play-circle-bold"
                    size={15}
                    className={isActive ? "text-primary" : "text-subtle"}
                  />
                  <span className={`text-sm truncate ${isActive ? "text-primary" : "text-subtle"}`}>
                    {lecture.title}
                  </span>
                  {completedLectureIds.has(lecture.id) && (
                    <Icon icon="ci:check" size={14} className="ml-auto shrink-0 text-primary" />
                  )}
                </button>
                {lecture.url && lecture.kind !== "youtube" && (
                  <Icon icon="solar:download-minimalistic-linear" size={16} className="shrink-0 text-subtle" />
                )}
                <Icon icon="solar:bookmark-linear" size={16} className="shrink-0 text-subtle" />
              </div>
            );
          })}

          {mod.quiz.length > 0 && (
            <button
              type="button"
              onClick={() => onSelect({kind: "quiz", moduleId: mod.id})}
              className={`flex items-center gap-2 pl-1 pr-2 py-1.5 text-left rounded-lg transition-colors ${
                isQuizActive ? "border-l-primary border-l-3 bg-primary/5" : "border-l-0 hover:bg-muted/5"
              }`}
            >
              <Icon icon="material-symbols:quiz-outline" size={15} className="text-orange-500" />
              <span className={`text-sm ${isQuizActive ? "text-primary" : "text-subtle"}`}>
                Quiz ({mod.quiz.length})
              </span>
            </button>
          )}
          {mod.practice.length > 0 && (
            <button
              type="button"
              onClick={() => onSelect({kind: "practice", moduleId: mod.id})}
              className={`flex items-center gap-2 pl-1 pr-2 py-1.5 text-left rounded-lg transition-colors ${
                isPracticeActive ? "border-l-primary border-l-3 bg-primary/5" : "border-l-0 hover:bg-muted/5"
              }`}
            >
              <Icon icon="material-symbols:edit-note-rounded" size={15} className="text-orange-500" />
              <span className={`text-sm ${isPracticeActive ? "text-primary" : "text-subtle"}`}>
                Practice ({mod.practice.length})
              </span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
