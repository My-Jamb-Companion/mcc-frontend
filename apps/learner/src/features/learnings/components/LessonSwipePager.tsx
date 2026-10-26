"use client";

import {useEffect, useMemo, useRef, useState} from "react";
import {createPortal} from "react-dom";
import {Button, Icon} from "@mcc/ui";
import type {ContentBlock} from "@/src/features/learnings/helper/lessonBlocks";
import {lessonProgress, targetPage} from "@/src/features/learnings/helper/lessonPager";
import {normalizeLessonHtml, relaxSpaces} from "@/src/features/learnings/helper/lessonHtml";
import {LESSON_CONTENT_CSS} from "@/src/features/learnings/helper/lessonCss";
import LessonAskBrainy from "./LessonAskBrainy";

interface LessonSwipePagerProps {
  blocks: ContentBlock[];
  lessonTitle: string;
  /** Called when the student taps Continue on the closing page, the same completion path the desktop "Next" uses. */
  onComplete: () => void;
}

/**
 * A text lesson for phones and tablets: every section (each <h2> block) is a full page, and the student swipes
 * up for the next one and down to go back. It is one native scroll container with scroll snapping, so the swipe
 * feels like the device's own, needs no gesture code, and a section taller than the screen still scrolls inside
 * itself before the next one snaps in. A closing page holds the Continue button.
 */
