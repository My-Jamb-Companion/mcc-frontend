"use client";

import {useState, useRef, useEffect} from "react";
import {createPortal} from "react-dom";
import {Plus, Send} from "lucide-react";
import {BrainyMark, Icon, motion, AnimatePresence} from "@mcc/ui";
import {usePromptSuggestions} from "@/src/features/brainy/hooks/useDiscover";
import MarkdownMessage from "@/src/features/brainy/components/MarkdownMessage";

interface Message {
  id: string;
  role: "user" | "assistant";
  body: string;
}

interface AIChatProps {
  /** Overrides the real GET /brainy/prompts/suggestions fetch -- mainly for
   * tests; every real caller lets this come from the API. */
  suggestions?: string[];
  onSend: (message: string) => Promise<string>;
  placeholder?: string;
  className?: string;
}

const COULD_NOT_ANSWER = "Brainy couldn't answer that just now. Please try again in a moment.";

/**
 * Brainy beside a course. It sits in the side panel, and "Focus" lifts the same conversation into a large
 * window over the page so the student can work with Brainy properly, then "Collapse" (or Esc) puts it back.
 * The conversation lives here, not in the panel, so it survives the move.
 */
export default function BrainyCourseSidePanel({
  suggestions: suggestionsProp,
  onSend,
  placeholder = "Ask Brainy about this course",
  className = "h-screen",
}: AIChatProps) {
  const {suggestions: apiSuggestions} = usePromptSuggestions();
  const suggestions = suggestionsProp ?? apiSuggestions;
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState(false);

  const handleSend = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    setMessages((prev) => [...prev, {id: crypto.randomUUID(), role: "user", body: trimmed}]);
    setInput("");
    setLoading(true);

    try {
      const reply = await onSend(trimmed);
      setMessages((prev) => [...prev, {id: crypto.randomUUID(), role: "assistant", body: reply}]);
    } catch {
      setMessages((prev) => [...prev, {id: crypto.randomUUID(), role: "assistant", body: COULD_NOT_ANSWER}]);
    } finally {
      setLoading(false);
    }
  };

  // Esc collapses the focused window, and the page behind it stays still while it is open.
  useEffect(() => {
    if (!focused) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setFocused(false);
    window.addEventListener("keydown", onKey);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
    };
  }, [focused]);

  const surface = (isFocused: boolean) => (
    <ChatSurface
      focused={isFocused}
      messages={messages}
      loading={loading}
      input={input}
      onInput={setInput}
      onSend={handleSend}
      suggestions={suggestions}
      placeholder={placeholder}
      onToggleFocus={() => setFocused((f) => !f)}
      className={isFocused ? "h-full" : className}
    />
  );

  if (!focused) return surface(false);

  return (
    <>
      {/* Keeps the panel's place while Brainy is open in focus. */}
      <div className={`flex w-full flex-col items-center justify-center gap-3 rounded-2xl border border-muted/30 p-6 text-center ${className}`}>
        <BrainyMark badge size={40} alt="Brainy AI" />
        <p className="text-sm font-medium text-foreground">Brainy is open in focus view</p>
        <button
          type="button"
          onClick={() => setFocused(false)}
          className="rounded-full border border-muted/40 px-4 py-1.5 text-sm font-semibold text-foreground hover:bg-muted/10 cursor-pointer"
        >
          Bring it back here
        </button>
      </div>
      {createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-8" role="dialog" aria-modal="true" aria-label="Brainy AI">
          <div className="absolute inset-0 bg-black/55 backdrop-blur-[2px]" onClick={() => setFocused(false)} aria-hidden="true" />
          <motion.div
            className="relative flex h-full max-h-[900px] w-full max-w-4xl overflow-hidden rounded-3xl bg-background shadow-2xl"
            initial={{opacity: 0, scale: 0.96, y: 12}}
            animate={{opacity: 1, scale: 1, y: 0}}
            transition={{type: "spring", stiffness: 320, damping: 30}}
          >
            {surface(true)}
          </motion.div>
        </div>,
        document.body,
      )}
    </>
  );
}

interface ChatSurfaceProps {
  focused: boolean;
  messages: Message[];
  loading: boolean;
  input: string;
  onInput: (value: string) => void;
  onSend: (text: string) => void;
  suggestions: string[];
  placeholder: string;
  onToggleFocus: () => void;
  className: string;
}

