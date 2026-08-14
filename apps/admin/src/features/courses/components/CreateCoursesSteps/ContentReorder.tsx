import {useRef, useState, useMemo} from "react";
import {Icon} from "@mcc/ui";
import {MakeModule, ModuleContent} from "../../types/types";

type ReorderItem = {
  id: string;
  kind: ModuleContent["type"];
  label: string;
  moduleId: string;
};

const ICON_BY_KIND: Record<ReorderItem["kind"], string> = {
  lesson: "lucide:play",
  practice: "lucide:list-checks",
  exercise: "ri:question-line",
  quiz: "lucide:clock",
};

function labelFor(item: ModuleContent): string {
  switch (item.type) {
    case "lesson":
      return item.title || "Untitled lesson";
    case "practice":
      return item.name || "Untitled practice";
    case "exercise":
      return item.name || "Untitled exercise";
    case "quiz":
      return item.title || "Untitled quiz";
  }
}

function buildItems(module: MakeModule): ReorderItem[] {
  return module.content.map((content) => ({
    id: content.id,
    kind: content.type,
    label: labelFor(content),
    moduleId: module.id,
  }));
}

function applyItemsToModule(
  module: MakeModule,
  items: ReorderItem[],
): MakeModule {
  const contentById = new Map<string, ModuleContent>(
    module.content.map((c) => [c.id, c]),
  );

  const newContent: ModuleContent[] = [];
  for (const item of items) {
    const content = contentById.get(item.id);
    if (content) {
      newContent.push(content);
    }
  }

  return {
    ...module,
    content: newContent,
  };
}

export default function ContentReorderPanel({
  module,
  onClose,
  onModuleChange,
}: {
  module: MakeModule;
  onClose: () => void;
  onModuleChange: (module: MakeModule) => void;
}) {
  const items = useMemo(() => buildItems(module), [module]);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  function persistOrder(next: ReorderItem[]) {
    onModuleChange(applyItemsToModule(module, next));
  }

  function handleDrop(targetId: string) {
    if (!draggedId || draggedId === targetId) {
      setDraggedId(null);
      return;
    }
    const draggedIndex = items.findIndex((i) => i.id === draggedId);
    const targetItem = items.find((i) => i.id === targetId);
    if (draggedIndex === -1 || !targetItem) {
      setDraggedId(null);
      return;
    }

    const next = [...items];
    const [moved] = next.splice(draggedIndex, 1);
    const insertAt = next.findIndex((i) => i.id === targetId);
    next.splice(insertAt, 0, moved);
    persistOrder(next);
    setDraggedId(null);
  }

  function handleDelete(item: ReorderItem) {
    const nextContent = module.content.filter((c) => c.id !== item.id);
    onModuleChange({
      ...module,
      content: nextContent,
    });
    setConfirmDeleteId(null);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div
        ref={panelRef}
        className="flex max-h-[80vh] w-full max-w-md flex-col rounded-2xl border border-gray-100 bg-white shadow-xl"
      >
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <div>
            <p className="text-sm font-semibold text-gray-900">
              Reorder content
            </p>
            {/* Line 165: displays the module label */}
            <p className="text-xs text-gray-400">{module.label || "Module"}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-md text-gray-400 hover:bg-gray-100"
            aria-label="Close"
          >
            <Icon icon="lucide:x" size={16} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-3">
          {items.length === 0 ? (
            <p className="px-2 py-6 text-center text-sm text-gray-400">
              Nothing to reorder yet — add a lesson, practice, or quiz first.
            </p>
          ) : (
            <div className="flex flex-col gap-1.5">
              {items.map((item) => {
                const isConfirming = confirmDeleteId === item.id;
                return (
                  <div
                    key={item.id}
                    draggable={!isConfirming}
                    onDragStart={() => setDraggedId(item.id)}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={() => handleDrop(item.id)}
                    onDragEnd={() => setDraggedId(null)}
                    className={`flex items-center gap-2 rounded-xl border px-2.5 py-2.5 transition-colors ${
                      draggedId === item.id
                        ? "border-violet-300 bg-violet-50/60"
                        : "border-gray-100 bg-white"
                    }`}
                  >
                    {isConfirming ? (
                      <div className="flex w-full items-center justify-between gap-2">
                        <span className="text-sm text-gray-700">
                          Delete {item.label || "this item"}?
                        </span>
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={() => setConfirmDeleteId(null)}
                            className="rounded px-2.5 py-1 text-xs font-medium text-gray-600 hover:bg-gray-100"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(item)}
                            className="rounded bg-red-500 px-2.5 py-1 text-xs font-medium text-white hover:bg-red-600"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <span className="shrink-0 cursor-grab text-gray-300 active:cursor-grabbing">
                          <Icon icon="lucide:grip-vertical" size={15} />
                        </span>
                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-500">
                          <Icon icon={ICON_BY_KIND[item.kind]} size={14} />
                        </span>
                        <span className="min-w-0 flex-1 truncate text-sm text-gray-800">
                          {item.label}
                        </span>
                        <button
                          type="button"
                          onClick={() => setConfirmDeleteId(item.id)}
                          className="shrink-0 rounded p-1.5 text-gray-300 hover:bg-red-50 hover:text-red-500"
                          aria-label={`Delete ${item.label}`}
                        >
                          <Icon icon="lucide:trash-2" size={14} />
                        </button>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="border-t border-gray-100 px-5 py-3">
          <p className="text-xs text-gray-400">
            Drag items to change the order students go through them.
          </p>
        </div>
      </div>
    </div>
  );
}
