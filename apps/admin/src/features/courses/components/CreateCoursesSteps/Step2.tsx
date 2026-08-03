import {useEffect, useRef, useState} from "react";
import {Button, Icon} from "@mcc/ui";
import {useFormContext} from "@mcc/features";
import Step2Sidebar from "./Step2SideBar";
import PracticeQuestions, {CreatPracticeQuestionType} from "./CreatePractice";
import LessonsCreate, {FileRow} from "./CreateLessons";
// import ContentReorderPanel from "./ContentReorderPanel";

export type PracticeSet = {
  id: string;
  name: string;
  questions: CreatPracticeQuestionType[];
};

export type LessonContent = {
  id: string;
  type: "lesson";
  title: string;
  lessons: FileRow[];
};

type Quiz = {
  id: string;
  questions: CreatPracticeQuestionType[];
  settings: {
    timer?: number;
    passingScore?: number;
  };
};

export type PracticeContent = {
  id: string;
  type: "practice";
  title: string;
  practices: PracticeSet[];
};

export type QuizContent = {
  id: string;
  type: "quiz";
  title: string;
  quiz: Quiz;
};

export type ModuleContent = LessonContent | PracticeContent | QuizContent;

export type MakeModule = {
  id: string;
  label: string;
  description?: string;
  content: ModuleContent[];
};

