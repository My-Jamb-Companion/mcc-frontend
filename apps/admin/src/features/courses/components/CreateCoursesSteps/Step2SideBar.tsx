import {Icon, Button} from "@mcc/ui";
import {useState, useRef, useEffect} from "react";
import {
  InlineRename,
  exerciseViewId,
  lessonsViewId,
  practiceViewId,
  uid,
} from "./Step2";
import {MakeModule, Topic} from "../../types/types";

export function quizViewId(moduleId: string) {
  return `quiz:${moduleId}`;
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
  const [menuOpenFor, setMenuOpenFor] = useState<string | null>(null);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [collapsedModules, setCollapsedModules] = useState<
    Record<string, boolean>
  >({});
  const [quizModules, setQuizModules] = useState<Record<string, boolean>>({});

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

  // ── Topic Handlers ──

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

  // ── Module Handlers ──

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
                {/* ── Topic Row ── */}
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
                            className={`transition-transform ${
                              collapsed ? "-rotate-90" : ""
                            }`}
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
                              icon="lucide:plus-circle"
                              label="Add Quiz"
                              onClick={() => {
                                setMenuOpenFor(null);
                                setQuizModules((prev) => ({
                                  ...prev,
                                  [mod.id]: true,
                                }));
                              }}
                            />
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

                      {!collapsed &&
                        (() => {
                          const lessonCount = mod.content.filter(
                            (c) => c.type === "lesson",
                          ).length;
                          const practiceCount = mod.content.filter(
                            (c) => c.type === "practice",
                          ).length;
                          const exerciseCount = mod.content.filter(
                            (c) => c.type === "exercise",
                          ).length;
                          const quizCount = mod.content.filter(
                            (c) => c.type === "quiz",
                          ).length;

                          const lessonsSelected =
                            selectedContentId === lessonsViewId(mod.id);
                          const practiceSelected =
                            selectedContentId === practiceViewId(mod.id);
                          const exerciseSelected =
                            selectedContentId === exerciseViewId(mod.id);
                          const quizSelected =
                            selectedContentId === quizViewId(mod.id);

                          return (
                            <div style={{paddingLeft: "20px"}}>
                              {/* Lessons */}
                              <div
                                role="button"
                                className={`group flex cursor-pointer items-center gap-1.5 py-1.5 pr-2 transition-colors ${
                                  lessonsSelected
                                    ? "font-semibold text-gray-900"
                                    : ""
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

                              {/* Practice */}
                              <div
                                role="button"
                                className={`group flex cursor-pointer items-center gap-1.5 py-1.5 pr-2 transition-colors ${
                                  practiceSelected
                                    ? "font-semibold text-gray-900"
                                    : ""
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

                              {/* Exercises */}
                              <div
                                role="button"
                                className={`group flex cursor-pointer items-center gap-1.5 py-1.5 pr-2 transition-colors ${
                                  exerciseSelected
                                    ? "font-semibold text-gray-900"
                                    : ""
                                }`}
                                onClick={() =>
                                  onSelectContent(exerciseViewId(mod.id))
                                }
                              >
                                <span className="shrink-0 text-gray-400">
                                  <Icon icon="lucide:dumbbell" size={14} />
                                </span>
                                <div className="flex min-w-0 flex-1 items-center justify-between gap-2 rounded px-1 py-0.5">
                                  <span className="truncate text-sm text-gray-500">
                                    Exercise
                                  </span>
                                  <span className="shrink-0 rounded-md bg-gray-100 px-1.5 py-0.5 text-xs font-medium text-gray-500">
                                    {exerciseCount}
                                  </span>
                                </div>
                              </div>

                              {/* Quiz */}
                              {(quizModules[mod.id] || quizCount > 0) && (
                                <div
                                  role="button"
                                  className={`group flex cursor-pointer items-center gap-1.5 py-1.5 pr-2 transition-colors ${
                                    quizSelected
                                      ? "font-semibold text-gray-900"
                                      : ""
                                  }`}
                                  onClick={() =>
                                    onSelectContent(quizViewId(mod.id))
                                  }
                                >
                                  <span className="shrink-0 text-gray-400">
                                    <Icon icon="lucide:help-circle" size={14} />
                                  </span>
                                  <div className="flex min-w-0 flex-1 items-center justify-between gap-2 rounded px-1 py-0.5">
                                    <span className="truncate text-sm text-gray-500">
                                      Quiz
                                    </span>
                                    <span className="shrink-0 rounded-md bg-gray-100 px-1.5 py-0.5 text-xs font-medium text-gray-500">
                                      {quizCount}
                                    </span>
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })()}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer */}
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
