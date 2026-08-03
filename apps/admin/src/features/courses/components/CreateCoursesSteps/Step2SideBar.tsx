import {Icon, Button} from "@mcc/ui";
import {useState, useRef, useEffect} from "react";
import {InlineRename, MakeModule, Topic, uid} from "./Step2";

export default function Step2Sidebar({
  topics,
  selectedLeaf,
  onSelectLeaf,
  onTopicsChange,
}: {
  topics: Topic[];
  selectedLeaf: string;
  onSelectLeaf: (id: string) => void;
  onTopicsChange: (topics: Topic[]) => void;
}) {
  // Which node's ⋮ menu is open
  const [menuOpenFor, setMenuOpenFor] = useState<string | null>(null);
  // Which node is being renamed
  const [renamingId, setRenamingId] = useState<string | null>(null);
  // Which modules are collapsed
  const [collapsedModules, setCollapsedModules] = useState<
    Record<string, boolean>
  >({});
  // Which quizzes are collapsed
  const [collapsedQuizzes, setCollapsedQuizzes] = useState<
    Record<string, boolean>
  >({});

  // Close menus when clicking outside
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

  function renameModule(topicId: string, modId: string, label: string) {
    onTopicsChange(
      topics.map((t) =>
        t.id === topicId
          ? {
              ...t,
              modules: t.modules.map((m) =>
                m.id === modId ? {...m, label} : m,
              ),
            }
          : t,
      ),
    );
    setRenamingId(null);
  }

  function addQuiz(topicId: string) {
    onTopicsChange(
      topics.map((t) => (t.id === topicId ? {...t, hasQuiz: true} : t)),
    );
    setMenuOpenFor(null);
  }

  function toggleModule(id: string) {
    setCollapsedModules((prev) => ({...prev, [id]: !prev[id]}));
  }

  function deleteModule(topicId: string, modId: string) {
    onTopicsChange(
      topics.map((t) =>
        t.id === topicId
          ? {...t, modules: t.modules.filter((m) => m.id !== modId)}
          : t,
      ),
    );
  }

  function toggleQuiz(id: string) {
    setCollapsedQuizzes((prev) => ({...prev, [id]: !prev[id]}));
  }

  function deleteQuiz(topicId: string) {
    onTopicsChange(
      topics.map((t) => (t.id === topicId ? {...t, hasQuiz: false} : t)),
    );
  }

  // We compose a unique string key for each ⋮ so we can tell which one is open
  const menuKey = {
    topic: (id: string) => `topic:${id}`,
  };

  return (
    <div
      ref={sidebarRef}
      className="flex w-72 shrink-0 flex-col rounded-2xl border border-muted/30"
    >
      {/* Scrollable tree */}
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
                        {/* Edit pencil */}
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

                  {/* ⋮ options */}
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

                  {/* Topic dropdown menu */}
                  {menuOpenFor === topicMenuKey && (
                    <div className="absolute right-0 top-8 z-30 w-52 rounded-xl border border-gray-100 bg-white p-1.5 shadow-lg">
                      <MenuItem
                        icon="lucide:layers"
                        label="Add module"
                        onClick={() => addModule(topic.id)}
                      />
                      {!topic.hasQuiz && (
                        <MenuItem
                          icon="lucide:list-checks"
                          label="Add quiz"
                          onClick={() => addQuiz(topic.id)}
                        />
                      )}
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

                {/* Modules — now directly under the topic */}
                {topic.modules.map((mod) => {
                  const collapsed = collapsedModules[mod.id];
                  const isRenamingMod = renamingId === mod.id;

                  return (
                    <div key={mod.id}>
                      <div
                        className="group flex items-center gap-1 py-1.5 pr-2"
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
                          <button
                            type="button"
                            onClick={() => deleteModule(topic.id, mod.id)}
                            className="shrink-0 rounded p-1 text-gray-300 opacity-0 transition-opacity hover:text-red-500 group-hover:opacity-100"
                          >
                            <Icon icon="lucide:trash-2" size={13} />
                          </button>
                        )}
                      </div>

                      {/* Module leaves */}
                      {!collapsed &&
                        mod.leaves.map((leaf) => (
                          <button
                            key={leaf.id}
                            type="button"
                            onClick={() => onSelectLeaf(leaf.id)}
                            style={{paddingLeft: "36px"}}
                            className={`flex w-full items-center justify-between py-1.5 pr-2 text-left text-sm transition-colors ${
                              selectedLeaf === leaf.id
                                ? "bg-gray-100 text-gray-900"
                                : "text-gray-500 hover:bg-gray-50"
                            }`}
                          >
                            <span>{leaf.label}</span>
                            {leaf.count !== undefined && (
                              <span className="rounded-md bg-gray-100 px-1.5 py-0.5 text-xs font-medium text-gray-500">
                                {leaf.count}
                              </span>
                            )}
                          </button>
                        ))}
                    </div>
                  );
                })}

                {/* Quiz row (if added) — now directly under the topic */}
                {topic.hasQuiz && (
                  <div key={`${topic.id}-quiz`}>
                    <div
                      className="group flex items-center gap-1 py-1.5 pr-2"
                      style={{paddingLeft: "20px"}}
                    >
                      <button
                        type="button"
                        onClick={() => toggleQuiz(topic.id)}
                        className="flex items-center gap-1 text-gray-400"
                      >
                        <Icon
                          icon="lucide:chevron-down"
                          size={13}
                          className={`transition-transform ${collapsedQuizzes[topic.id] ? "-rotate-90" : ""}`}
                        />
                      </button>
                      <div className="min-w-0 flex-1">
                        <span className="truncate text-sm font-medium text-gray-700">
                          Quiz
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => deleteQuiz(topic.id)}
                        className="shrink-0 rounded p-1 text-gray-300 opacity-0 transition-opacity hover:text-red-500 group-hover:opacity-100"
                      >
                        <Icon icon="lucide:trash-2" size={13} />
                      </button>
                    </div>
                    {!collapsedQuizzes[topic.id] && (
                      <button
                        type="button"
                        onClick={() => onSelectLeaf(`${topic.id}-quiz`)}
                        style={{paddingLeft: "36px"}}
                        className={`flex w-full items-center justify-between py-1.5 pr-2 text-left text-sm transition-colors ${
                          selectedLeaf === `${topic.id}-quiz`
                            ? "bg-gray-100 text-gray-900"
                            : "text-gray-500 hover:bg-gray-50"
                        }`}
                      >
                        <span>Quiz exercises</span>
                      </button>
                    )}
                  </div>
                )}
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

function makeModule(): MakeModule {
  return {
    id: uid(),
    label: "",
    leaves: [
      {id: uid(), label: "Lectures", type: "lectures", count: 0},
      {id: uid(), label: "Practice", type: "practice", count: 0},
    ],
  };
}

function makeTopic(): Topic {
  return {id: uid(), label: "", modules: [], hasQuiz: false};
}
