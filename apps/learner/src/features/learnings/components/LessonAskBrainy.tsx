"use client";

import {useState} from "react";
import {Button, Icon} from "@mcc/ui";
import {chatReplyText, sendChatMessage} from "@/src/features/brainy/services/brainy.service";

interface LessonAskBrainyProps {
  lessonTitle: string;
  /** The section being read, so the answer is about it. */
  heading?: string | null;
  /** Positioning from the caller: it must be `relative` or `absolute` so the popover anchors to the button. */
  className?: string;
  /** Where the popover sits against the button: centred in a toolbar, or right-aligned at a screen edge. */
  align?: "center" | "right";
}

/** The "Ask Brainy" button and its question popover, for one section of a text lesson. */
export default function LessonAskBrainy({lessonTitle, heading, className = "relative", align = "center"}: LessonAskBrainyProps) {
  const [open, setOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [reply, setReply] = useState<string | null>(null);
  const [asking, setAsking] = useState(false);

  async function handleAsk() {
    const message = question.trim();
    if (!message || asking) return;
    setAsking(true);
    try {
      const result = await sendChatMessage(message, {
        context: {lesson_title: lessonTitle, block_heading: heading ?? undefined},
      });
      setReply(chatReplyText(result));
    } catch {
      setReply("Sorry, I couldn't get an answer just now. Please try again.");
    } finally {
      setAsking(false);
    }
  }

  return (
    <div className={className}>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setOpen((v) => !v)}
        className="w-full text-primary border-primary/40 bg-background sm:w-auto"
      >
        <Icon icon="mingcute:ai-fill" size={14} />
        Ask Brainy
      </Button>

      {open && (
        <div className={`absolute bottom-full z-20 mb-3 w-[min(20rem,calc(100vw-2rem))] rounded-2xl border border-muted/30 bg-background p-4 shadow-xl ${align === "right" ? "right-0" : "left-1/2 -translate-x-1/2 max-sm:left-auto max-sm:right-0 max-sm:translate-x-0"}`}>
          <div className="mb-2 flex items-center justify-between">
            <p className="text-xs font-medium text-subtle">Ask about this section</p>
            <button type="button" onClick={() => setOpen(false)} aria-label="Close" className="text-subtle hover:text-foreground">
              <Icon icon="lucide:x" size={14} />
            </button>
          </div>
          {reply && (
            <div className="mb-3 max-h-40 overflow-y-auto rounded-xl bg-muted/10 p-3 text-sm text-foreground">{reply}</div>
          )}
          <div className="flex items-center gap-2">
            <input
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAsk();
                }
              }}
              placeholder="Type a question..."
              className="w-full min-w-0 rounded-lg border border-muted/30 px-3 py-2 text-sm outline-none focus:border-primary/50"
              disabled={asking}
            />
            <Button size="sm" onClick={handleAsk} disabled={!question.trim()} loading={asking}>
              <Icon icon="lucide:arrow-up" size={14} />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
