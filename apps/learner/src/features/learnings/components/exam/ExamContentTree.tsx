"use client";
import {useState} from "react";
import {Icon} from "@mcc/ui";
import {ApiExamModule, ApiExamSubTopic, ApiExamTopic} from "@/src/features/exams/services/exam.service";

export type ActiveNode =
  | {kind: "lecture"; lectureId: string}
  | {kind: "quiz" | "practice"; moduleId: string}
  | {kind: "test"; subTopicId: string};

interface ExamContentTreeProps {
  topics: ApiExamTopic[];
  active: ActiveNode | null;
  completedLectureIds: Set<string>;
  onSelect: (node: ActiveNode) => void;
}

/**
 * The exam-prep equivalent of ../course/CourseModules.tsx, one level
 * deeper: topic -> sub-topic -> module -> lecture, with a "Test" action on
 * each sub-topic and "Quiz"/"Practice" actions on each module.
 */
export default function ExamContentTree({topics, active, completedLectureIds, onSelect}: ExamContentTreeProps) {
  return (
    <div className="flex flex-col gap-3">
      {topics.map((topic) => (
        <TopicAccordion
          key={topic.topic_id}
          topic={topic}
          active={active}
          completedLectureIds={completedLectureIds}
          onSelect={onSelect}
        />
      ))}
    </div>
  );
}

function TopicAccordion({
  topic, active, completedLectureIds, onSelect,
}: {
  topic: ApiExamTopic; active: ActiveNode | null; completedLectureIds: Set<string>;
  onSelect: (node: ActiveNode) => void;
}) {
  const [open, setOpen] = useState(true);

  return (
    <div className="border border-muted/20 rounded-2xl overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center justify-between w-full px-3.5 py-4 hover:bg-muted/5 transition-colors text-left gap-2"
      >
        <span className="text-sm font-semibold truncate">{topic.title}</span>
        <Icon icon="ph:caret-down" size={14}
          className={`text-subtle shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="pl-3 pb-3 flex flex-col gap-2">
          {topic.sub_topics.map((st) => (
            <SubTopicAccordion
              key={st.sub_topic_id} subTopic={st} active={active}
              completedLectureIds={completedLectureIds} onSelect={onSelect}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function SubTopicAccordion({
  subTopic, active, completedLectureIds, onSelect,
}: {
  subTopic: ApiExamSubTopic; active: ActiveNode | null; completedLectureIds: Set<string>;
  onSelect: (node: ActiveNode) => void;
}) {
  const [open, setOpen] = useState(false);
  const isTestActive = active?.kind === "test" && active.subTopicId === subTopic.sub_topic_id;

  return (
    <div className="rounded-xl bg-muted/5">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center justify-between w-full px-3 py-3 text-left gap-2"
      >
        <span className="text-sm font-medium truncate">{subTopic.title}</span>
        <Icon icon="ph:caret-down" size={13}
          className={`text-subtle shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="pl-3 pb-3 flex flex-col gap-2">
          {subTopic.modules.map((mod) => (
            <ModuleAccordion
              key={mod.module_id} module={mod} active={active}
              completedLectureIds={completedLectureIds} onSelect={onSelect}
            />
          ))}
          {subTopic.test_count > 0 && (
            <button
              type="button"
              onClick={() => onSelect({kind: "test", subTopicId: subTopic.sub_topic_id})}
              className={`flex items-center gap-2 px-2 py-2 text-left rounded-lg transition-colors ${
                isTestActive ? "bg-primary/10 text-primary" : "hover:bg-muted/10 text-subtle"
              }`}
            >
              <Icon icon="material-symbols:fact-check-outline" size={16} className="text-orange-500" />
              <span className="text-sm">Test ({subTopic.test_count})</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function ModuleAccordion({
  module: mod, active, completedLectureIds, onSelect,
}: {
  module: ApiExamModule; active: ActiveNode | null; completedLectureIds: Set<string>;
  onSelect: (node: ActiveNode) => void;
}) {
  const [open, setOpen] = useState(false);
  const allWatched = mod.lectures.length > 0 && mod.lectures.every((l) => completedLectureIds.has(l.lecture_id));
  const isQuizActive = active?.kind === "quiz" && active.moduleId === mod.module_id;
  const isPracticeActive = active?.kind === "practice" && active.moduleId === mod.module_id;

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center justify-between w-full px-2 py-2 hover:bg-muted/10 transition-colors text-left gap-2 rounded-lg"
      >
        <div className="flex items-center gap-2 min-w-0">
          <div className={`rounded-md h-4 w-4 flex items-center justify-center shrink-0 ${
            allWatched ? "bg-primary text-white" : "border border-muted/20 text-transparent"
          }`}>
            <Icon icon="ci:check" size={14} />
          </div>
          <span className="text-sm truncate">{mod.title}</span>
        </div>
        <Icon icon="ph:caret-down" size={12}
          className={`text-subtle shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="pl-6 pt-1 pb-1 flex flex-col gap-1.5">
          {mod.lectures.map((lecture) => {
            const isActive = active?.kind === "lecture" && active.lectureId === lecture.lecture_id;
            return (
              <button
                key={lecture.lecture_id}
                type="button"
                onClick={() => onSelect({kind: "lecture", lectureId: lecture.lecture_id})}
                className={`flex items-center gap-2 pl-1 pr-2 py-1.5 text-left rounded-lg transition-colors ${
                  isActive ? "border-l-primary border-l-3 bg-primary/5" : "border-l-0 hover:bg-muted/5"
                }`}
              >
                <Icon icon="solar:play-circle-bold" size={15} className={isActive ? "text-primary" : "text-subtle"} />
                <span className={`text-sm truncate ${isActive ? "text-primary" : "text-subtle"}`}>{lecture.title}</span>
                {completedLectureIds.has(lecture.lecture_id) && (
                  <Icon icon="ci:check" size={14} className="ml-auto shrink-0 text-primary" />
                )}
              </button>
            );
          })}

          {mod.quiz_count > 0 && (
            <button
              type="button"
              onClick={() => onSelect({kind: "quiz", moduleId: mod.module_id})}
              className={`flex items-center gap-2 pl-1 pr-2 py-1.5 text-left rounded-lg transition-colors ${
                isQuizActive ? "border-l-primary border-l-3 bg-primary/5" : "border-l-0 hover:bg-muted/5"
              }`}
            >
              <Icon icon="material-symbols:quiz-outline" size={15} className="text-orange-500" />
              <span className={`text-sm ${isQuizActive ? "text-primary" : "text-subtle"}`}>
                Quiz ({mod.quiz_count})
              </span>
            </button>
          )}
          {mod.practice_count > 0 && (
            <button
              type="button"
              onClick={() => onSelect({kind: "practice", moduleId: mod.module_id})}
              className={`flex items-center gap-2 pl-1 pr-2 py-1.5 text-left rounded-lg transition-colors ${
                isPracticeActive ? "border-l-primary border-l-3 bg-primary/5" : "border-l-0 hover:bg-muted/5"
              }`}
            >
              <Icon icon="material-symbols:edit-note-rounded" size={15} className="text-orange-500" />
              <span className={`text-sm ${isPracticeActive ? "text-primary" : "text-subtle"}`}>
                Practice ({mod.practice_count})
              </span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
