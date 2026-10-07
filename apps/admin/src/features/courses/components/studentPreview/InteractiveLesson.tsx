"use client";

import {useMemo, useState} from "react";
import {Button, Icon} from "@mcc/ui";
import {splitIntoBlocks} from "@/src/features/courses/helper/lessonBlocks";
import {normalizeLessonHtml, relaxSpaces} from "@/src/features/courses/helper/lessonHtml";
import {LESSON_CONTENT_CSS} from "@/src/features/courses/helper/lessonCss";

/**
 * A port of the learner app's InteractiveLessonContent: an HTML lesson is
 * shown one section (split at each heading) at a time with Back / Next. The
 * "Ask Brainy" button is shown as students see it but is inert in the preview.
 * Shared by the course and exam previews.
 */
export default function InteractiveLesson({
  html,
  onComplete,
}: {
  html: string;
  onComplete: () => void;
}) {
  const blocks = useMemo(() => splitIntoBlocks(html), [html]);
  const [index, setIndex] = useState(0);

  const block = blocks[index];
  const blockHtml = useMemo(() => (block ? normalizeLessonHtml(block.html) : ""), [block]);
  const isLast = index >= blocks.length - 1;
  const progress = blocks.length ? ((index + 1) / blocks.length) * 100 : 0;

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
        <div className="h-full bg-primary transition-all duration-300" style={{width: `${progress}%`}} />
      </div>

      <div className="min-h-[320px] min-w-0 px-4 py-6 sm:px-6 sm:py-8 md:px-10 md:py-10">
        {block.heading && (
          <h2
            className="mb-4 text-lg font-semibold text-primary break-words"
            dangerouslySetInnerHTML={{__html: relaxSpaces(block.heading)}}
          />
        )}
        <div
          className="lesson-block-content"
          dangerouslySetInnerHTML={{__html: blockHtml}}
        />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-muted/20 px-3 py-3 sm:px-4">
        <Button variant="outline" size="sm" onClick={() => setIndex((i) => Math.max(i - 1, 0))} disabled={index === 0}>
          <Icon icon="lucide:chevron-left" size={16} />
          Back
        </Button>

        <Button
          variant="outline"
          size="sm"
          disabled
          title="Students can ask Brainy about this section"
          className="order-last w-full text-primary border-primary/40 sm:order-none sm:w-auto"
        >
          <Icon icon="mingcute:ai-fill" size={14} />
          Ask Brainy
        </Button>

        <Button
          variant="primary"
          size="sm"
          onClick={() => (isLast ? onComplete() : setIndex((i) => i + 1))}
        >
          {isLast ? "Continue" : "Next"}
          <Icon icon="lucide:chevron-right" size={16} />
        </Button>
      </div>

      <style dangerouslySetInnerHTML={{__html: LESSON_CONTENT_CSS}} />
    </div>
  );
}
