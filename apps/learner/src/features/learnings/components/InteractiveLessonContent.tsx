"use client";

import {useMemo, useState} from "react";
import {Button, Icon} from "@mcc/ui";
import {splitIntoBlocks} from "@/src/features/learnings/helper/lessonBlocks";
import {normalizeLessonHtml, relaxSpaces} from "@/src/features/learnings/helper/lessonHtml";
import {LESSON_CONTENT_CSS} from "@/src/features/learnings/helper/lessonCss";
import {useSwipeMode} from "@/src/features/learnings/hooks/useSwipeMode";
import LessonAskBrainy from "./LessonAskBrainy";
import LessonSwipePager from "./LessonSwipePager";

interface InteractiveLessonContentProps {
  html: string;
  lessonTitle: string;
  /** Called once the student finishes the last block -- the caller's own
   * "lesson watched" completion path (same one video onEnded uses). */
  onComplete: () => void;
}

/**
 * A text lesson, one <h2> section at a time. On phones and tablets the sections are swiped through (up for
 * the next, down to go back); on a desktop they are paged with Back and Next buttons.
 */
export default function InteractiveLessonContent({
  html,
  lessonTitle,
  onComplete,
}: InteractiveLessonContentProps) {
  const blocks = useMemo(() => splitIntoBlocks(html), [html]);
  const swipe = useSwipeMode();

  if (blocks.length === 0) {
    return (
      <div className="flex aspect-video w-full items-center justify-center rounded-2xl bg-muted/10 text-sm text-muted">
        This lesson has no content yet.
      </div>
    );
  }

  if (swipe) {
    // Keyed on the lesson so moving to another one starts at its first section.
    return <LessonSwipePager key={html} blocks={blocks} lessonTitle={lessonTitle} onComplete={onComplete} />;
  }

  return <ButtonLesson key={html} blocks={blocks} lessonTitle={lessonTitle} onComplete={onComplete} />;
}

function ButtonLesson({
  blocks,
  lessonTitle,
  onComplete,
}: {
  blocks: ReturnType<typeof splitIntoBlocks>;
  lessonTitle: string;
  onComplete: () => void;
}) {
  const [index, setIndex] = useState(0);

  const block = blocks[index];
  // Quill's lists need rebuilding to show bullets and numbers without Quill's stylesheet.
  const blockHtml = useMemo(() => (block ? normalizeLessonHtml(block.html) : ""), [block]);
  const isLast = index >= blocks.length - 1;
  const progress = blocks.length ? ((index + 1) / blocks.length) * 100 : 0;

  function goNext() {
    if (isLast) {
      onComplete();
      return;
    }
    setIndex((i) => i + 1);
  }

  function goBack() {
    if (index === 0) return;
    setIndex((i) => i - 1);
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
          // block.heading is plain text (tags already stripped in
          // splitIntoBlocks) but may still contain HTML entities like
          // &nbsp; from Quill -- dangerouslySetInnerHTML lets the browser
          // decode them, same as JSX text interpolation never would.
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
        <Button variant="outline" size="sm" onClick={goBack} disabled={index === 0}>
          <Icon icon="lucide:chevron-left" size={16} />
          Back
        </Button>

        {/* Keyed on the section so a question and its answer don't carry over to the next one. */}
        <LessonAskBrainy key={index} lessonTitle={lessonTitle} heading={block.heading} className="relative order-last w-full sm:order-none sm:w-auto" />

        <Button variant="primary" size="sm" onClick={goNext}>
          {isLast ? "Continue" : "Next"}
          <Icon icon="lucide:chevron-right" size={16} />
        </Button>
      </div>

      {/* Lesson typography: lists, headings, quotes, links, tables and Quill's class-based
          formats (see lessonCss.ts). Tailwind's `prose` isn't installed in this app. */}
      <style dangerouslySetInnerHTML={{__html: LESSON_CONTENT_CSS}} />
    </div>
  );
}
