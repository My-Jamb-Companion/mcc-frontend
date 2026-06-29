"use client";

import {useCallback, useRef, useState} from "react";
import {motion} from "framer-motion";
import {Icon} from "@mcc/ui";
import DragImageOverlay, {useGlobalFileDrag} from "./DragFile";
import UploadZone from "./BrainyUpload";

export interface BrainyChatBoxProps {
  onSubmitQuestion?: (question: string, files: File[]) => void;
  accept?: string;
  maxFiles?: number;
  className?: string;
}

export function BrainyChatBox({
  onSubmitQuestion,
  accept = ".pdf,.doc,.docx,.ppt,.pptx,.png,.jpg,.jpeg",
  maxFiles = 3,
  className = "",
}: BrainyChatBoxProps) {
  const [question, setQuestion] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [isThinking, setIsThinking] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleFilesAdded = useCallback((incoming: File[]) => {
    setFiles((prev) => [...prev, ...incoming]);
  }, []);

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
