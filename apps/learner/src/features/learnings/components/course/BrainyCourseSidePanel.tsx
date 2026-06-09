import {useState, useRef, useEffect} from "react";
import {Plus, Send, ArrowUp} from "lucide-react";
import {motion, AnimatePresence} from "@mcc/ui";

// ─── Types ───────────────────────────────────────────────────────────────────

interface Message {
  id: string;
  role: "user" | "assistant";
  body: string;
}

interface AIChatProps {
  suggestions?: string[];
  onSend?: (message: string) => Promise<string>;
  placeholder?: string;
}

// ─── AIChatPanel (main export) ────────────────────────────────────────────────

export default function BrainyCourseSidePanel({
  suggestions = DEFAULT_SUGGESTIONS,
  onSend,
  placeholder = "Message",
}: AIChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const hasMessages = messages.length > 0;

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({behavior: "smooth"});
  }, [messages, loading]);

  // Auto-grow textarea
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, [input]);

  const handleSend = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: "user",
      body: trimmed,
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const reply = await (onSend ? onSend(trimmed) : fakeAIResponse(trimmed));
      const aiMsg: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        body: reply,
      };
      setMessages((prev) => [...prev, aiMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend(input);
    }
  };

  return (
    <div className="flex flex-col h-screen w-full font-sans bg-white border border-muted/30 rounded-2xl">
      {/* Scroll hint */}
      <motion.div
        className="flex justify-center py-3 border-b border-gray-100"
        initial={{opacity: 0, y: -10}}
        animate={{opacity: 1, y: 0}}
        transition={{duration: 0.3}}
      >
        <span className="flex items-center gap-1.5 text-xs text-gray-400">
          <ArrowUp className="w-3 h-3" />
          Scroll up for past messages
        </span>
      </motion.div>

      {/* Message area */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <AnimatePresence mode="wait">
          {!hasMessages ? (
            /* Empty state */
            <motion.div
              key="empty"
              className="flex flex-col h-full"
              initial={{opacity: 0}}
              animate={{opacity: 1}}
              exit={{opacity: 0}}
              transition={{duration: 0.2}}
            >
              <div className="flex-1 flex items-center justify-center">
                <motion.p
                  className="text-center text-base font-semibold text-gray-800 leading-snug px-8"
                  initial={{opacity: 0, y: 10}}
                  animate={{opacity: 1, y: 0}}
                  transition={{delay: 0.1, duration: 0.4}}
                >
                  Do you have any questions
                  <br />
                  about this course?
                </motion.p>
              </div>

              {/* Suggestion chips */}
              <div className="flex flex-col gap-2 pb-2">
                {suggestions.map((s, i) => (
                  <SuggestionChip
                    key={s}
                    label={s}
                    index={i}
                    onClick={() => handleSend(s)}
                  />
                ))}
              </div>
            </motion.div>
          ) : (
            /* Conversation */
            <motion.div
              key="conversation"
              className="flex flex-col gap-3"
              initial={{opacity: 0}}
              animate={{opacity: 1}}
              transition={{duration: 0.2}}
            >
              {messages.map((m) => (
                <MessageBubble key={m.id} message={m} />
              ))}
              <AnimatePresence>
                {loading && (
                  <motion.div
                    className="flex justify-start"
                    initial={{opacity: 0, scale: 0.9}}
                    animate={{opacity: 1, scale: 1}}
                    exit={{opacity: 0, scale: 0.9}}
                    transition={{duration: 0.15}}
                  >
                    <div className="bg-gray-100 rounded-2xl rounded-bl-sm px-4 py-3 flex gap-1 items-center">
                      <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce [animation-delay:0ms]" />
                      <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce [animation-delay:150ms]" />
                      <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce [animation-delay:300ms]" />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              <div ref={bottomRef} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Input bar */}
      <motion.div
        className="border-t border-gray-100 px-3 py-2"
        initial={{opacity: 0, y: 20}}
        animate={{opacity: 1, y: 0}}
        transition={{delay: 0.2, duration: 0.35}}
      >
        <div className="flex items-end gap-2 border border-gray-200 rounded-2xl px-3 py-2 bg-white focus-within:border-gray-300 transition-colors">
          <button className="flex-shrink-0 w-6 h-6 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors mb-0.5">
            <Plus className="w-5 h-5" />
          </button>
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            rows={1}
            className="flex-1 text-sm text-gray-700 placeholder:text-gray-400 resize-none outline-none leading-relaxed max-h-32 bg-transparent"
          />
          <motion.button
            onClick={() => handleSend(input)}
            disabled={!input.trim() || loading}
            className="flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-full bg-violet-500 text-white hover:bg-violet-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all mb-0.5"
            whileTap={{scale: 0.9}}
          >
            <Send className="w-3.5 h-3.5" />
          </motion.button>
        </div>
        <p className="text-center text-[11px] text-gray-400 mt-2 px-2">
          Our AI assistant may make mistakes. Verify for accuracy.
        </p>
      </motion.div>
    </div>
  );
}

// ─── Suggestion chips ─────────────────────────────────────────────────────────

function SuggestionChip({
  label,
  onClick,
  index = 0,
}: {
  label: string;
  onClick: () => void;
  index?: number;
}) {
  return (
    <motion.button
      onClick={onClick}
      className="w-full text-left px-4 py-3 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-colors"
      initial={{opacity: 0, y: 8}}
      animate={{opacity: 1, y: 0}}
      transition={{delay: 0.2 + index * 0.06, duration: 0.25}}
      whileHover={{scale: 1.015}}
      whileTap={{scale: 0.98}}
    >
      {label}
    </motion.button>
  );
}

// ─── Message bubble ───────────────────────────────────────────────────────────

function MessageBubble({message}: {message: Message}) {
  const isUser = message.role === "user";
  return (
    <motion.div
      className={`flex ${isUser ? "justify-end" : "justify-start"}`}
      initial={{opacity: 0, y: 10, scale: 0.95}}
      animate={{opacity: 1, y: 0, scale: 1}}
      transition={{type: "spring", stiffness: 400, damping: 25}}
    >
      <div
        className={`max-w-[80%] text-sm px-4 py-2.5 leading-relaxed ${
          isUser
            ? "bg-blue-500 text-white rounded-2xl rounded-br-sm"
            : "bg-gray-100 text-gray-800 rounded-2xl rounded-bl-sm"
        }`}
      >
        {message.body}
      </div>
    </motion.div>
  );
}

// ─── Default suggestions ──────────────────────────────────────────────────────

const DEFAULT_SUGGESTIONS = [
  "Give me an overview of the course",
  "Summarize the main points of this lecture",
  "What is the difference between absolute and relative",
  "Why are relative stretch important in pilates",
];

// ─── Fake AI response ─────────────────────────────────────────────────────────

async function fakeAIResponse(message: string): Promise<string> {
  await new Promise((r) => setTimeout(r, 800));
  return `Here's a helpful answer about "${message}". Our AI assistant can provide course summaries, explain concepts, and answer questions about lecture content.`;
}
