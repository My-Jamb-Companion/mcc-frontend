"use client";

import {useCallback, useRef, useState} from "react";
import {motion, AnimatePresence} from "framer-motion";
import {Icon} from "@mcc/ui";
import DragImageOverlay, {useGlobalFileDrag} from "./DragFile";

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

export interface FeatureCardConfig {
  id: string;
  icon: string;
  title: string;
  description: string;
  badge?: string;
  disabled?: boolean;
}

export interface BrainyChatBoxProps {
  /** Called when a feature card (not disabled) is clicked */
  onFeatureSelect?: (featureId: string) => void;
  /** Called when files are dropped or selected */
  onFilesAdded?: (files: File[]) => void;
  /** Called when the question is submitted */
  onSubmitQuestion?: (question: string, files: File[]) => void;
  /** Accepted file types for the upload zone */
  accept?: string;
  /** Max files allowed at once */
  maxFiles?: number;
  className?: string;
}

const DEFAULT_FEATURES: FeatureCardConfig[] = [
  {
    id: "exam-prep",
    icon: "ph:exam",
    title: "Prepare for your exam",
    description:
      "Transform lecture slides and notes into flashcards, quizzes, and fill-in-the-blank questions instantly.",
    badge: "Coming soon",
    disabled: true,
  },
  {
    id: "assignment-support",
    icon: "ph:book-open",
    title: "Get support with your assignment",
    description:
      "Generate summaries and interactive study materials to simplify complex assignments.",
  },
];

/* -------------------------------------------------------------------------- */
/* Feature Card                                                              */
/* -------------------------------------------------------------------------- */

function FeatureCard({
  feature,
  onSelect,
}: {
  feature: FeatureCardConfig;
  onSelect?: (id: string) => void;
}) {
  const isDisabled = !!feature.disabled;

  return (
    <motion.button
      type="button"
      onClick={() => !isDisabled && onSelect?.(feature.id)}
      disabled={isDisabled}
      whileHover={!isDisabled ? {y: -2} : undefined}
      whileTap={!isDisabled ? {scale: 0.99} : undefined}
      transition={{type: "spring", stiffness: 400, damping: 28}}
      className={[
        "relative flex flex-1 flex-col items-start gap-3 rounded-2xl border bg-white dark:bg-subtle/10 shadow-md p-4 text-left",
        "border-gray-200 shadow-sm",
        isDisabled
          ? "cursor-default opacity-90"
          : "cursor-pointer hover:border-gray-300 hover:shadow-md",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 focus-visible:ring-offset-2",
      ].join(" ")}
    >
      <div className="flex w-full items-start justify-between">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-gray-100 bg-gray-50">
          <Icon icon={feature.icon} className="h-4.5 w-4.5 text-purple-600" />
        </span>

        {feature.badge && (
          <span className="flex items-center gap-1 rounded-full bg-gray-900 px-2.5 py-1 text-xs font-medium text-white">
            <Icon icon="ph:sparkle-fill" className="h-3 w-3" />
            {feature.badge}
          </span>
        )}
      </div>

      <div>
        <h3 className="text-sm font-semibold text-gray-900">{feature.title}</h3>
        <p className="mt-1 text-sm leading-snug text-gray-500">
          {feature.description}
        </p>
      </div>
    </motion.button>
  );
}

/* -------------------------------------------------------------------------- */
/* Upload Zone                                                                */
/* -------------------------------------------------------------------------- */

function UploadZone({
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

/* -------------------------------------------------------------------------- */
/* Main Component                                                             */
/* -------------------------------------------------------------------------- */

export function BrainyChatBox({
  onFeatureSelect,
  onFilesAdded,
  onSubmitQuestion,
  accept = ".pdf,.doc,.docx,.ppt,.pptx,.png,.jpg,.jpeg",
  maxFiles = 5,
  className = "",
}: BrainyChatBoxProps) {
  const [question, setQuestion] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [isThinking, setIsThinking] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleFilesAdded = useCallback(
    (incoming: File[]) => {
      setFiles((prev) => [...prev, ...incoming]);
      onFilesAdded?.(incoming);
    },
    [onFilesAdded],
  );

  const handleRemoveFile = useCallback((index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleSubmit = useCallback(() => {
    const trimmed = question.trim();
    if (!trimmed && files.length === 0) return;
    onSubmitQuestion?.(trimmed, files);
  }, [question, files, onSubmitQuestion]);

  const isDraggingFile = useGlobalFileDrag(handleFilesAdded);

  return (
    <div className={`mx-auto w-full max-w-[660px] ${className}`}>
      {/* Feature cards */}
      <div className="flex flex-col gap-3 sm:flex-row">
        {DEFAULT_FEATURES.map((feature) => (
          <FeatureCard
            key={feature.id}
            feature={feature}
            onSelect={onFeatureSelect}
          />
        ))}
      </div>

      {/* Upload + question composer */}
      <UploadZone
        files={files}
        onFilesAdded={handleFilesAdded}
        onRemoveFile={handleRemoveFile}
        accept={accept}
        maxFiles={maxFiles}
      />
      <div className="rounded-3xl border border-gray-200 bg-white p-2 shadow-sm">
        <div className="mt-2 rounded-xl">
          <textarea
            ref={textareaRef}
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSubmit();
              }
            }}
            placeholder="Type your question here..."
            rows={3}
            className="w-full resize-none rounded-xl border-none bg-white p-3 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none"
          />

          <div className="flex items-center justify-between px-3 pb-2">
            <div className="flex items-center gap-2">
              <div
                className={`relative flex items-center rounded-full w-[36px] h-[20px] cursor-pointer transition-colors duration-300 ${isThinking ? "bg-primary" : "bg-muted/50"}`}
                onClick={() => setIsThinking(!isThinking)}
              >
                <motion.div
                  className="h-4 w-4 rounded-full bg-white shadow-md"
                  animate={{x: isThinking ? 17 : 3}}
                  transition={{type: "spring", stiffness: 500, damping: 30}}
                />
              </div>
              <p
                className={`text-sm transition-colors duration-200 ${isThinking ? "text-gray-700" : "text-gray-400"}`}
              >
                Thinking
              </p>
            </div>

            <motion.button
              type="button"
              onClick={handleSubmit}
              whileTap={{scale: 0.95}}
              disabled={!question.trim() && files.length === 0}
              className="flex items-center gap-1.5 rounded-full bg-primary  p-3 text-sm font-medium text-white transition-opacity disabled:cursor-not-allowed disabled:opacity-30"
            >
              <Icon icon="ph:arrow-up" className="h-3.5 w-3.5" />
            </motion.button>
          </div>
        </div>
      </div>

      {/* Trust footer */}
      <div className="mt-4 flex items-center justify-center gap-5 text-xs text-gray-400">
        <span className="flex items-center gap-1.5">
          <Icon icon="ph:shield-check" className="h-3.5 w-3.5" />
          Encrypted
        </span>
        <span className="flex items-center gap-1.5">
          <Icon icon="ph:brain" className="h-3.5 w-3.5" />
          Results is based on a custom LLM
        </span>
      </div>

      <DragImageOverlay isVisible={isDraggingFile} />
    </div>
  );
}

export default BrainyChatBox;
