import {useEffect, useRef, useState} from "react";
import {Button, Icon} from "@mcc/ui";
import {FormInputs, useFormContext} from "@mcc/features";
import Step2Sidebar from "./Step2SideBar";
import PracticeQuestions from "./CreatePractice";
import LessonsCreate from "./CreateLessons";
import ContentReorderPanel from "./ContentReorder";
import {
  ContentFormValues,
  CreatPracticeQuestionType,
  ExerciseModuleContent,
  ExerciseSet,
  FileRow,
  LessonModuleContent,
  MakeModule,
  ModuleContent,
  PracticeModuleContent,
  PracticeSet,
  QuizModuleContent,
  Topic,
} from "@/src/features/courses/types/types";

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

// MANAGERS

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

function QuizManager({
  quizzes,
  onChange,
}: {
  quizzes: QuizModuleContent[];
  onChange: (quizzes: QuizModuleContent[]) => void;
}) {
  const [selectedQuizId, setSelectedQuizId] = useState<string | null>(
    quizzes[0]?.id ?? null,
  );
  const [renamingId, setRenamingId] = useState<string | null>(null);

  function addQuiz() {
    const quiz: QuizModuleContent = {
      id: uid(),
      type: "quiz",
      title: "",
      questions: [],
      settings: {},
    };
    onChange([...quizzes, quiz]);
    setSelectedQuizId(quiz.id);
    setRenamingId(quiz.id);
  }

  function renameQuiz(id: string, title: string) {
    onChange(quizzes.map((quiz) => (quiz.id === id ? {...quiz, title} : quiz)));
    setRenamingId(null);
  }

  function deleteQuiz(id: string) {
    onChange(quizzes.filter((quiz) => quiz.id !== id));
    setSelectedQuizId((current) => (current === id ? null : current));
  }

  function setQuizQuestions(
    id: string,
    questions: CreatPracticeQuestionType[],
  ) {
    onChange(
      quizzes.map((quiz) => (quiz.id === id ? {...quiz, questions} : quiz)),
    );
  }

  function updateQuizSettings(
    id: string,
    key: "timer" | "passingScore",
    value: number | undefined,
  ) {
    onChange(
      quizzes.map((quiz) =>
        quiz.id === id
          ? {
              ...quiz,
              settings: {...quiz.settings, [key]: value},
            }
          : quiz,
      ),
    );
  }

  function updateQuizTitle(id: string, title: string) {
    onChange(quizzes.map((quiz) => (quiz.id === id ? {...quiz, title} : quiz)));
  }

  const selectedQuiz =
    quizzes.find((quiz) => quiz.id === selectedQuizId) ?? null;

  return (
    <div className="mt-6 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-gray-900">Quizzes</p>
        <Button
          type="button"
          variant="outline"
          shadow={"sm"}
          size={"sm"}
          onClick={addQuiz}
          leftIcon={<Icon icon="lucide:plus" size={14} />}
        >
          Add quiz
        </Button>
      </div>

      {quizzes.length === 0 ? (
        <p className="text-sm text-gray-400">
          No quizzes yet. Click &ldquo;Add quiz&rdquo; to create one.
        </p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {quizzes.map((quiz) => {
            const isSelected = quiz.id === selectedQuizId;
            const isRenaming = renamingId === quiz.id;

            if (isRenaming) {
              return (
                <div key={quiz.id} className="w-40">
                  <InlineRename
                    value={quiz.title}
                    placeholder="Quiz title"
                    onCommit={(value) => renameQuiz(quiz.id, value)}
                    onCancel={() => setRenamingId(null)}
                  />
                </div>
              );
            }

            return (
              <div
                key={quiz.id}
                className={`group flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition-colors ${
                  isSelected
                    ? "border-violet-500 bg-violet-50 text-violet-700"
                    : "border-gray-200 text-gray-600 hover:border-gray-300"
                }`}
              >
                <button
                  type="button"
                  onClick={() => setSelectedQuizId(quiz.id)}
                  className="flex items-center gap-1.5"
                >
                  <span>{quiz.title || "Untitled quiz"}</span>
                  <span className="text-xs text-gray-400">
                    ({quiz.questions.length})
                  </span>
                </button>
                <span className="hidden items-center gap-1 group-hover:flex">
                  <button
                    type="button"
                    onClick={() => setRenamingId(quiz.id)}
                    aria-label="Rename quiz"
                  >
                    <Icon
                      icon="lucide:pencil"
                      size={11}
                      className="text-gray-400"
                    />
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteQuiz(quiz.id)}
                    aria-label="Delete quiz"
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

      {selectedQuiz && (
        <div className="mt-2 border-t border-gray-100 pt-4">
          <div className="mb-4 grid gap-4 md:grid-cols-2">
            <FormInputs
              label="Quizzz title"
              value={selectedQuiz.title}
              onChange={(value) => updateQuizTitle(selectedQuiz.id, value)}
              placeholder="Enter quiz title"
            />

            <label className="flex flex-col gap-1">
              <span className="text-sm font-medium text-gray-700">
                Timer (minutes)
              </span>
              <input
                type="number"
                min="0"
                value={selectedQuiz.settings.timer ?? ""}
                onChange={(event) =>
                  updateQuizSettings(
                    selectedQuiz.id,
                    "timer",
                    event.target.value === ""
                      ? undefined
                      : Number(event.target.value),
                  )
                }
                placeholder="Optional"
                className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-violet-400"
              />
            </label>

            <label className="flex flex-col gap-1 md:col-span-2">
              <span className="text-sm font-medium text-gray-700">
                Passing score (%)
              </span>
              <input
                type="number"
                min="0"
                max="100"
                value={selectedQuiz.settings.passingScore ?? ""}
                onChange={(event) =>
                  updateQuizSettings(
                    selectedQuiz.id,
                    "passingScore",
                    event.target.value === ""
                      ? undefined
                      : Number(event.target.value),
                  )
                }
                placeholder="Optional"
                className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-violet-400"
              />
            </label>
          </div>

          <p className="mb-3 text-xs font-medium uppercase tracking-wide text-gray-400">
            Questions in {selectedQuiz.title || "this quiz"}
          </p>
          <PracticeQuestions
            questions={selectedQuiz.questions}
            onChange={(questions) =>
              setQuizQuestions(selectedQuiz.id, questions)
            }
          />
        </div>
      )}
    </div>
  );
}

function ExerciseManager({
  exercises,
  onChange,
}: {
  exercises: ExerciseSet[];
  onChange: (exercises: ExerciseSet[]) => void;
}) {
  const [selectedExerciseId, setSelectedExerciseId] = useState<string | null>(
    exercises[0]?.id ?? null,
  );
  const [renamingId, setRenamingId] = useState<string | null>(null);

  function addExercise() {
    const e: ExerciseSet = {id: uid(), name: "", questions: []};
    onChange([...exercises, e]);
    setSelectedExerciseId(e.id);
    setRenamingId(e.id);
  }

  function renameExercise(id: string, name: string) {
    onChange(exercises.map((e) => (e.id === id ? {...e, name} : e)));
    setRenamingId(null);
  }

  function deleteExercise(id: string) {
    onChange(exercises.filter((e) => e.id !== id));
    setSelectedExerciseId((current) => (current === id ? null : current));
  }

  function setExerciseQuestions(
    id: string,
    questions: CreatPracticeQuestionType[],
  ) {
    onChange(exercises.map((e) => (e.id === id ? {...e, questions} : e)));
  }

  const selectedExercise =
    exercises.find((e) => e.id === selectedExerciseId) ?? null;

  return (
    <div className="mt-6 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-gray-900">Exercises</p>
        <Button
          type="button"
          variant="outline"
          shadow={"sm"}
          size={"sm"}
          onClick={addExercise}
          leftIcon={<Icon icon="lucide:plus" size={14} />}
        >
          Add exercise
        </Button>
      </div>

      {exercises.length === 0 ? (
        <p className="text-sm text-gray-400">
          No exercises yet. Click &ldquo;Add exercise&rdquo; to create one.
        </p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {exercises.map((e) => {
            const isSelected = e.id === selectedExerciseId;
            const isRenaming = renamingId === e.id;

            if (isRenaming) {
              return (
                <div key={e.id} className="w-40">
                  <InlineRename
                    value={e.name}
                    placeholder="Exercise name"
                    onCommit={(v) => renameExercise(e.id, v)}
                    onCancel={() => setRenamingId(null)}
                  />
                </div>
              );
            }

            return (
              <div
                key={e.id}
                className={`group flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition-colors ${
                  isSelected
                    ? "border-violet-500 bg-violet-50 text-violet-700"
                    : "border-gray-200 text-gray-600 hover:border-gray-300"
                }`}
              >
                <button
                  type="button"
                  onClick={() => setSelectedExerciseId(e.id)}
                  className="flex items-center gap-1.5"
                >
                  <span>{e.name || "Untitled exercise"}</span>
                  <span className="text-xs text-gray-400">
                    ({e.questions.length})
                  </span>
                </button>
                <span className="hidden items-center gap-1 group-hover:flex">
                  <button
                    type="button"
                    onClick={() => setRenamingId(e.id)}
                    aria-label="Rename exercise"
                  >
                    <Icon
                      icon="lucide:pencil"
                      size={11}
                      className="text-gray-400"
                    />
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteExercise(e.id)}
                    aria-label="Delete exercise"
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

      {selectedExercise && (
        <div className="mt-2 border-t border-gray-100 pt-4">
          <p className="mb-3 text-xs font-medium uppercase tracking-wide text-gray-400">
            Questions in {selectedExercise.name || "this exercise"}
          </p>
          <PracticeQuestions
            questions={selectedExercise.questions}
            onChange={(qs) => setExerciseQuestions(selectedExercise.id, qs)}
          />
        </div>
      )}
    </div>
  );
}

export function hasCompleteContent(topics: Topic[]) {
  return topics.some((t) => t.modules.length > 0);
}

export function lessonsViewId(moduleId: string) {
  return `lessons:${moduleId}`;
}
export function practiceViewId(moduleId: string) {
  return `practice:${moduleId}`;
}
export function exerciseViewId(moduleId: string) {
  return `exercise:${moduleId}`;
}

export function quizViewId(moduleId: string) {
  return `quiz:${moduleId}`;
}

function getActiveContext(topics: Topic[], selection: string) {
  for (const topic of topics) {
    for (const mod of topic.modules) {
      if (selection === lessonsViewId(mod.id)) {
        return {
          topic,
          module: mod,
          type: "lesson" as const,
          label: "Lessons",
          files: mod.content.filter(
            (c): c is LessonModuleContent => c.type === "lesson",
          ),
        };
      }

      if (selection === practiceViewId(mod.id)) {
        return {
          topic,
          module: mod,
          type: "practice" as const,
          label: "Practice",
          practices: mod.content.filter(
            (c): c is PracticeModuleContent => c.type === "practice",
          ),
        };
      }

      if (selection === exerciseViewId(mod.id)) {
        return {
          topic,
          module: mod,
          type: "exercise" as const,
          label: "Exercise",
          exercises: mod.content.filter(
            (c): c is ExerciseModuleContent => c.type === "exercise",
          ),
        };
      }

      if (selection === quizViewId(mod.id)) {
        return {
          topic,
          module: mod,
          type: "quiz" as const,
          label: "Quiz",
          quizzes: mod.content.filter(
            (c): c is QuizModuleContent => c.type === "quiz",
          ),
        };
      }
    }
  }

  return null;
}

// main export
export default function ContentStep({
  onNext,
  onBack,
  courseName,
  onSaveDraft,
}: {
  onNext?: () => void;
  onBack?: () => void;
  courseName: string;
  onSaveDraft?: () => void;
}) {
  const {watch, setValue, getValues} = useFormContext<ContentFormValues>();
  const topics = watch("content.topics") ?? [];
  function setTopics(newTopics: Topic[]) {
    setValue("content.topics", newTopics, {shouldDirty: true});
  }

  const [selectedContentId, setSelectedContentId] = useState("");
  const [isRenamingTopic, setIsRenamingTopic] = useState(false);
  const [isReorderOpen, setIsReorderOpen] = useState(false);

  const activeContext = getActiveContext(topics, selectedContentId);
  const activeFiles =
    activeContext?.type === "lesson" ? activeContext.files : [];

  const activePractices =
    activeContext?.type === "practice" ? activeContext.practices : [];

  const activeExercises =
    activeContext?.type === "exercise" ? activeContext.exercises : [];

  const activeQuizzes =
    activeContext?.type === "quiz" ? activeContext.quizzes : [];

  function handleRenameTopic(id: string, newLabel: string) {
    setTopics(topics.map((t) => (t.id === id ? {...t, label: newLabel} : t)));
  }

  function replaceContentByType<T extends ModuleContent["type"]>(
    topicId: string,
    moduleId: string,
    type: T,
    nextItems: Extract<ModuleContent, {type: T}>[],
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
                      content: [
                        ...module.content.filter((item) => item.type !== type),
                        ...nextItems,
                      ],
                    },
              ),
            },
      ),
    );
  }

  function setLessonFiles(files: FileRow[]) {
    if (!activeContext || activeContext.type !== "lesson") return;

    replaceContentByType(
      activeContext.topic.id,
      activeContext.module.id,
      "lesson",
      files.map((f) => ({...f, type: "lesson" as const})),
    );
  }

  function setPractices(practices: PracticeSet[]) {
    if (!activeContext || activeContext.type !== "practice") return;

    replaceContentByType(
      activeContext.topic.id,
      activeContext.module.id,
      "practice",
      practices.map((p) => ({...p, type: "practice" as const})),
    );
  }

  function setExercises(exercises: ExerciseSet[]) {
    if (!activeContext || activeContext.type !== "exercise") return;

    replaceContentByType(
      activeContext.topic.id,
      activeContext.module.id,
      "exercise",
      exercises.map((e) => ({...e, type: "exercise" as const})),
    );
  }

  function setQuizzes(quizzes: QuizModuleContent[]) {
    if (!activeContext || activeContext.type !== "quiz") return;

    replaceContentByType(
      activeContext.topic.id,
      activeContext.module.id,
      "quiz",
      quizzes.map((quiz) => ({...quiz, type: "quiz" as const})),
    );
  }

  function updateModule(updatedModule: MakeModule) {
    if (!activeContext?.topic) return;
    const topic = activeContext.topic;

    setTopics(
      topics.map((t) =>
        t.id !== topic.id
          ? t
          : {
              ...t,
              modules: t.modules.map((m) =>
                m.id === updatedModule.id ? updatedModule : m,
              ),
            },
      ),
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
                    disabled={!activeContext?.module}
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

              {activeContext?.type === "lesson" && (
                <LessonsCreate
                  files={activeFiles}
                  onFilesChange={setLessonFiles}
                />
              )}

              {activeContext?.type === "practice" && (
                <PracticeManager
                  practices={activePractices}
                  onChange={setPractices}
                />
              )}

              {activeContext?.type === "exercise" && (
                <ExerciseManager
                  exercises={activeExercises}
                  onChange={setExercises}
                />
              )}

              {activeContext?.type === "quiz" && (
                <QuizManager quizzes={activeQuizzes} onChange={setQuizzes} />
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
            <Button type="button" variant="outline" onClick={onSaveDraft}>
              Save as draft
            </Button>
            <Button
              type="button"
              variant={hasCompleteContent(topics) ? "primary" : "secondary"}
              disabled={!hasCompleteContent(topics)}
              onClick={onNext}
              className={!hasCompleteContent(topics) ? "text-muted/60" : ""}
            >
              Save & continue
            </Button>
          </div>
        </div>
      </div>

      {isReorderOpen && activeContext?.topic && (
        <ContentReorderPanel
          module={activeContext.module}
          onClose={() => setIsReorderOpen(false)}
          onModuleChange={updateModule}
        />
      )}
    </div>
  );
}
