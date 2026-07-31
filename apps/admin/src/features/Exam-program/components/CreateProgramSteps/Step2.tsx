import {useEffect, useRef, useState} from "react";
import {Icon} from "@mcc/ui";
import {useFormContext} from "@mcc/features";
import PracticeQuestions, {
  CreatPracticeQuestionType,
} from "./PracticeQuestions";
import Step2Sidebar from "./Step2SideBar";
import LessonsCreate, {FileRow} from "./LessonsCreate";

type Leaf = {
  id: string;
  label: string;
  type: "lectures" | "practice" | "quiz" | "test";
  count?: number;
  lessons?: FileRow[];
  questions?: CreatPracticeQuestionType[];
};

export type MakeModule = {
  id: string;
  label: string;
  description?: string;
  leaves: Leaf[];
};

export type SubTopic = {
  id: string;
  label: string;
  description?: string;
  modules: MakeModule[];
  hasQuiz?: boolean;
};

export type Topic = {
  id: string;
  label: string;
  subTopics: SubTopic[];
};

export type ContentFormValues = {
  content: {
    topics: Topic[];
  };
};

// HELPERS

export function uid() {
  return Math.random().toString(36).slice(2, 9);
}

// INLINE RENAME INPUT

export function InlineRename({
  value,
  onCommit,
  onCancel,
  placeholder,
}: {
  value: string;
  onCommit: (v: string) => void;
  onCancel: () => void;
  placeholder?: string;
}) {
  const [draft, setDraft] = useState(value);
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    ref.current?.focus();
    ref.current?.select();
  }, []);

  function commit() {
    const trimmed = draft.trim();
    onCommit(trimmed || value);
  }

  return (
    <input
      ref={ref}
      value={draft}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => {
        if (e.key === "Enter") commit();
        if (e.key === "Escape") onCancel();
      }}
      placeholder={placeholder ?? "Untitled"}
      className="w-full rounded border border-violet-400 bg-white px-1.5 py-0.5 text-sm font-semibold text-gray-900 outline-none focus:ring-2 focus:ring-violet-300"
    />
  );
}

// ROOT EXPORT

function getActiveContext(topics: Topic[], leafId: string) {
  for (const topic of topics) {
    for (const sub of topic.subTopics) {
      if (leafId === `${sub.id}-quiz`) {
        return {topic, subTopic: sub, type: "quiz", label: "Quiz exercises"};
      }
      for (const mod of sub.modules) {
        const leaf = mod.leaves.find((l) => l.id === leafId);
        if (leaf) {
          return {
            topic,
            subTopic: sub,
            module: mod,
            leaf,
            type: leaf.type,
            label: leaf.label,
          };
        }
      }
    }
  }
  return null;
}

