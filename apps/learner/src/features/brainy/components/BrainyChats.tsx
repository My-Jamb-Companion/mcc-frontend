"use client";

import {Icon, motion} from "@mcc/ui";
import {useCallback, useState, useRef, useMemo} from "react";
import DragImageOverlay, {useGlobalFileDrag} from "./DragFile";
import {useBrainy} from "../contexts/BrainyContext";
import {redirect} from "next/navigation";

export default function BrainyChats() {
  const [question, setQuestion] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {sessions, activeSessionId, addMessageToActiveSession} = useBrainy();

  const activeSession = useMemo(() => {
    return sessions.find((s) => s.id === activeSessionId);
  }, [sessions, activeSessionId]);

  const handleSend = () => {
    if (!question.trim() && files.length === 0) return;

    addMessageToActiveSession("user", question.trim(), files);
    setQuestion("");
    setFiles([]);
  };

  const handleFilesAdded = useCallback((incoming: File[]) => {
    setFiles((prev) => [...prev, ...incoming]);
  }, []);

  const handleRemoveFile = useCallback((index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  }, []);

  console.log(activeSession);
  const isDraggingFile = useGlobalFileDrag(handleFilesAdded);

  if (!activeSession) redirect("/brainy/new");
  return (
    <div className="relative flex flex-col h-full w-full bg-white dark:bg-transparent">
      {/* Messages View */}
      <div className="flex-1 w-full overflow-y-auto flex flex-col gap-4 p-6 pb-32">
        {activeSession?.messages.map((msg) => (
          <div key={msg.id} className="flex flex-col gap-1 max-w-[80%]">
            {msg?.file?.map((file, i) => {
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
                  className="flex items-center self-end gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1 text-xs text-gray-600 z-20 w-fit"
                >
                  <Icon icon={fileIcon()} size={24} />
                  <span className="max-w-[140px] text-sm font-medium truncate">
                    {file.name}
                  </span>
                  {/* <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveFile(i);
                    }}
                    className="ml-0.5 rounded-full p-0.5 hover:bg-gray-100"
                    aria-label={`Remove ${file.name}`}
                  >
                    <Icon icon="ph:x" className="h-3 w-3 text-gray-400" />
                  </button> */}
                </li>
              );
            })}

            <div
              className={`flex flex-col max-w-[80%] rounded-xl p-3 ${
                msg.sender === "user"
                  ? "self-end bg-muted/10 text-black rounded-br-none"
                  : "self-start bg-muted/10 text-foreground border border-muted/20 rounded-bl-none"
              }`}
            >
              <p className="text-sm leading-relaxed whitespace-pre-wrap">
                {msg.text}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Input / Composer Area */}
      <div className="absolute bottom-12 w-full">
        <div className="flex flex-col gap-2 w-[90%] mx-auto">
          {files.length > 0 && (
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
                        handleRemoveFile(i);
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
          )}
          <div className="flex flex-col items-center gap-2 w-full rounded-full bg-[#F9F9F9] border border-muted/20 shadow-md p-1.5 min-h-[74px] mx-auto">
            <div className="flex items-center gap-2 w-full">
              <motion.button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                whileTap={{scale: 0.95}}
                className="flex items-center justify-center h-10 w-10 rounded-full bg-muted/15 hover:bg-muted/25 transition-colors flex-shrink-0"
              >
                <Icon icon="line-md:plus" size={16} color="black" />
              </motion.button>

              <input
                ref={fileInputRef}
                type="file"
                multiple
                className="hidden"
                onChange={(e) => {
                  if (e.target.files) {
                    handleFilesAdded(Array.from(e.target.files));
                  }
                }}
              />

              <textarea
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Ask a follow-up question..."
                className="w-full resize-none border-none text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none"
                rows={1}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
              />

              <motion.button
                type="button"
                onClick={handleSend}
                whileTap={{scale: 0.95}}
                disabled={!question.trim() && files.length === 0}
                className="flex items-center justify-center h-10 w-10 rounded-full bg-primary hover:opacity-90 text-white transition-opacity disabled:cursor-not-allowed disabled:opacity-30 flex-shrink-0"
              >
                <Icon icon="ph:arrow-up" size={16} />
              </motion.button>
            </div>
          </div>
        </div>
      </div>

      <DragImageOverlay isVisible={isDraggingFile} />
    </div>
  );
}
