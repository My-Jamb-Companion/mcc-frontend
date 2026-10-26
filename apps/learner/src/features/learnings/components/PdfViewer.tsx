"use client";

import {memo, useCallback, useEffect, useRef, useState} from "react";
import {createPortal} from "react-dom";
import type {PDFDocumentProxy} from "pdfjs-dist/legacy/build/pdf.mjs";
import {useFullScreen} from "@/src/features/learnings/hooks/useFullScreen";
import FullScreenButton from "./FullScreenButton";

/** A phone's memory is the limit, not its screen: no page is drawn with more pixels than this. */
const MAX_CANVAS_PIXELS = 4_000_000;
const DEFAULT_RATIO = 1.414; // A4, until the first page says otherwise

interface PdfPageProps {
  doc: PDFDocumentProxy;
  pageNumber: number;
  width: number;
  root: HTMLElement | null;
  /** Height / width of each page already drawn, so a page re-created later (full screen) keeps its height. */
  ratios: React.MutableRefObject<Map<number, number>>;
  defaultRatio: number;
}

/**
 * One page. It is only drawn while it is near the screen, and its canvas is emptied again once it has been
 * scrolled well away, so a long PDF never holds more than a few pages in memory.
 */
const PdfPage = memo(function PdfPage({doc, pageNumber, width, root, ratios, defaultRatio}: PdfPageProps) {
  const holder = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const [near, setNear] = useState(false);
  const [ratio, setRatio] = useState(ratios.current.get(pageNumber) ?? defaultRatio);

  useEffect(() => {
    const el = holder.current;
    if (!el || !root || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver((entries) => setNear(entries[entries.length - 1].isIntersecting), {
      root,
      rootMargin: "150% 0px",
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [root]);

  useEffect(() => {
    if (!near || !width) return;
    const element = canvas.current;
    let cancelled = false;
    let task: {cancel: () => void; promise: Promise<unknown>} | null = null;
    (async () => {
      const page = await doc.getPage(pageNumber);
      const target = element;
      if (cancelled || !target) return;
      const base = page.getViewport({scale: 1});
      let scale = (width / base.width) * Math.min(window.devicePixelRatio || 1, 2);
      const pixels = base.width * base.height * scale * scale;
      if (pixels > MAX_CANVAS_PIXELS) scale *= Math.sqrt(MAX_CANVAS_PIXELS / pixels);
      const viewport = page.getViewport({scale});
      target.width = Math.floor(viewport.width);
      target.height = Math.floor(viewport.height);
      ratios.current.set(pageNumber, base.height / base.width);
      setRatio(base.height / base.width);
      task = page.render({canvas: target, viewport});
      await task.promise.catch(() => {});
    })().catch(() => {});
    return () => {
      cancelled = true;
      task?.cancel();
      if (element) {
        element.width = 0;
        element.height = 0;
      }
    };
  }, [near, width, doc, pageNumber, ratios]);

  return (
    <div
      ref={holder}
      data-pdf-page={pageNumber}
      className="mx-auto mb-2 overflow-hidden rounded-md bg-white shadow-sm"
      style={{width, height: Math.round(width * ratio)}}
    >
      <canvas ref={canvas} role="img" aria-label={`Page ${pageNumber}`} className="block h-full w-full" />
    </div>
  );
});

interface PdfViewerProps {
  src: string;
  title: string;
}

/**
 * A PDF lesson for phones and tablets. A phone's own PDF-in-a-frame shows one page that cannot be scrolled, so the
 * pages are drawn here instead, one under the other in a normal scrolling area: swipe up and down to read. Pages are
 * drawn as they come near and let go of when they are far, so it stays light on a phone. Has the same Full screen
 * icon as a text lesson.
 */
export default function PdfViewer({src, title}: PdfViewerProps) {
  const [doc, setDoc] = useState<PDFDocumentProxy | null>(null);
  const [failed, setFailed] = useState(false);
  const [defaultRatio, setDefaultRatio] = useState(DEFAULT_RATIO);
  const [root, setRoot] = useState<HTMLDivElement | null>(null);
  const [width, setWidth] = useState(0);
  const [page, setPage] = useState(1);
  const ratios = useRef(new Map<number, number>());
  const pageNow = useRef(1);
  const frame = useRef(0);
  const {focus, enter, leave} = useFullScreen();
  pageNow.current = page;

  useEffect(() => {
    let cancelled = false;
    let loading: {promise: Promise<PDFDocumentProxy>; destroy: () => Promise<void>} | null = null;
    (async () => {
      try {
        // Loaded on demand: the reader (and its worker) is only fetched when a student opens a PDF on a phone.
        const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
        pdfjs.GlobalWorkerOptions.workerSrc = new URL("pdfjs-dist/legacy/build/pdf.worker.min.mjs", import.meta.url).toString();
        loading = pdfjs.getDocument({url: src});
        const loaded = await loading.promise;
        if (cancelled) return; // the cleanup below destroys the task, and the document with it
        const first = await loaded.getPage(1);
        const view = first.getViewport({scale: 1});
        if (cancelled) return;
        setDefaultRatio(view.height / view.width);
        setDoc(loaded);
      } catch {
        if (!cancelled) setFailed(true);
      }
    })();
    return () => {
      cancelled = true;
      void loading?.destroy();
    };
  }, [src]);

  // The pages are as wide as the reading area, and are drawn again if it changes (turning the phone, full screen).
  useEffect(() => {
    if (!root || typeof ResizeObserver === "undefined") return;
    const measure = () => setWidth(Math.max(0, Math.floor(root.clientWidth - 16)));
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(root);
    return () => observer.disconnect();
  }, [root]);

  // Entering or leaving full screen builds a new reading area: put the student back on the page they were on.
  useEffect(() => {
    if (!root || !doc || pageNow.current <= 1) return;
    root.querySelector(`[data-pdf-page="${pageNow.current}"]`)?.scrollIntoView?.({block: "start", behavior: "instant"});
  }, [root, doc]);

  const onScroll = useCallback(() => {
    if (frame.current || !root) return;
    frame.current = requestAnimationFrame(() => {
      frame.current = 0;
      const line = root.getBoundingClientRect().top + root.clientHeight * 0.4;
      let current = 1;
      for (const el of Array.from(root.querySelectorAll<HTMLElement>("[data-pdf-page]"))) {
        if (el.getBoundingClientRect().top > line) break;
        current = Number(el.dataset.pdfPage);
      }
      setPage(current);
    });
  }, [root]);

  useEffect(() => () => cancelAnimationFrame(frame.current), []);

  const pageCount = doc?.numPages ?? 0;

  const card = (
    <div
      className={
        focus
          ? "fixed inset-0 z-[100] flex flex-col bg-background pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]"
          : "relative w-full min-w-0 max-w-full overflow-hidden rounded-2xl border border-muted/20"
      }
    >
      <div className="h-1 w-full shrink-0 bg-muted/20">
        <div className="h-full bg-primary transition-all duration-300" style={{width: `${pageCount ? (page / pageCount) * 100 : 0}%`}} />
      </div>

      {/* A bar of its own, so the icon and the page number never sit over the text of a page. */}
      <div className="flex shrink-0 items-center justify-between px-3 py-2">
        <FullScreenButton focus={focus} onEnter={enter} onLeave={leave} />
        {pageCount > 0 && <p className="text-xs font-medium text-subtle">{page} / {pageCount}</p>}
      </div>

      <div
        ref={setRoot}
        role="region"
        aria-label={`${title}. Swipe up and down to read.`}
        tabIndex={0}
        onScroll={onScroll}
        className={`overflow-y-auto bg-muted/10 p-2 outline-none focus-visible:ring-2 ring-primary/40 ${
          focus ? "min-h-0 flex-1" : "h-[64dvh] min-h-[380px]"
        }`}
        style={{touchAction: "pan-y", WebkitOverflowScrolling: "touch"}}
      >
        {failed ? (
          <div className="flex min-h-[240px] flex-col items-center justify-center gap-3 px-6 text-center text-sm text-subtle">
            <p>This PDF couldn&apos;t be shown here.</p>
            <a href={src} target="_blank" rel="noreferrer" className="font-semibold text-primary underline">
              Open the PDF
            </a>
          </div>
        ) : !doc ? (
          <div className="flex min-h-[240px] items-center justify-center text-sm text-subtle">Loading PDF…</div>
        ) : (
          Array.from({length: pageCount}, (_, i) => (
            <PdfPage key={i + 1} doc={doc} pageNumber={i + 1} width={width} root={root} ratios={ratios} defaultRatio={defaultRatio} />
          ))
        )}
      </div>

    </div>
  );

  return focus ? createPortal(card, document.body) : card;
}
