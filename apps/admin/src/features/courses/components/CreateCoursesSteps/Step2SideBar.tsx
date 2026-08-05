import {Icon, Button} from "@mcc/ui";
import {useState, useRef, useEffect} from "react";
import {
  InlineRename,
  MakeModule,
  QuizModuleContent,
  Topic,
  lessonsViewId,
  practiceViewId,
  uid,
} from "./Step2";

const QUIZ_ICON = "lucide:help-circle";

function makeQuiz(title = ""): QuizModuleContent {
  return {
    id: uid(),
    type: "quiz",
    title,
    questions: [],
    settings: {},
  };
}

function makeModule(): MakeModule {
  return {
    id: uid(),
    label: "",
    content: [],
  };
}

function makeTopic(): Topic {
  return {id: uid(), label: "", modules: []};
}

export default function Step2Sidebar({
  topics,
  selectedContentId,
  onSelectContent,
  onTopicsChange,
}: {
  topics: Topic[];
  selectedContentId: string;
  onSelectContent: (id: string) => void;
  onTopicsChange: (topics: Topic[]) => void;
}) {
  // Which node's ⋮ menu is open — keyed as "topic:<id>" or "module:<topicId>:<modId>"
  const [menuOpenFor, setMenuOpenFor] = useState<string | null>(null);
  // Which topic or module is being renamed
  const [renamingId, setRenamingId] = useState<string | null>(null);
  // Which content item is showing a delete confirmation
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  // Which modules are collapsed
  const [collapsedModules, setCollapsedModules] = useState<
    Record<string, boolean>
  >({});

  const sidebarRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (
        menuOpenFor &&
        sidebarRef.current &&
        !sidebarRef.current.contains(e.target as Node)
      ) {
        setMenuOpenFor(null);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [menuOpenFor]);

  // ── Topic ──

  function addTopic() {
    const t = makeTopic();
    onTopicsChange([...topics, t]);
    setRenamingId(t.id);
  }

  function renameTopic(topicId: string, label: string) {
    onTopicsChange(topics.map((t) => (t.id === topicId ? {...t, label} : t)));
    setRenamingId(null);
  }

  function deleteTopic(topicId: string) {
    onTopicsChange(topics.filter((t) => t.id !== topicId));
    setMenuOpenFor(null);
  }

  // ── Module ──

  function addModule(topicId: string) {
    const mod = makeModule();
    onTopicsChange(
      topics.map((t) =>
        t.id === topicId ? {...t, modules: [...t.modules, mod]} : t,
      ),
    );
    setMenuOpenFor(null);
    setRenamingId(mod.id);
  }

  function renameModule(topicId: string, moduleId: string, label: string) {
    onTopicsChange(
      topics.map((t) =>
        t.id === topicId
          ? {
              ...t,
              modules: t.modules.map((m) =>
                m.id === moduleId ? {...m, label} : m,
              ),
            }
          : t,
      ),
    );
    setRenamingId(null);
  }

  function deleteModule(topicId: string, moduleId: string) {
    onTopicsChange(
      topics.map((t) =>
        t.id === topicId
          ? {...t, modules: t.modules.filter((m) => m.id !== moduleId)}
          : t,
      ),
    );
  }

  function toggleModule(id: string) {
    setCollapsedModules((prev) => ({...prev, [id]: !prev[id]}));
  }

  // ── Content (quizzes — lessons/practice come from their own editors) ──

  function addQuiz(topicId: string, moduleId: string) {
    const item = makeQuiz();
    onTopicsChange(
      topics.map((t) =>
        t.id === topicId
          ? {
              ...t,
              modules: t.modules.map((m) =>
                m.id === moduleId ? {...m, content: [...m.content, item]} : m,
              ),
            }
          : t,
      ),
    );
    setMenuOpenFor(null);
  }

  function deleteContent(topicId: string, moduleId: string, contentId: string) {
    onTopicsChange(
      topics.map((t) =>
        t.id === topicId
          ? {
              ...t,
              modules: t.modules.map((m) =>
                m.id === moduleId
                  ? {...m, content: m.content.filter((c) => c.id !== contentId)}
                  : m,
              ),
            }
          : t,
      ),
    );
    setConfirmDeleteId(null);
    if (selectedContentId === contentId) onSelectContent("");
  }

  const menuKey = {
    topic: (id: string) => `topic:${id}`,
    module: (topicId: string, modId: string) => `module:${topicId}:${modId}`,
  };

  return (
    <div
      ref={sidebarRef}
      className="flex w-72 shrink-0 flex-col rounded-2xl border border-muted/30"
    >
      <div className="flex flex-1 flex-col overflow-hidden rounded-t-2xl bg-gray-50/60">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-4">
          <span className="text-sm font-medium text-gray-500">
            Create your program
          </span>
          <span className="flex items-center gap-1 text-gray-400">
            <button type="button" className="rounded p-1 hover:bg-gray-100">
              <Icon icon="lucide:undo-2" size={16} />
            </button>
            <button type="button" className="rounded p-1 hover:bg-gray-100">
              <Icon icon="lucide:redo-2" size={16} />
            </button>
          </span>
        </div>

        <div className="flex-1 overflow-y-auto px-2 pb-2">
          {topics.length === 0 && (
            <p className="px-3 py-4 text-xs text-gray-400">
              No topics yet. Click &ldquo;Add topic&rdquo; below.
            </p>
          )}

          {topics.map((topic) => {
            const topicMenuKey = menuKey.topic(topic.id);
            const isRenamingTopic = renamingId === topic.id;

            return (
              <div key={topic.id} className="mb-1">
                {/* ── Topic row ── */}
                <div className="group relative flex items-center gap-1 px-2 py-1.5">
                  <div className="min-w-0 flex-1">
                    {isRenamingTopic ? (
                      <InlineRename
                        value={topic.label}
                        placeholder="Topic name"
                        onCommit={(v) => renameTopic(topic.id, v)}
                        onCancel={() => setRenamingId(null)}
                      />
                    ) : (
                      <div className="flex items-center gap-1">
                        <span className="truncate text-sm font-semibold text-gray-900">
                          {topic.label || (
                            <span className="italic text-gray-400">
                              Untitled topic
                            </span>
                          )}
                        </span>
                        <button
                          type="button"
                          onClick={() => setRenamingId(topic.id)}
                          className="shrink-0 rounded p-0.5 text-gray-300 opacity-0 transition-opacity hover:text-gray-500 group-hover:opacity-100"
                          aria-label="Rename topic"
                        >
                          <Icon icon="lucide:pencil" size={12} />
                        </button>
                      </div>
                    )}
                  </div>

                  {!isRenamingTopic && (
                    <button
                      type="button"
                      onClick={() =>
                        setMenuOpenFor((m) =>
                          m === topicMenuKey ? null : topicMenuKey,
                        )
                      }
                      className="shrink-0 rounded p-1 text-gray-400 hover:bg-gray-100"
                    >
                      <Icon icon="proicons:more" size={15} />
                    </button>
                  )}

                  {menuOpenFor === topicMenuKey && (
                    <div className="absolute right-0 top-8 z-30 w-52 rounded-xl border border-gray-100 bg-white p-1.5 shadow-lg">
                      <MenuItem
                        icon="lucide:layers"
                        label="Add module"
                        onClick={() => addModule(topic.id)}
                      />
                      <MenuItem
                        icon="lucide:pencil"
                        label="Rename topic"
                        onClick={() => {
                          setMenuOpenFor(null);
                          setRenamingId(topic.id);
                        }}
                      />
                      <div className="my-1 border-t border-gray-100" />
                      <MenuItem
                        icon="lucide:trash-2"
                        label="Delete topic"
                        danger
                        onClick={() => deleteTopic(topic.id)}
                      />
                    </div>
                  )}
                </div>

                {/* ── Modules ── */}
                {topic.modules.map((mod) => {
                  const moduleMenuKeyStr = menuKey.module(topic.id, mod.id);
                  const isRenamingMod = renamingId === mod.id;
                  const collapsed = collapsedModules[mod.id];
                  return (
                    <div key={mod.id}>
                      <div
                        className="group relative flex items-center gap-1 py-1.5 pr-2"
                        style={{paddingLeft: "20px"}}
                      >
                        <button
                          type="button"
                          onClick={() => toggleModule(mod.id)}
                          className="flex items-center gap-1 text-gray-400"
                        >
                          <Icon
                            icon="lucide:chevron-down"
                            size={13}
                            className={`transition-transform ${collapsed ? "-rotate-90" : ""}`}
                          />
                        </button>

                        <div className="min-w-0 flex-1">
                          {isRenamingMod ? (
                            <InlineRename
                              value={mod.label}
                              placeholder="Module name"
                              onCommit={(v) =>
                                renameModule(topic.id, mod.id, v)
                              }
                              onCancel={() => setRenamingId(null)}
                            />
                          ) : (
                            <div className="flex items-center gap-1">
                              <span className="truncate text-sm font-medium text-gray-700">
                                {mod.label || (
                                  <span className="italic text-gray-400">
                                    Untitled module
                                  </span>
                                )}
                              </span>
                              <button
                                type="button"
                                onClick={() => setRenamingId(mod.id)}
                                className="shrink-0 rounded p-0.5 text-gray-300 opacity-0 transition-opacity hover:text-gray-500 group-hover:opacity-100"
                              >
                                <Icon icon="lucide:pencil" size={11} />
                              </button>
                            </div>
                          )}
                        </div>

                        {!isRenamingMod && (
                          <>
                            <button
                              type="button"
                              onClick={() =>
                                setMenuOpenFor((m) =>
                                  m === moduleMenuKeyStr
                                    ? null
                                    : moduleMenuKeyStr,
                                )
                              }
                              className="shrink-0 rounded p-1 text-gray-400 hover:bg-gray-100"
                            >
                              <Icon icon="proicons:more" size={14} />
                            </button>
                            <button
                              type="button"
                              onClick={() => deleteModule(topic.id, mod.id)}
                              className="shrink-0 rounded p-1 text-gray-300 opacity-0 transition-opacity hover:text-red-500 group-hover:opacity-100"
                            >
                              <Icon icon="lucide:trash-2" size={13} />
                            </button>
                          </>
                        )}

                        {menuOpenFor === moduleMenuKeyStr && (
                          <div className="absolute right-0 top-8 z-30 w-52 rounded-xl border border-gray-100 bg-white p-1.5 shadow-lg">
                            <MenuItem
                              icon="lucide:help-circle"
                              label="Add quiz"
                              onClick={() => addQuiz(topic.id, mod.id)}
                            />
                            <div className="my-1 border-t border-gray-100" />
                            <MenuItem
                              icon="lucide:pencil"
                              label="Rename module"
                              onClick={() => {
                                setMenuOpenFor(null);
                                setRenamingId(mod.id);
                              }}
                            />
                          </div>
                        )}
                      </div>

                      {(() => {
                        // Lessons/Practice are aggregate views over this
                        // module's flattened content, not a single stored
                        // item — clicking just navigates to that view via a
                        // synthetic id; it never creates anything.
                        const lessonCount = mod.content.filter(
                          (c) => c.type === "lesson",
                        ).length;
                        const practiceCount = mod.content.filter(
                          (c) => c.type === "practice",
                        ).length;
                        const lessonsSelected =
                          selectedContentId === lessonsViewId(mod.id);
                        const practiceSelected =
                          selectedContentId === practiceViewId(mod.id);

                        return (
                          <div style={{paddingLeft: "20px"}}>
                            <div
                              role="button"
                              className={`group flex cursor-pointer items-center gap-1.5 py-1.5 pr-2 transition-colors ${
                                lessonsSelected ? "text-gray-900" : ""
                              }`}
                              onClick={() =>
                                onSelectContent(lessonsViewId(mod.id))
                              }
                            >
                              <span className="shrink-0 text-gray-400">
                                <Icon icon="lucide:play-circle" size={14} />
                              </span>
                              <div className="flex min-w-0 flex-1 items-center justify-between gap-2 rounded px-1 py-0.5">
                                <span className="truncate text-sm text-gray-500">
                                  Lessons
                                </span>
                                <span className="shrink-0 rounded-md bg-gray-100 px-1.5 py-0.5 text-xs font-medium text-gray-500">
                                  {lessonCount}
                                </span>
                              </div>
                            </div>

                            <div
                              role="button"
                              className={`group flex cursor-pointer items-center gap-1.5 py-1.5 pr-2 transition-colors ${
                                practiceSelected ? "text-gray-900" : ""
                              }`}
                              onClick={() =>
                                onSelectContent(practiceViewId(mod.id))
                              }
                            >
                              <span className="shrink-0 text-gray-400">
                                <Icon icon="lucide:list-checks" size={14} />
                              </span>
                              <div className="flex min-w-0 flex-1 items-center justify-between gap-2 rounded px-1 py-0.5">
                                <span className="truncate text-sm text-gray-500">
                                  Practice
                                </span>
                                <span className="shrink-0 rounded-md bg-gray-100 px-1.5 py-0.5 text-xs font-medium text-gray-500">
                                  {practiceCount}
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })()}

                      {/* Quizzes — lessons/practice are pinned above, not listed here */}
                      {!collapsed &&
                        mod.content
                          .filter(
                            (item): item is QuizModuleContent =>
                              item.type === "quiz",
                          )
                          .map((item) => {
                            const isConfirming = confirmDeleteId === item.id;
                            const isSelected = selectedContentId === item.id;

                            return (
                              <div
                                key={item.id}
                                style={{paddingLeft: "36px"}}
                                className="group flex items-center gap-1.5 py-1.5 pr-2 transition-colors"
                              >
                                {isConfirming ? (
                                  <div className="flex w-full items-center justify-between gap-2">
                                    <span className="truncate text-xs text-gray-600">
                                      Delete {item.title || "this item"}?
                                    </span>
                                    <div className="flex shrink-0 items-center gap-1.5">
                                      <button
                                        type="button"
                                        onClick={() => setConfirmDeleteId(null)}
                                        className="rounded px-1.5 py-0.5 text-xs font-medium text-gray-500 hover:bg-gray-100"
                                      >
                                        Cancel
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() =>
                                          deleteContent(
                                            topic.id,
                                            mod.id,
                                            item.id,
                                          )
                                        }
                                        className="rounded bg-red-500 px-1.5 py-0.5 text-xs font-medium text-white hover:bg-red-600"
                                      >
                                        Delete
                                      </button>
                                    </div>
                                  </div>
                                ) : (
                                  <>
                                    <span className="shrink-0 text-gray-400">
                                      <Icon icon={QUIZ_ICON} size={14} />
                                    </span>

                                    <button
                                      type="button"
                                      onClick={() => onSelectContent(item.id)}
                                      className={`flex min-w-0 flex-1 items-center justify-between gap-2 rounded px-1 py-0.5 text-left text-sm transition-colors ${
                                        isSelected
                                          ? "bg-gray-100 text-gray-900"
                                          : "text-gray-500 hover:bg-gray-50"
                                      }`}
                                    >
                                      <span className="truncate">
                                        {item.title || (
                                          <span className="italic text-gray-400">
                                            Untitled quiz
                                          </span>
                                        )}
                                      </span>
                                      <span className="shrink-0 rounded-md bg-gray-100 px-1.5 py-0.5 text-xs font-medium text-gray-500">
                                        {item.questions.length}
                                      </span>
                                    </button>

                                    <span className="hidden shrink-0 items-center gap-0.5 group-hover:flex">
                                      <button
                                        type="button"
                                        onClick={() =>
                                          setConfirmDeleteId(item.id)
                                        }
                                        className="rounded p-1 text-gray-300 hover:text-red-500"
                                        aria-label={`Delete ${item.title || "quiz"}`}
                                      >
                                        <Icon icon="lucide:trash-2" size={11} />
                                      </button>
                                    </span>
                                  </>
                                )}
                              </div>
                            );
                          })}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>

      {/* Add topic footer */}
      <div className="rounded-b-2xl border-t border-gray-100 bg-muted/10 p-3">
        <Button type="button" variant="ghost" width={"full"} onClick={addTopic}>
          <Icon icon="lucide:plus-circle" size={16} />
          Add topic
        </Button>
      </div>
    </div>
  );
}

function MenuItem({
  icon,
  label,
  danger,
  onClick,
}: {
  icon: string;
  label: string;
  danger?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm transition-colors hover:bg-gray-50 ${
        danger ? "text-red-500" : "text-gray-700"
      }`}
    >
      <Icon
        icon={icon}
        size={15}
        className={danger ? "text-red-400" : "text-gray-400"}
      />
      {label}
    </button>
  );
}
