import {useCallback, useState, useRef} from "react";
import {Icon, motion, AnimatePresence} from "@mcc/ui";

export default function UploadZone({
  files,
  onFilesAdded,
  onRemoveFile,
  accept,
  maxFiles,
}: {
  files: File[];
  onFilesAdded: (files: File[]) => void;
  onRemoveFile: (index: number) => void;
  accept?: string;
  maxFiles: number;
}) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback(
    (incoming: FileList | null) => {
      if (!incoming || incoming.length === 0) return;
      const next = Array.from(incoming).slice(
        0,
        Math.max(0, maxFiles - files.length),
      );
      if (next.length > 0) onFilesAdded(next);
    },
    [files.length, maxFiles, onFilesAdded],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);
      handleFiles(e.dataTransfer.files);
    },
    [handleFiles],
  );

  return (
    <div>
      <div
        role="button"
        tabIndex={0}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") inputRef.current?.click();
        }}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={[
          "flex min-h-[88px] w-[95%] mx-auto mt-15 cursor-pointer flex-col items-center justify-center gap-1.5 rounded-t-2xl border border-dashed border-b-0 px-6 py-6 text-center transition-colors",
          isDragging
            ? "border-purple-400 bg-purple-50/60"
            : "border-gray-200 bg-gray-50/50 hover:bg-gray-50",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400",
        ].join(" ")}
      >
        <AnimatePresence initial={false}>
          {files.length > 0 ? (
            <motion.ul
              initial={{opacity: 0, height: 0}}
              animate={{opacity: 1, height: "auto"}}
              exit={{opacity: 0, height: 0}}
              transition={{duration: 0.18}}
              className="mt-2 flex flex-wrap gap-2 overflow-hidden"
            >
              {files.map((file, i) => {
                const fileIcon = () => {
                  if (file.type === "application/pdf") {
                    return "material-icon-theme:pdf";
                  }
                  if (file.type === "image/jpeg" || file.type === "image/png") {
                    return "fluent-color:image-20";
                  }
                  return "catppuccin:text";
                };
                return (
                  <li
                    key={`${file.name}-${i}`}
                    onClick={(e) => e.stopPropagation()}
                    className="flex items-center gap-1.5 rounded-lg border-2 border-gray-200 bg-white px-3 py-1 text-xs text-gray-600 z-20"
                  >
                    <Icon icon={fileIcon()} size={24} />
                    <span className="max-w-[140px] text-sm font-medium truncate">
                      {file.name}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemoveFile(i);
                      }}
                      className="ml-0.5 rounded-full p-0.5 hover:bg-gray-100"
                      aria-label={`Remove ${file.name}`}
                    >
                      <Icon icon="ph:x" className="h-3 w-3 text-gray-400" />
                    </button>
                  </li>
                );
              })}
            </motion.ul>
          ) : (
            <Icon
              icon="hugeicons:image-download-02"
              className="h-5 w-5 text-gray-400"
            />
          )}
        </AnimatePresence>

        <p className="text-sm text-gray-500">
          {files.length > 0
            ? "Click to replace or drag and drop a new file"
            : "Drag & drop or click to add your materials"}
        </p>

        <input
          ref={inputRef}
          type="file"
          multiple
          accept={accept}
          className="hidden"
          onChange={(e) => {
            handleFiles(e.target.files);
            e.target.value = "";
          }}
        />
      </div>
    </div>
  );
}