function ChatSurface({focused, messages, loading, input, onInput, onSend, suggestions, placeholder, onToggleFocus, className}: ChatSurfaceProps) {
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const hasMessages = messages.length > 0;

  // Stay at the latest message, including when the surface is first drawn (the focus view mounts a fresh one).
  useEffect(() => {
    const el = messagesContainerRef.current;
    if (!el) return;
    el.scrollTo({top: el.scrollHeight, behavior: "smooth"});
  }, [messages, loading, focused]);

  // Auto-grow textarea
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, [input]);

  useEffect(() => {
    if (focused) textareaRef.current?.focus();
  }, [focused]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSend(input);
    }
  };

  return (
    <div className={`flex flex-col w-full font-sans ${focused ? "" : "border border-muted/30 rounded-2xl"} ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between gap-3 border-b border-muted/20 px-4 py-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <BrainyMark badge size={focused ? 36 : 30} alt="Brainy AI" />
          <div className="min-w-0">
            <p className="text-sm font-semibold text-foreground leading-tight">Brainy AI</p>
            <p className="text-xs text-subtle leading-tight truncate">Your study companion for this course</p>
          </div>
        </div>
        <button
          type="button"
          onClick={onToggleFocus}
          aria-label={focused ? "Collapse Brainy" : "Open Brainy in focus view"}
          className="flex shrink-0 items-center gap-1.5 rounded-full border border-muted/30 px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-muted/10 transition-colors cursor-pointer"
        >
          <Icon icon={focused ? "ph:arrows-in-simple" : "ph:arrows-out-simple"} size={14} />
          {focused ? "Collapse" : "Focus"}
        </button>
      </div>

      {/* Message area */}
      <div ref={messagesContainerRef} className="flex-1 overflow-y-auto px-4 py-6 min-h-0">
        <div className={focused ? "mx-auto w-full max-w-3xl h-full" : "h-full"}>
          <AnimatePresence mode="wait">
            {!hasMessages ? (
              <motion.div
                key="empty"
                className="flex flex-col h-full"
                initial={{opacity: 0}}
                animate={{opacity: 1}}
                exit={{opacity: 0}}
                transition={{duration: 0.2}}
              >
                <div className="flex-1 flex flex-col items-center justify-center gap-3">
                  <BrainyMark size={focused ? 72 : 56} alt="Brainy AI" />
                  <motion.p
                    className="text-center text-base font-semibold text-foreground leading-snug px-8"
                    initial={{opacity: 0, y: 10}}
                    animate={{opacity: 1, y: 0}}
                    transition={{delay: 0.1, duration: 0.4}}
                  >
                    Do you have any questions
                    <br />
                    about this course?
                  </motion.p>
                </div>

                <div className="flex flex-col gap-2 pb-2">
                  {suggestions.map((s, i) => (
                    <SuggestionChip key={s} label={s} index={i} onClick={() => onSend(s)} />
                  ))}
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="conversation"
                className="flex flex-col gap-5"
                initial={{opacity: 0}}
                animate={{opacity: 1}}
                transition={{duration: 0.2}}
              >
                {messages.map((m) => (
                  <MessageRow key={m.id} message={m} />
                ))}
                <AnimatePresence>
                  {loading && (
                    <motion.div
                      className="flex items-center gap-2"
                      initial={{opacity: 0, y: 6}}
                      animate={{opacity: 1, y: 0}}
                      exit={{opacity: 0}}
                      transition={{duration: 0.15}}
                    >
                      <BrainyMark badge size={28} alt="Brainy AI" />
                      <div className="bg-muted/10 rounded-2xl px-4 py-3 flex gap-1 items-center" aria-label="Brainy is thinking">
                        <span className="w-1.5 h-1.5 rounded-full bg-subtle animate-bounce [animation-delay:0ms]" />
                        <span className="w-1.5 h-1.5 rounded-full bg-subtle animate-bounce [animation-delay:150ms]" />
                        <span className="w-1.5 h-1.5 rounded-full bg-subtle animate-bounce [animation-delay:300ms]" />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Input bar */}
      <div className="border-t border-muted/20 px-3 py-2">
        <div className={focused ? "mx-auto w-full max-w-3xl" : ""}>
          <div className="flex items-end gap-2 border border-muted/30 rounded-2xl px-3 py-2 focus-within:border-primary/60 transition-colors">
            <button
              type="button"
              aria-label="Attach"
              className="shrink-0 w-6 h-6 flex items-center justify-center text-subtle hover:text-foreground transition-colors mb-0.5"
            >
              <Plus className="w-5 h-5" />
            </button>
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => onInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              rows={1}
              aria-label="Message Brainy"
              className="flex-1 text-sm text-foreground placeholder:text-subtle resize-none outline-none leading-relaxed max-h-40 bg-transparent"
            />
            <motion.button
              type="button"
              onClick={() => onSend(input)}
              disabled={!input.trim() || loading}
              aria-label="Send"
              className="shrink-0 w-7 h-7 flex items-center justify-center rounded-full bg-violet-600 text-white hover:bg-violet-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all mb-0.5"
              whileTap={{scale: 0.9}}
            >
              <Send className="w-3.5 h-3.5" />
            </motion.button>
          </div>
          <p className="text-center text-[11px] text-subtle mt-2 px-2">
            Brainy can make mistakes. Check important answers with your Tutor or the lesson.
          </p>
        </div>
      </div>
    </div>
  );
}

function SuggestionChip({label, onClick, index = 0}: {label: string; onClick: () => void; index?: number}) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      className="w-full text-left px-4 py-3 rounded-xl border border-muted/30 text-sm text-foreground hover:bg-muted/10 hover:border-muted/50 transition-colors cursor-pointer"
      initial={{opacity: 0, y: 8}}
      animate={{opacity: 1, y: 0}}
      transition={{delay: 0.2 + index * 0.06, duration: 0.25}}
      whileTap={{scale: 0.98}}
    >
      {label}
    </motion.button>
  );
}

/** The student's turn is a bubble; Brainy's answer runs full width as formatted text, as in the Brainy chat. */
function MessageRow({message}: {message: Message}) {
  if (message.role === "user") {
    return (
      <motion.div
        className="flex justify-end"
        initial={{opacity: 0, y: 8}}
        animate={{opacity: 1, y: 0}}
        transition={{duration: 0.18}}
      >
        <div className="max-w-[85%] rounded-2xl rounded-br-sm bg-violet-600 px-4 py-2.5 text-sm leading-relaxed text-white whitespace-pre-wrap">
          {message.body}
        </div>
      </motion.div>
    );
  }
  return (
    <motion.div
      className="flex w-full flex-col gap-1.5"
      initial={{opacity: 0, y: 8}}
      animate={{opacity: 1, y: 0}}
      transition={{duration: 0.18}}
    >
      <BrainyMark badge size={28} alt="Brainy AI" />
      <MarkdownMessage content={message.body} />
    </motion.div>
  );
}