export type Topic = {
  id: string;
  label: string;
  description?: string;
  modules: MakeModule[];
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

// PRACTICE MANAGER
// A leaf of type "practice" now holds a list of named practice sets instead
// of one flat questions array. This wraps the existing PracticeQuestions
// editor (unchanged) and adds the create/select/rename layer on top.

function PracticeManager({
  practices,
  onChange,
}: {
  practices: PracticeSet[];
  onChange: (practices: PracticeSet[]) => void;
}) {
  const [selectedPracticeId, setSelectedPracticeId] = useState<string | null>(
    practices[0]?.id ?? null,
  );
  const [renamingId, setRenamingId] = useState<string | null>(null);

  function addPractice() {
    const p: PracticeSet = {id: uid(), name: "", questions: []};
    onChange([...practices, p]);
    setSelectedPracticeId(p.id);
    setRenamingId(p.id);
  }

  function renamePractice(id: string, name: string) {
    onChange(practices.map((p) => (p.id === id ? {...p, name} : p)));
    setRenamingId(null);
  }

  function deletePractice(id: string) {
    onChange(practices.filter((p) => p.id !== id));
    setSelectedPracticeId((current) => (current === id ? null : current));
  }

  function setPracticeQuestions(
    id: string,
    questions: CreatPracticeQuestionType[],
  ) {
    onChange(practices.map((p) => (p.id === id ? {...p, questions} : p)));
  }

  const selectedPractice =
    practices.find((p) => p.id === selectedPracticeId) ?? null;

  return (
    <div className="mt-6 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-gray-900">Practices</p>
        <Button
          type="button"
          variant="outline"
          shadow={"sm"}
          size={"sm"}
          onClick={addPractice}
          leftIcon={<Icon icon="lucide:plus" size={14} />}
        >
          Add practice
        </Button>
      </div>

      {practices.length === 0 ? (
        <p className="text-sm text-gray-400">
          No practices yet. Click &ldquo;Add practice&rdquo; to create one.
        </p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {practices.map((p) => {
            const isSelected = p.id === selectedPracticeId;
            const isRenaming = renamingId === p.id;

            if (isRenaming) {
              return (
                <div key={p.id} className="w-40">
                  <InlineRename
                    value={p.name}
                    placeholder="Practice name"
                    onCommit={(v) => renamePractice(p.id, v)}
                    onCancel={() => setRenamingId(null)}
                  />
                </div>
              );
            }

            return (
              <div
                key={p.id}
                className={`group flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition-colors ${
                  isSelected
                    ? "border-violet-500 bg-violet-50 text-violet-700"
                    : "border-gray-200 text-gray-600 hover:border-gray-300"
                }`}
              >
                <button
                  type="button"
                  onClick={() => setSelectedPracticeId(p.id)}
                  className="flex items-center gap-1.5"
                >
                  <span>{p.name || "Untitled practice"}</span>
                  <span className="text-xs text-gray-400">
                    ({p.questions.length})
                  </span>
                </button>
                <span className="hidden items-center gap-1 group-hover:flex">
                  <button
                    type="button"
                    onClick={() => setRenamingId(p.id)}
                    aria-label="Rename practice"
                  >
                    <Icon
                      icon="lucide:pencil"
                      size={11}
                      className="text-gray-400"
                    />
                  </button>
                  <button
                    type="button"
                    onClick={() => deletePractice(p.id)}
                    aria-label="Delete practice"
                  >
                    <Icon
                      icon="lucide:trash-2"
                      size={11}
                      className="text-red-400"
                    />
                  </button>
                </span>
              </div>
            );
          })}
        </div>
      )}

      {selectedPractice && (
        <div className="mt-2 border-t border-gray-100 pt-4">
          <p className="mb-3 text-xs font-medium uppercase tracking-wide text-gray-400">
            Questions in {selectedPractice.name || "this practice"}
          </p>
          <PracticeQuestions
            questions={selectedPractice.questions}
            onChange={(qs) => setPracticeQuestions(selectedPractice.id, qs)}
          />
        </div>
      )}
    </div>
  );
}

// ROOT EXPORT

// At least one topic -> module chain must exist before content is
// considered usable (a module with zero leaves still counts, since leaves
// are pre-seeded whenever a module is created).
export function hasCompleteContent(topics: Topic[]) {
  return topics.some((t) => t.modules.length > 0);
}

function getActiveContext(topics: Topic[], contentId: string) {
  for (const topic of topics) {
    for (const mod of topic.modules) {
      const content = mod.content.find((item) => item.id === contentId);

      if (content) {
        return {
          topic,
          module: mod,
          content,
          type: content.type,
          label: content.title,
        };
      }
    }
  }

  return null;
}

export default function ContentStep({
  onNext,
  onBack,
  courseName,
}: {
  onNext?: () => void;
  onBack?: () => void;
  courseName: string;
}) {
  const {watch, setValue} = useFormContext<ContentFormValues>();
  const topics = watch("content.topics") ?? [];
  function setTopics(newTopics: Topic[]) {
    setValue("content.topics", newTopics, {shouldDirty: true});
  }

  const [selectedContentId, setSelectedContentId] = useState("");
  const [isRenamingTopic, setIsRenamingTopic] = useState(false);
  const [isReorderOpen, setIsReorderOpen] = useState(false);

  function updateTopic(updated: Topic) {
    setTopics(topics.map((t) => (t.id === updated.id ? updated : t)));
  }

  // Description state
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [descriptionDraft, setDescriptionDraft] = useState("");

  const activeContext = getActiveContext(topics, selectedContentId);
  const activeFiles =
    activeContext?.content.type === "lesson"
      ? activeContext.content.lessons
      : [];

  const activePractices =
    activeContext?.content.type === "practice"
      ? activeContext.content.practices
      : [];

  function handleRenameTopic(id: string, newLabel: string) {
    setTopics(topics.map((t) => (t.id === id ? {...t, label: newLabel} : t)));
  }

  // ── Description Logic ──
  // description lives on the topic itself, since sub-topics are gone

  const activeDesc = activeContext?.topic?.description ?? "";

  function startEditingDescription() {
    setDescriptionDraft(activeDesc);
    setIsEditingDescription(true);
  }

  function handleSaveDescription() {
    if (!activeContext?.topic) return;
    const {topic} = activeContext;
    setTopics(
      topics.map((t) =>
        t.id === topic.id ? {...t, description: descriptionDraft} : t,
      ),
    );
    setIsEditingDescription(false);
  }

  function updateModuleContent(
    topicId: string,
    moduleId: string,
    contentId: string,
    updater: (content: ModuleContent) => ModuleContent,
  ) {
    setTopics(
      topics.map((topic) =>
        topic.id !== topicId
          ? topic
          : {
              ...topic,
              modules: topic.modules.map((module) =>
                module.id !== moduleId
                  ? module
                  : {
                      ...module,
                      content: module.content.map((item) =>
                        item.id !== contentId ? item : updater(item),
                      ),
                    },
              ),
            },
      ),
    );
  }

  function setLessonFiles(files: FileRow[]) {
    if (!activeContext) return;

    updateModuleContent(
      activeContext.topic.id,
      activeContext.module.id,
      activeContext.content.id,
      (content) =>
        content.type === "lesson"
          ? {
              ...content,
              lessons: files,
            }
          : content,
    );
  }

  function setPractices(practices: PracticeSet[]) {
    if (!activeContext) return;

    updateModuleContent(
      activeContext.topic.id,
      activeContext.module.id,
      activeContext.content.id,
      (content) =>
        content.type === "practice"
          ? {
              ...content,
              practices,
            }
          : content,
    );
  }

  return (
    <div className="flex h-full gap-0">
      <Step2Sidebar
        topics={topics}
        selectedContentId={selectedContentId}
        onSelectContent={setSelectedContentId}
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
                Use the sidebar to create topics and modules
              </p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <h1 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
                  <span className="uppercase">{courseName} /</span>
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
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    shadow={"sm"}
                    size={"sm"}
                    disabled={!activeContext?.topic}
                    onClick={() => setIsReorderOpen(true)}
                    leftIcon={<Icon icon="lucide:arrow-up-down" size={16} />}
                  >
                    Reorder
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    shadow={"sm"}
                    size={"sm"}
                    leftIcon={<Icon icon="lucide:settings" size={16} />}
                  >
                    Settings
                  </Button>
                </div>
              </div>

              {activeContext?.topic && (
                <div className="mt-5">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold">
                      About {activeContext.topic.label || "topic"}
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
                </div>
              )}

              {activeContext?.content.type === "lesson" && (
                <LessonsCreate
                  files={activeFiles}
                  onFilesChange={setLessonFiles}
                />
              )}

              {activeContext?.content.type === "practice" && (
                <PracticeManager
                  practices={activePractices}
                  onChange={setPractices}
                />
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-gray-100 px-8 py-4">
          <div className="flex items-center gap-4">
            <Button
              type="button"
              variant="ghost"
              onClick={onBack}
              className="text-sm font-medium text-gray-600 hover:text-gray-900"
            >
              Back
            </Button>
          </div>
          <div className="flex items-center gap-3">
            <Button type="button" variant="outline">
              Save as draft
            </Button>
            <Button
              type="button"
              disabled={!hasCompleteContent(topics)}
              onClick={onNext}
              className="text-nowrap"
            >
              Save & continue
            </Button>
          </div>
        </div>
      </div>

      {isReorderOpen && activeContext?.topic && (
        <></>
        // <ContentReorderPanel
        //   topic={activeContext.topic}
        //   onClose={() => setIsReorderOpen(false)}
        //   onTopicChange={updateTopic}
        // />
      )}
    </div>
  );
}
