"use client";

import {useMemo, useState} from "react";
import {Button, Icon} from "@mcc/ui";
import {sendChatMessage} from "@/src/features/brainy/services/brainy.service";
import {splitIntoBlocks} from "@/src/features/learnings/helper/lessonBlocks";

interface InteractiveLessonContentProps {
  html: string;
  lessonTitle: string;
  /** Called once the student finishes the last block -- the caller's own
   * "lesson watched" completion path (same one video onEnded uses). */
  onComplete: () => void;
}

export default function InteractiveLessonContent({
  html,
  lessonTitle,
  onComplete,
}: InteractiveLessonContentProps) {
  const blocks = useMemo(() => splitIntoBlocks(html), [html]);
  const [index, setIndex] = useState(0);
  const [askOpen, setAskOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [reply, setReply] = useState<string | null>(null);
  const [asking, setAsking] = useState(false);

  const block = blocks[index];
  const isLast = index >= blocks.length - 1;
  const progress = blocks.length ? ((index + 1) / blocks.length) * 100 : 0;

  function resetAsk() {
    setAskOpen(false);
    setReply(null);
    setQuestion("");
  }

  function goNext() {
    if (isLast) {
      onComplete();
      return;
    }
    setIndex((i) => i + 1);
    resetAsk();
  }

  function goBack() {
    if (index === 0) return;
    setIndex((i) => i - 1);
    resetAsk();
  }

  async function handleAsk() {
    const message = question.trim();
    if (!message || asking) return;
    setAsking(true);
    try {
      const result = await sendChatMessage(message, {
        context: {lesson_title: lessonTitle, block_heading: block?.heading ?? undefined},
      });
      setReply(result.reply);
    } catch {
      setReply("Sorry, I couldn't get an answer just now. Please try again.");
    } finally {
      setAsking(false);
    }
  }

  if (!block) {
    return (
      <div className="flex aspect-video w-full items-center justify-center rounded-2xl bg-muted/10 text-sm text-muted">
        This lesson has no content yet.
      </div>
    );
  }

  return (
    <div className="w-full min-w-0 max-w-full rounded-2xl border border-muted/20 overflow-hidden">
      <div className="h-1 w-full bg-muted/20">
        <div
          className="h-full bg-primary transition-all duration-300"
          style={{width: `${progress}%`}}
        />
      </div>

      <div className="min-h-[320px] min-w-0 px-4 py-6 sm:px-6 sm:py-8 md:px-10 md:py-10">
        {block.heading && (
          <h2 className="mb-4 text-lg font-semibold text-primary break-words">{block.heading}</h2>
        )}
        <div
          className="prose prose-sm max-w-none break-words text-gray-800 [&_img]:max-w-full [&_img]:rounded-lg [&_p]:mb-4 [&_p:last-child]:mb-0"
          dangerouslySetInnerHTML={{__html: block.html}}
        />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-muted/20 px-3 py-3 sm:px-4">
        <Button variant="outline" size="sm" onClick={goBack} disabled={index === 0}>
          <Icon icon="lucide:chevron-left" size={16} />
          Back
        </Button>

        <div className="relative order-last w-full sm:order-none sm:w-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setAskOpen((v) => !v)}
            className="w-full text-primary border-primary/40 sm:w-auto"
          >
            <Icon icon="mingcute:ai-fill" size={14} />
            Ask Brainy
          </Button>

          {askOpen && (
            <div className="absolute bottom-full left-1/2 z-20 mb-3 w-[min(20rem,calc(100vw-2rem))] -translate-x-1/2 rounded-2xl border border-muted/30 bg-background p-4 shadow-xl">
              <div className="mb-2 flex items-center justify-between">
                <p className="text-xs font-medium text-subtle">Ask about this section</p>
                <button
                  type="button"
                  onClick={() => setAskOpen(false)}
                  aria-label="Close"
                  className="text-subtle hover:text-gray-700"
                >
                  <Icon icon="lucide:x" size={14} />
                </button>
              </div>
              {reply && (
                <div className="mb-3 max-h-40 overflow-y-auto rounded-xl bg-muted/10 p-3 text-sm text-gray-800">
                  {reply}
                </div>
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
                <Button
                  size="sm"
                  onClick={handleAsk}
                  disabled={!question.trim()}
                  loading={asking}
                >
                  <Icon icon="lucide:arrow-up" size={14} />
                </Button>
              </div>
            </div>
          )}
        </div>

        <Button variant="primary" size="sm" onClick={goNext}>
          {isLast ? "Continue" : "Next"}
          <Icon icon="lucide:chevron-right" size={16} />
        </Button>
      </div>
    </div>
  );
}
