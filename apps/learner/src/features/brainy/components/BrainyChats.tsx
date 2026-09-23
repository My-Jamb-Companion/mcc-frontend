"use client";

import {Icon, motion, showError} from "@mcc/ui";
import {extractApiError} from "@mcc/api";
import {useCallback, useState, useRef, useMemo, useEffect} from "react";
import DragImageOverlay, {useGlobalFileDrag} from "./DragFile";
import {useBrainy} from "../contexts/BrainyContext";
import {useParams, useRouter} from "next/navigation";
import {sendChatMessage} from "../services/brainy.service";
import {uploadAttachments} from "../helper/uploadAttachments";
import MarkdownMessage from "./MarkdownMessage";
import AiUsageLog, {MessageUsage} from "./AiUsageLog";
import {useQueryClient} from "@tanstack/react-query";
import {ALLOWANCE_QUERY_KEY, USAGE_QUERY_KEY} from "../hooks/useBrainyChat";
import AllowanceMeter from "./AllowanceMeter";
import {isAllowanceUsed} from "../helper/charge";

export default function BrainyChats() {
  const [question, setQuestion] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [isSending, setIsSending] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const queryClient = useQueryClient();

  const {
    sessions,
    activeSessionId,
    setActiveSessionId,
    addMessageToSession,
    loadSessionMessages,
    sessionsLoading,
  } = useBrainy();

  // The URL is the source of truth for which thread is open. Context state
  // resets on a refresh, so without this the page had no id to work from and
  // bounced to /brainy/new -- part of why conversations looked lost.
  const params = useParams<{id?: string}>();
  const routeSessionId = typeof params?.id === "string" ? params.id : undefined;

  useEffect(() => {
    if (routeSessionId && routeSessionId !== activeSessionId) {
      setActiveSessionId(routeSessionId);
    }
  }, [routeSessionId, activeSessionId, setActiveSessionId]);

  const currentSessionId = routeSessionId ?? activeSessionId;

  const activeSession = useMemo(() => {
    return sessions.find((s) => s.id === currentSessionId);
  }, [sessions, currentSessionId]);

  // On a refresh or a deep link the thread isn't in context yet -- pull it
  // from the server instead of bouncing the student back to /brainy/new,
  // which is what made every conversation look lost after a reload.
  const hydratedRef = useRef<string | null>(null);
  const [hydrating, setHydrating] = useState(false);
  const [notFound, setNotFound] = useState(false);

  // A thread can be listed in the sidebar (metadata from GET /brainy/sessions)
  // while its messages have never been fetched. Keying hydration off the
  // session *object* made loading a race: on a hard page load the sessions
  // query hadn't resolved yet so this ran, but clicking the same thread in the
  // sidebar found it already present and bailed -- rendering an empty chat.
  const needsMessages = !activeSession || activeSession.messages.length === 0;

  useEffect(() => {
    if (!currentSessionId || !needsMessages) return;
    if (hydratedRef.current === currentSessionId) return;

    hydratedRef.current = currentSessionId;
    setHydrating(true);
    loadSessionMessages(currentSessionId)
      .catch(() => setNotFound(true))
      .finally(() => setHydrating(false));
  }, [currentSessionId, needsMessages, loadSessionMessages]);

  useEffect(() => {
    if (notFound) router.replace("/brainy/new");
  }, [notFound, router]);

  const handleSend = async (override?: string) => {
    const trimmed = (override ?? question).trim();
    if (!trimmed && files.length === 0) return;
    const sessionId = currentSessionId;
    const pending = override ? [] : files;

    if (!trimmed || !sessionId) return;

    setIsSending(true);
    // Extract attachment text first: an unsupported file should stop the
    // send with a clear message rather than quietly asking about a document
    // the model never got.
    let attachments;
    try {
      attachments = await uploadAttachments(pending);
    } catch (error) {
      setIsSending(false);
      showError(
        extractApiError(error, "That file couldn't be read. Try a PDF or text file."),
      );
      return;
    }

    // Explicit id, not addMessageToActiveSession: context's activeSessionId
    // can still lag the URL on the first render after a deep link, and the
    // guarded helper silently no-ops when it's null (see BrainyContext).
    addMessageToSession(sessionId, "user", trimmed, pending);
    setQuestion("");
    setFiles([]);

    sendChatMessage(trimmed, {sessionId, attachments})
      .then(
        (result) =>
          // `generated: false` means the provider gave Brainy nothing usable
          // -- rate-limited, or out of token budget. Flagged so the student
          // gets a retry instead of a dead end that reads like a real answer.
          addMessageToSession(
            sessionId,
            "ai",
            result.reply,
            undefined,
            !result.generated,
            result.usage,
            result.charge,
          ),
        (error) =>
          addMessageToSession(
            sessionId,
            "ai",
            // Out of free tokens, allowance and gems: say so, rather than
            // blaming Brainy. The retry works once gems are added.
            "My brain is fuzzy right now. Please try again.",
            undefined,
            true,
            null,
            null,
            isAllowanceUsed(error)
              ? extractApiError(error, "You've used your Brainy allowance. Add gems to keep going.")
              : undefined,
          ),
      )
      .finally(() => {
        setIsSending(false);
        // Every answer moves the day's total, so the log's footer is stale
        // the moment one lands.
        queryClient.invalidateQueries({queryKey: USAGE_QUERY_KEY});
        queryClient.invalidateQueries({queryKey: ALLOWANCE_QUERY_KEY});
      });
  };

  // The question that produced a failed reply is the one immediately before
  // it, so retrying re-asks exactly what the student asked.
  const lastQuestionFor = useCallback(
    (messageId: string) => {
      const list = activeSession?.messages ?? [];
      const index = list.findIndex((m) => m.id === messageId);
      for (let i = index - 1; i >= 0; i--) {
        if (list[i].sender === "user") return list[i].text;
      }
      return undefined;
    },
    [activeSession],
  );

  const handleFilesAdded = useCallback((incoming: File[]) => {
    setFiles((prev) => [...prev, ...incoming]);
  }, []);

  const handleRemoveFile = useCallback((index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const isDraggingFile = useGlobalFileDrag(handleFilesAdded);

  if (!activeSession || (hydrating && needsMessages)) {
    // Still fetching (refresh / deep link / sidebar click) -- the redirect
    // only fires once the server has actually said the thread doesn't exist.
    return (
      <div className="flex h-full grow items-center justify-center bg-background">
        <p className="text-sm text-muted">
          {hydrating || sessionsLoading ? "Loading conversation…" : ""}
        </p>
      </div>
    );
  }

  return (
    <div className="relative flex flex-col h-full grow bg-background max-sm:pt-20">
      <div className="flex-1 w-full overflow-y-auto flex flex-col gap-4 p-6 pb-44 max-sm:px-0">
        {activeSession?.messages.map((msg) => (
          <div key={msg.id} className="flex flex-col gap-1">
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
                  className="flex items-center self-end gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1 text-xs text-gray-600 z-10 w-fit"
                >
                  <Icon icon={fileIcon()} size={24} />
                  <span className="max-w-[140px] text-sm font-medium truncate">
                    {file.name}
                  </span>
                </li>
              );
            })}

            {/* Only the student's turn is bubbled. Brainy's answers run full
                width like Claude's do -- an 80% cap squeezed code blocks and
                tables into an unreadable column. */}
            <div
              className={
                msg.sender === "user"
                  ? "flex flex-col max-w-[80%] self-end rounded-xl rounded-br-none bg-muted/10 p-3 text-foreground"
                  : "flex w-full flex-col self-start py-1"
              }
            >
              {msg.sender === "ai" && msg.degraded ? (
                // Not an answer -- Brainy never got one. Say so plainly and
                // make the retry one tap away, since the usual cause (the
                // provider's per-minute token ceiling) clears on its own.
                <div className="flex flex-col items-start gap-2 rounded-xl border border-muted/25 bg-muted/5 p-3">
                  <p className="text-sm leading-relaxed text-muted">
                    {msg.notice ?? (
                      <>
                        Brainy couldn&apos;t answer that one — it&apos;s busy right
                        now. Your question is safe; try again in a moment.
                      </>
                    )}
                  </p>
                  <button
                    type="button"
                    onClick={() => handleSend(lastQuestionFor(msg.id))}
                    disabled={isSending}
                    className="flex items-center gap-1.5 rounded-full border border-muted/30 px-3 py-1 text-xs font-medium text-foreground hover:bg-muted/15 disabled:opacity-40"
                  >
                    <Icon icon="ph:arrow-clockwise" size={14} />
                    Try again
                  </button>
                </div>
              ) : msg.sender === "ai" ? (
                <>
                  <MarkdownMessage content={msg.text} />
                  <MessageUsage message={msg} />
                </>
              ) : (
                <p className="text-sm leading-relaxed whitespace-pre-wrap">
                  {msg.text}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="absolute bottom-8 w-full max-sm:bottom-3">
        <AiUsageLog messages={activeSession?.messages ?? []} />
        <AllowanceMeter className="mx-auto w-[90%] max-sm:w-full" />
        <div className="flex flex-col w-[90%] mx-auto max-sm:w-full">
          {files.length > 0 && (
            <motion.div
              initial={{opacity: 0, height: 0}}
              animate={{opacity: 1, height: "auto"}}
              exit={{opacity: 0, height: 0}}
              transition={{duration: 0.18}}
              className="flex gap-2 p-3 pt-1 rounded-t-2xl border border-muted/20 border-b-0 shadow-sm w-[90%] mx-auto"
            >
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
                    if (
                      file.type === "image/jpeg" ||
                      file.type === "image/png"
                    ) {
                      return "fluent-color:image-20";
                    }
                    return "catppuccin:text";
                  };
                  return (
                    <li
                      key={`${file.name}-${i}`}
                      onClick={(e) => e.stopPropagation()}
                      className="flex items-center gap-1.5 rounded-lg border-2 border-gray-200 bg-white px-3 py-1 text-xs text-gray-600 z-10"
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
            </motion.div>
          )}

          <div className="flex flex-col items-center gap-2 w-full rounded-full bg-[#F9F9F9] border border-muted/20 shadow-md p-1.5 mx-auto">
            <div className="flex items-center gap-2 w-full">
              <motion.button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                whileTap={{scale: 0.95}}
                className="flex items-center justify-center h-10 w-10 rounded-full bg-muted/15 hover:bg-muted/25 transition-colors shrink-0"
              >
                <Icon icon="line-md:plus" size={16} color="black" />
              </motion.button>

              <input
                ref={fileInputRef}
                type="file"
                multiple
                // Matches what extraction.py can actually read; this input
                // previously had no accept filter at all, so any binary
                // could be picked.
                accept=".pdf,.txt,.md"
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
                // See BrainyChatBox: stops the browser pasting raw file bytes
                // into the prompt when a file is dropped on the textarea.
                onDrop={(e) => e.preventDefault()}
                placeholder="Ask a follow-up question..."
                className="w-full resize-none border-none bg-transparent text-sm text-foreground placeholder:text-muted focus:outline-none"
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
                onClick={() => handleSend()}
                whileTap={{scale: 0.95}}
                // Also disabled while a send is in flight -- attachment
                // extraction happens first, so there's a real pause here.
                disabled={isSending || (!question.trim() && files.length === 0)}
                className="flex items-center justify-center h-10 w-10 rounded-full bg-primary hover:opacity-90 text-white transition-opacity disabled:cursor-not-allowed disabled:opacity-30 shrink-0"
              >
                <Icon
                  icon={isSending ? "svg-spinners:180-ring-with-bg" : "ph:arrow-up"}
                  size={16}
                />
              </motion.button>
            </div>
          </div>
        </div>
      </div>

      <DragImageOverlay isVisible={isDraggingFile} />
    </div>
  );
}
