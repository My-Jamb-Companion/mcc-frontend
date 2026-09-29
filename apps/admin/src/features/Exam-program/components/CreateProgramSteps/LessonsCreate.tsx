import {useEffect, useRef, useState} from "react";
import {Icon, Modal} from "@mcc/ui";
import {InlineRename} from "./Step2";
import LessonHtmlEditor from "@/src/components/LessonHtmlEditor";

export type FileRow = {
  id: string;
  title: string;
  format: string;
  size: string;
  progress?: number;
  previewUrl?: string;
  src?: string;
  duration?: number;
  file?: File;
  /** Admin-authored lesson HTML (format === "HTML"). Mutually exclusive
   * with src/previewUrl -- a lesson is either media or text, never both. */
  content?: string;
};

const HTML_FORMAT = "HTML";

function uid() {
  return Math.random().toString(36).slice(2, 9);
}

// ─────────────────────────────────────────────────────────
// FILE ROW
// ─────────────────────────────────────────────────────────

function FileRowItem({
  file,
  onRemove,
  onRename,
  onEditContent,
  index,
  onDragStart,
  onDragEnter,
  onDragEnd,
  onDrop,
}: {
  file: FileRow;
  onRemove?: (id: string) => void;
  onRename?: (id: string, newTitle: string) => void;
  onEditContent?: (id: string) => void;
  index: number;
  onDragStart?: (e: React.DragEvent, index: number) => void;
  onDragEnter?: (e: React.DragEvent, index: number) => void;
  onDragEnd?: (e: React.DragEvent) => void;
  onDrop?: (e: React.DragEvent) => void;
}) {
  const uploading = file.progress !== undefined;
  const [isRenaming, setIsRenaming] = useState(false);
  const isHtml = file.format === HTML_FORMAT;

  return (
    <div
      draggable={!uploading}
      onDragStart={(e) => onDragStart?.(e, index)}
      onDragEnter={(e) => onDragEnter?.(e, index)}
      onDragEnd={onDragEnd}
      onDragOver={(e) => e.preventDefault()}
      onDrop={onDrop}
      className={`relative flex items-center gap-3 overflow-hidden rounded-xl border px-4 py-3 ${
        uploading
          ? "border-violet-200 bg-violet-50/60"
          : "border-gray-100 bg-white cursor-grab active:cursor-grabbing"
      }`}
    >
      {uploading && (
        <div
          className="pointer-events-none absolute inset-y-0 left-0 bg-violet-100/70 transition-all duration-300"
          style={{width: `${file.progress}%`}}
        />
      )}
      <span className="relative z-10 text-gray-300 cursor-grab active:cursor-grabbing">
        <Icon icon="lucide:grip-vertical" size={16} />
      </span>
      <span
        className={`relative z-10 flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-gray-100 ${
          isHtml ? "cursor-pointer hover:bg-gray-200" : ""
        }`}
        onClick={isHtml ? () => onEditContent?.(file.id) : undefined}
        title={isHtml ? "Edit content" : undefined}
      >
        {isHtml ? (
          <Icon icon="lucide:align-left" size={16} className="text-gray-400" />
        ) : file.previewUrl ? (
          <img
            src={file.previewUrl}
            alt="preview"
            className="h-full w-full object-cover"
          />
        ) : (
          <Icon icon="lucide:image" size={16} className="text-gray-400" />
        )}
      </span>
      <div className="relative z-10 min-w-0 flex-1">
        {isRenaming && !uploading ? (
          <InlineRename
            value={file.title}
            onCommit={(v) => {
              onRename?.(file.id, v);
              setIsRenaming(false);
            }}
            onCancel={() => setIsRenaming(false)}
          />
        ) : (
          <div className="flex items-center gap-2">
            <p
              className={`truncate text-sm font-medium text-gray-900 ${isHtml ? "cursor-pointer hover:underline" : ""}`}
              onClick={isHtml ? () => onEditContent?.(file.id) : undefined}
            >
              {file.title}
            </p>
            {!uploading && (
              <button
                type="button"
                onClick={() => setIsRenaming(true)}
                className="text-gray-400 hover:text-gray-600"
                aria-label="Rename"
              >
                <Icon icon="lucide:pencil" size={12} />
              </button>
            )}
          </div>
        )}
        <p className="text-xs text-gray-400">
          {isHtml ? "Text lesson" : `${file.format} • ${file.size}`}
        </p>
      </div>
      {uploading && (
        <span className="relative z-10 mr-2 text-sm font-semibold text-violet-600">
          {file.progress}%
        </span>
      )}
      <button
        type="button"
        onClick={() => onRemove?.(file.id)}
        className="relative z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-400 hover:bg-gray-50"
      >
        <Icon icon="lucide:x" size={14} />
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// LESSONS CREATE
// ─────────────────────────────────────────────────────────

export default function LessonsCreate({
  files,
  onFilesChange,
  addLabel = "content",
}: {
  /** The active leaf's current file list (e.g. activeContext?.leaf?.lessons). */
  files: FileRow[];
  /** Called with the full next list whenever files are added, removed, renamed, or reordered. */
  onFilesChange: (files: FileRow[]) => void;
  /** Used for the "Add {addLabel}" button text, e.g. activeContext?.leaf?.label. */
  addLabel?: string;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadsProgress, setUploadsProgress] = useState<
    Record<string, number>
  >({});

  // Drag & drop reorder state
  const [dragItemIndex, setDragItemIndex] = useState<number | null>(null);
  const [dragOverItemIndex, setDragOverItemIndex] = useState<number | null>(
    null,
  );

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files?.length) return;
    const newRows: FileRow[] = [];
    const newProgress: Record<string, number> = {...uploadsProgress};

    Array.from(e.target.files).forEach((f) => {
      const id = uid();
      newRows.push({
        id,
        title: f.name,
        format: f.name.split(".").pop()?.toUpperCase() || "FILE",
        size: (f.size / (1024 * 1024)).toFixed(1) + "mb",
        previewUrl: URL.createObjectURL(f),
        file: f,
      });
      newProgress[id] = 0;
    });

    setUploadsProgress(newProgress);
    onFilesChange([...files, ...newRows]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  // Fake upload progress ticker, same behavior as before extraction.
  useEffect(() => {
    const activeIds = Object.keys(uploadsProgress);
    if (activeIds.length === 0) return;

    const timer = setTimeout(() => {
      setUploadsProgress((prev) => {
        const next = {...prev};
        let changed = false;
        for (const id of Object.keys(next)) {
          if (next[id] < 100) {
            next[id] += 25;
            changed = true;
          } else {
            delete next[id];
            changed = true;
          }
        }
        return changed ? next : prev;
      });
    }, 400);
    return () => clearTimeout(timer);
  }, [uploadsProgress]);

  function handleDrop(_e: React.DragEvent) {
    if (
      dragItemIndex !== null &&
      dragOverItemIndex !== null &&
      dragItemIndex !== dragOverItemIndex
    ) {
      const copy = [...files];
      const [dragged] = copy.splice(dragItemIndex, 1);
      copy.splice(dragOverItemIndex, 0, dragged);
      onFilesChange(copy);
    }
    setDragItemIndex(null);
    setDragOverItemIndex(null);
  }

  function handleRenameFile(id: string, newTitle: string) {
    onFilesChange(
      files.map((f) => (f.id === id ? {...f, title: newTitle} : f)),
    );
  }

  const [contentEditorOpen, setContentEditorOpen] = useState(false);
  const [editingContentId, setEditingContentId] = useState<string | null>(null);
  const [draftContent, setDraftContent] = useState("");

  function openNewContentEditor() {
    setEditingContentId(null);
    setDraftContent("");
    setContentEditorOpen(true);
  }

  function openExistingContentEditor(id: string) {
    const row = files.find((f) => f.id === id);
    setEditingContentId(id);
    setDraftContent(row?.content ?? "");
    setContentEditorOpen(true);
  }

  function saveContentEditor() {
    if (editingContentId) {
      onFilesChange(
        files.map((f) => (f.id === editingContentId ? {...f, content: draftContent} : f)),
      );
    } else {
      onFilesChange([
        ...files,
        {
          id: uid(),
          title: "Lesson content",
          format: HTML_FORMAT,
          size: "",
          content: draftContent,
        },
      ]);
    }
    setContentEditorOpen(false);
  }

  const displayFiles = files.map((f) => ({
    ...f,
    progress:
      uploadsProgress[f.id] !== undefined ? uploadsProgress[f.id] : undefined,
  }));

  return (
    <div className="mt-4 flex flex-col gap-3">
      {displayFiles.map((file, index) => (
        <FileRowItem
          key={file.id}
          file={file}
          index={index}
          onRemove={(id) => onFilesChange(files.filter((x) => x.id !== id))}
          onRename={handleRenameFile}
          onEditContent={openExistingContentEditor}
          onDragStart={(e, idx) => setDragItemIndex(idx)}
          onDragEnter={(e, idx) => setDragOverItemIndex(idx)}
          onDragEnd={() => {
            setDragItemIndex(null);
            setDragOverItemIndex(null);
          }}
          onDrop={handleDrop}
        />
      ))}

      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        onChange={handleFileChange}
        multiple
        accept="video/*,image/*"
      />

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="flex flex-1 items-center gap-3 rounded-xl border border-dashed border-gray-200 px-4 py-3.5 text-left text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700 transition-colors"
        >
          <Icon icon="lucide:plus" size={16} className="text-gray-400" />
          Add {addLabel}
        </button>
        <button
          type="button"
          onClick={openNewContentEditor}
          className="flex shrink-0 items-center gap-2 rounded-xl border border-dashed border-gray-200 px-4 py-3.5 text-left text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700 transition-colors"
        >
          <Icon icon="lucide:align-left" size={16} className="text-gray-400" />
          Write content
        </button>
      </div>

      <Modal
        open={contentEditorOpen}
        title={editingContentId ? "Edit lesson content" : "Write lesson content"}
        maxWidth="max-w-2xl"
      >
        <div className="flex flex-col gap-4">
          <LessonHtmlEditor value={draftContent} onChange={setDraftContent} />
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setContentEditorOpen(false)}
              className="rounded-lg px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={saveContentEditor}
              disabled={!draftContent.trim()}
              className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Save
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