export default function ContentStep({
  onNext,
  onBack,
  exam,
  subject,
}: {
  onNext?: () => void;
  onBack?: () => void;
  exam: string;
  subject: string;
}) {
  const {watch, setValue} = useFormContext<ContentFormValues>();
  const topics = watch("content.topics") ?? [];
  function setTopics(newTopics: Topic[]) {
    setValue("content.topics", newTopics, {shouldDirty: true});
  }

  const [selectedLeaf, setSelectedLeaf] = useState("");
  const [isRenamingTopic, setIsRenamingTopic] = useState(false);

  // Description state
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [descriptionDraft, setDescriptionDraft] = useState("");

  const activeContext = getActiveContext(topics, selectedLeaf);
  const activeFiles = activeContext?.leaf?.lessons || [];
  const activeQuestions = activeContext?.leaf?.questions || [];

  function handleRenameTopic(id: string, newLabel: string) {
    setTopics(topics.map((t) => (t.id === id ? {...t, label: newLabel} : t)));
  }

  // ── Description Logic ──

  const activeDesc = activeContext?.subTopic?.description ?? "";

  function startEditingDescription() {
    setDescriptionDraft(activeDesc);
    setIsEditingDescription(true);
  }

  function handleSaveDescription() {
    if (!activeContext) return;
    const {topic, subTopic} = activeContext;
    setTopics(
      topics.map((t) =>
        t.id === topic.id
          ? {
              ...t,
              subTopics: t.subTopics.map((s) =>
                s.id === subTopic.id
                  ? {
                      ...s,
                      description: descriptionDraft,
                    }
                  : s,
              ),
            }
          : t,
      ),
    );
    setIsEditingDescription(false);
  }

  // ── File Logic ──

  function setLeafFiles(newFiles: FileRow[]) {
    if (!activeContext) return;
    const {topic, subTopic, module, leaf, type} = activeContext;
    if (module && leaf) {
      setTopics(
        topics.map((t) =>
          t.id === topic.id
            ? {
                ...t,
                subTopics: t.subTopics.map((s) =>
                  s.id === subTopic.id
                    ? {
                        ...s,
                        modules: s.modules.map((m) =>
                          m.id === module.id
                            ? {
                                ...m,
                                leaves: m.leaves.map((l) =>
                                  l.id === leaf.id
                                    ? {
                                        ...l,
                                        lessons: newFiles,
                                        count: newFiles.length,
                                      }
                                    : l,
                                ),
                              }
                            : m,
                        ),
                      }
                    : s,
                ),
              }
            : t,
        ),
      );
    }
  }

  function setLeafQuestions(newQuestions: CreatPracticeQuestionType[]) {
    if (!activeContext) return;
    const {topic, subTopic, module, leaf} = activeContext;
    if (module && leaf) {
      setTopics(
        topics.map((t) =>
          t.id === topic.id
            ? {
                ...t,
                subTopics: t.subTopics.map((s) =>
                  s.id === subTopic.id
                    ? {
                        ...s,
                        modules: s.modules.map((m) =>
                          m.id === module.id
                            ? {
                                ...m,
                                leaves: m.leaves.map((l) =>
                                  l.id === leaf.id
                                    ? {
                                        ...l,
                                        questions: newQuestions,
                                        count: newQuestions.length,
                                      }
                                    : l,
                                ),
                              }
                            : m,
                        ),
                      }
                    : s,
                ),
              }
            : t,
        ),
      );
    }
  }

  return (
    <div className="flex h-full gap-0">
      <Step2Sidebar
        topics={topics}
        selectedLeaf={selectedLeaf}
        onSelectLeaf={setSelectedLeaf}
        onTopicsChange={setTopics}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex-1 overflow-y-auto px-8 py-6">
          {topics.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100">
                <Icon
                  icon="lucide:book-open"
                  size={24}
                  className="text-gray-400"
                />
              </div>
              <p className="text-sm font-medium text-gray-500">
                Add a topic to get started
              </p>
              <p className="text-xs text-gray-400">
                Use the sidebar to create topics and sub-topics
              </p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <h1 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
                  <span className="uppercase">
                    {exam} / {subject} /
                  </span>
                  {isRenamingTopic ? (
                    <div className="flex items-center">
                      <InlineRename
                        value={activeContext?.topic?.label || ""}
                        placeholder="Topic name"
                        onCommit={(v) => {
                          if (activeContext?.topic) {
                            handleRenameTopic(activeContext.topic.id, v);
                          }
                          setIsRenamingTopic(false);
                        }}
                        onCancel={() => setIsRenamingTopic(false)}
                      />
                    </div>
                  ) : (
                    <>
                      <span className="text-gray-400">
                        {activeContext?.topic?.label || "Select a topic"}
                      </span>
                      {activeContext?.topic && (
                        <button
                          type="button"
                          onClick={() => setIsRenamingTopic(true)}
                          className="flex h-6 w-6 items-center justify-center rounded-md hover:bg-gray-100"
                        >
                          <Icon
                            icon="lucide:pencil"
                            size={14}
                            className="text-gray-400"
                          />
                        </button>
                      )}
                    </>
                  )}
                </h1>
                <button
                  type="button"
                  className="flex items-center gap-1.5 rounded-full border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  <Icon icon="lucide:settings" size={16} />
                  Settings
                </button>
              </div>

              {activeContext?.subTopic && (
                <div className="mt-5">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold">
                      About {activeContext?.subTopic?.label || "sub-topic"}
                    </p>
                    {!isEditingDescription && (
                      <button
                        type="button"
                        onClick={startEditingDescription}
                        className="flex h-6 w-6 items-center justify-center rounded-md hover:bg-gray-100"
                      >
                        <Icon
                          icon="lucide:pencil"
                          size={14}
                          className="text-gray-400"
                        />
                      </button>
                    )}
                  </div>
                  {isEditingDescription ? (
                    <div className="mt-1.5 flex flex-col gap-2">
                      <textarea
                        value={descriptionDraft}
                        onChange={(e) => setDescriptionDraft(e.target.value)}
                        className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 outline-none focus:border-violet-400 focus:ring-1 focus:ring-violet-400"
                        rows={3}
                        placeholder="Add a description..."
                        autoFocus
                      />
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={handleSaveDescription}
                          className="rounded bg-violet-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-violet-700"
                        >
                          Save
                        </button>
                        <button
                          type="button"
                          onClick={() => setIsEditingDescription(false)}
                          className="rounded px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="mt-1.5 text-sm leading-relaxed text-gray-500">
                      {activeDesc || "No description provided."}
                    </p>
                  )}
                </div>
              )}

              {activeContext?.module && (
                <div className="mt-6 flex items-center gap-2 border-b border-gray-100 pb-4">
                  <span className="text-sm font-semibold text-gray-900">
                    {activeContext?.module?.label || "Module"}
                  </span>
                  <span className="text-sm text-gray-400">
                    / {activeContext?.label || "Content"}
                  </span>
                  <Icon
                    icon="lucide:refresh-cw"
                    size={12}
                    className="text-gray-300"
                  />
                </div>
              )}

              {activeContext?.leaf?.type === "lectures" && (
                <LessonsCreate
                  files={activeFiles}
                  onFilesChange={setLeafFiles}
                  addLabel={
                    activeContext?.leaf?.label?.toLowerCase() || "content"
                  }
                />
              )}

              {activeContext?.leaf?.type === "practice" && (
                <PracticeQuestions
                  questions={activeQuestions}
                  onChange={setLeafQuestions}
                  //   contextLabel={
                  //     activeContext?.module?.label ||
                  //     activeContext?.subTopic?.label ||
                  //     ""
                  //   }
                />
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-gray-100 px-8 py-4">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={onBack}
              className="text-sm font-medium text-gray-600 hover:text-gray-900"
            >
              Back
            </button>
            <button
              type="button"
              className="text-sm font-medium text-gray-600 hover:text-gray-900"
            >
              Cancel
            </button>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="rounded-full border border-gray-200 px-5 py-2.5 text-sm font-medium text-gray-800 hover:bg-gray-50"
            >
              Save as draft
            </button>
            <button
              type="button"
              onClick={onNext}
              className="rounded-full bg-violet-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-violet-700"
            >
              Save & continue
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