export default function LessonSwipePager({blocks, lessonTitle, onComplete}: LessonSwipePagerProps) {
  const scroller = useRef<HTMLDivElement>(null);
  const pageRefs = useRef<(HTMLElement | null)[]>([]);
  const [page, setPage] = useState(0);
  // Full screen: the lesson takes the whole screen so nothing but the text is left to look at.
  const [focus, setFocus] = useState(false);
  const pageNow = useRef(0);
  const nativeFullscreen = useRef(false);
  const pages = blocks.length + 1; // the sections, then the closing page
  pageNow.current = page;

  const sections = useMemo(
    () => blocks.map((b) => ({heading: b.heading, html: normalizeLessonHtml(b.html)})),
    [blocks],
  );

  // The page being read is the one crossing the middle of the scroller.
  useEffect(() => {
    const root = scroller.current;
    if (!root || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setPage(Number((entry.target as HTMLElement).dataset.page));
        }
      },
      {root, rootMargin: "-45% 0px -45% 0px", threshold: 0},
    );
    pageRefs.current.forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
    // Entering or leaving full screen builds a new scroller, so the pages are observed again.
  }, [pages, focus]);

  // The scroller is rebuilt when full screen turns on or off: put the student back on the section they were reading.
  useEffect(() => {
    if (pageNow.current === 0) return;
    pageRefs.current[pageNow.current]?.scrollIntoView?.({block: "start", behavior: "instant"});
  }, [focus]);

  // While full screen: the page behind stays still, and Escape (or the browser's own exit) leaves it.
  useEffect(() => {
    if (!focus) return;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") leaveFocus();
    };
    const onNativeExit = () => {
      if (!document.fullscreenElement && nativeFullscreen.current) {
        nativeFullscreen.current = false;
        setFocus(false);
      }
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("fullscreenchange", onNativeExit);
    return () => {
      document.body.style.overflow = overflow;
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("fullscreenchange", onNativeExit);
    };
  }, [focus]);

  function enterFocus() {
    setFocus(true);
    // Where the browser allows it (not iPhone Safari), also hide its own bars. The covering layer works either way.
    const root = document.documentElement;
    if (root.requestFullscreen && !document.fullscreenElement) {
      root
        .requestFullscreen()
        .then(() => {
          nativeFullscreen.current = true;
        })
        .catch(() => {});
    }
  }

  function leaveFocus() {
    setFocus(false);
    if (nativeFullscreen.current && document.fullscreenElement) {
      nativeFullscreen.current = false;
      document.exitFullscreen?.().catch(() => {});
    }
  }

  function goTo(index: number) {
    pageRefs.current[index]?.scrollIntoView({behavior: "smooth", block: "start"});
  }

  const card = (
    <div
      className={
        focus
          ? "fixed inset-0 z-[100] flex flex-col bg-background pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]"
          : "relative w-full min-w-0 max-w-full overflow-hidden rounded-2xl border border-muted/20"
      }
    >
      <div className="h-1 w-full shrink-0 bg-muted/20">
        <div
          className="h-full bg-primary transition-all duration-300"
          style={{width: `${lessonProgress(page, pages)}%`}}
        />
      </div>

      <div
        ref={scroller}
        role="region"
        aria-label={`${lessonTitle}. Swipe up for the next section, down to go back.`}
        tabIndex={0}
        onKeyDown={(e) => {
          const next = targetPage(e.key, page, pages);
          if (next === null) return;
          e.preventDefault();
          goTo(next);
        }}
        className={`snap-y snap-mandatory overflow-y-auto scroll-smooth outline-none focus-visible:ring-2 ring-primary/40 scrollbar-hide ${
          focus ? "min-h-0 flex-1" : "h-[72dvh] min-h-[420px]"
        }`}
      >
        {sections.map((section, i) => (
          <section
            key={i}
            data-page={i}
            ref={(el) => {
              pageRefs.current[i] = el;
            }}
            className="min-h-full min-w-0 snap-start snap-always px-5 pb-24 pt-8 sm:px-10"
          >
            {section.heading && (
              <h2
                className="mb-4 text-xl font-semibold text-primary break-words"
                dangerouslySetInnerHTML={{__html: relaxSpaces(section.heading)}}
              />
            )}
            <div className="lesson-block-content" dangerouslySetInnerHTML={{__html: section.html}} />
          </section>
        ))}

        <section
          data-page={blocks.length}
          ref={(el) => {
            pageRefs.current[blocks.length] = el;
          }}
          className="flex min-h-full snap-start snap-always flex-col items-center justify-center gap-4 px-6 text-center"
        >
          <Icon icon="lucide:check-circle-2" size={40} className="text-primary" />
          <h2 className="text-xl font-semibold">You&apos;ve reached the end of this lesson</h2>
          <p className="max-w-xs text-sm text-subtle">Swipe down to read any section again, or continue when you&apos;re ready.</p>
          <Button variant="primary" onClick={onComplete}>
            Continue
            <Icon icon="lucide:chevron-right" size={16} />
          </Button>
        </section>
      </div>

      {/* Full screen on and off. Only one shows at a time. */}
      <button
        type="button"
        onClick={focus ? leaveFocus : enterFocus}
        aria-label={focus ? "Exit full screen" : "Full screen"}
        className={`absolute left-3 z-10 flex size-8 items-center justify-center rounded-full bg-background/90 text-subtle shadow-sm hover:text-foreground ${
          focus ? "top-[calc(0.75rem+env(safe-area-inset-top))]" : "top-3"
        }`}
      >
        <Icon icon={focus ? "lucide:minimize-2" : "lucide:maximize-2"} size={16} />
      </button>

      {/* Which section. It sits over the scroller and ignores the pointer, so a swipe that starts on it still scrolls. */}
      <p className={`pointer-events-none absolute right-3 rounded-full bg-background/90 px-2.5 py-1 text-xs font-medium text-subtle shadow-sm ${
        focus ? "top-[calc(0.75rem+env(safe-area-inset-top))]" : "top-3"
      }`}>
        {Math.min(page + 1, blocks.length)} / {blocks.length}
      </p>

      {/* A fade so text slides under the controls instead of colliding with them, and the hint until the first swipe. */}
      <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-background via-background/90 to-transparent" />
      {page === 0 && blocks.length > 0 && (
        <div aria-hidden className="pointer-events-none absolute bottom-3 left-4 flex items-center gap-1 text-xs font-medium text-subtle">
          <Icon icon="lucide:chevrons-up" size={18} className="animate-bounce text-primary" />
          Swipe up
        </div>
      )}

      {page < blocks.length && (
        <LessonAskBrainy
          key={page}
          lessonTitle={lessonTitle}
          heading={sections[page]?.heading}
          align="right"
          className="absolute bottom-3 right-3 z-10"
        />
      )}

      <style dangerouslySetInnerHTML={{__html: LESSON_CONTENT_CSS}} />
    </div>
  );

  // In full screen the lesson is drawn straight onto the page, clear of any ancestor that would clip or move it.
  return focus ? createPortal(card, document.body) : card;
}
