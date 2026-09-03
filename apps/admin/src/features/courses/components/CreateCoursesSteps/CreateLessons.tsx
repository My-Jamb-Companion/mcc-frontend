import {useEffect, useRef, useState} from "react";
import {Icon} from "@mcc/ui";
import {InlineRename} from "./Step2";
import {FileRow} from "@/src/features/courses/types/types";
import {uploadMedia} from "@/src/features/courses/services/media.service";

function uid() {
  return Math.random().toString(36).slice(2, 9);
}

// Helper to extract duration from an uploaded video file
function getVideoDuration(file: File): Promise<number> {
  return new Promise((resolve) => {
    const video = document.createElement("video");
    video.preload = "metadata";
    video.onloadedmetadata = () => {
      URL.revokeObjectURL(video.src);
      resolve(Math.round(video.duration));
    };
    video.onerror = () => {
      resolve(0);
    };
    video.src = URL.createObjectURL(file);
  });
}

// ─────────────────────────────────────────────────────────
// FILE ROW
// ─────────────────────────────────────────────────────────

function FileRowItem({
  file,
  error,
  onRemove,
  onRename,
  onRetry,
  index,
  onDragStart,
  onDragEnter,
  onDragEnd,
  onDrop,
}: {
  file: FileRow;
  error?: string;
  onRemove?: (id: string) => void;
  onRename?: (id: string, newTitle: string) => void;
  onRetry?: (id: string) => void;
  index: number;
  onDragStart?: (e: React.DragEvent, index: number) => void;
  onDragEnter?: (e: React.DragEvent, index: number) => void;
  onDragEnd?: (e: React.DragEvent) => void;
  onDrop?: (e: React.DragEvent) => void;
}) {
  const uploading = file.progress !== undefined;
  const [isRenaming, setIsRenaming] = useState(false);

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
      <span className="relative z-10 flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-gray-100">
        {(file.previewUrl || file.src) && (
          <Icon icon="lucide:play" size={16} className="text-gray-400" />
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
            <p className="truncate text-sm font-medium text-gray-900">
              {file.title}
            </p>
            {!uploading && (
              <button
                type="button"
                onClick={() => setIsRenaming(true)}
                className="text-gray-400 hover:text-gray-600"
              >
                <Icon icon="lucide:pencil" size={12} />
              </button>
            )}
          </div>
        )}
        <p className="text-xs text-gray-400">
          {file.format} • {file.size}
          {file.duration
            ? ` • ${Math.floor(file.duration / 60)}m ${file.duration % 60}s`
            : ""}
        </p>
        {error && (
          <p className="mt-0.5 flex items-center gap-2 text-xs text-danger">
            {error}
            <button
              type="button"
              onClick={() => onRetry?.(file.id)}
              className="font-semibold underline"
            >
              Retry
            </button>
          </p>
        )}
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
  /** The active leaf's current file list. */
  files: FileRow[];
  /** Called with the full next list whenever files are added, removed, renamed, or reordered. */
  onFilesChange: (files: FileRow[]) => void;
  /** Used for the "Add {addLabel}" button text. */
  addLabel?: string;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadsProgress, setUploadsProgress] = useState<
    Record<string, number>
  >({});
  const [uploadErrors, setUploadErrors] = useState<Record<string, string>>({});

  // Uploads run against whatever the file list looks like *when they finish*,
  // not when they started — a ref keeps that current without re-subscribing
  // the upload effect to every reorder/rename.
  const filesRef = useRef(files);
  useEffect(() => {
    filesRef.current = files;
  }, [files]);
  const onFilesChangeRef = useRef(onFilesChange);
  useEffect(() => {
    onFilesChangeRef.current = onFilesChange;
  }, [onFilesChange]);

  // Drag & drop reorder state
  const [dragItemIndex, setDragItemIndex] = useState<number | null>(null);
  const [dragOverItemIndex, setDragOverItemIndex] = useState<number | null>(
    null,
  );

  function uploadRow(id: string, file: File) {
    setUploadsProgress((prev) => ({...prev, [id]: 0}));
    setUploadErrors((prev) => {
      const next = {...prev};
      delete next[id];
      return next;
    });

    uploadMedia(file, "courses", (percent) => {
      setUploadsProgress((prev) => ({...prev, [id]: percent}));
    })
      .then((remoteUrl) => {
        onFilesChangeRef.current(
          filesRef.current.map((f) =>
            f.id === id ? {...f, src: remoteUrl} : f,
          ),
        );
      })
      .catch(() => {
        setUploadErrors((prev) => ({
          ...prev,
          [id]: "Upload failed.",
        }));
      })
      .finally(() => {
        setUploadsProgress((prev) => {
          const next = {...prev};
          delete next[id];
          return next;
        });
      });
  }

  function retryUpload(id: string) {
    const row = filesRef.current.find((f) => f.id === id);
    if (row?.file) uploadRow(id, row.file);
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files?.length) return;

    const fileList = Array.from(e.target.files);

    const newRows: FileRow[] = await Promise.all(
      fileList.map(async (f) => {
        const id = uid();
        const objectUrl = URL.createObjectURL(f);
        const duration = await getVideoDuration(f);

        return {
          id,
          title: f.name,
          format: f.name.split(".").pop()?.toUpperCase() || "FILE",
          size: (f.size / (1024 * 1024)).toFixed(1) + "mb",
          fileSizeBytes: f.size,
          previewUrl: objectUrl,
          src: objectUrl,
          duration,
          file: f,
        };
      }),
    );

    onFilesChange([...files, ...newRows]);
    newRows.forEach((row) => uploadRow(row.id, row.file as File));
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function handleDrop() {
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
          error={uploadErrors[file.id]}
          index={index}
          onRemove={(id) => onFilesChange(files.filter((x) => x.id !== id))}
          onRename={handleRenameFile}
          onRetry={retryUpload}
          onDragStart={(_, idx) => setDragItemIndex(idx)}
          onDragEnter={(_, idx) => setDragOverItemIndex(idx)}
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
        accept="video/*"
      />

      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        className="flex items-center gap-3 rounded-xl border border-dashed border-gray-200 px-4 py-3.5 text-left text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700 transition-colors"
      >
        <Icon icon="lucide:plus" size={16} className="text-gray-400" />
        Add {addLabel}
      </button>
    </div>
  );
}
