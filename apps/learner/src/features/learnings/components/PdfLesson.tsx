"use client";

import {useSwipeMode} from "@/src/features/learnings/hooks/useSwipeMode";
import PdfViewer from "./PdfViewer";

interface PdfLessonProps {
  src: string;
  title: string;
}

/**
 * An uploaded PDF. On a phone or tablet it is read in a scrolling viewer (the device's own PDF frame shows a single
 * page that cannot be scrolled); on a desktop the browser's own PDF reader is already the best one.
 */
export default function PdfLesson({src, title}: PdfLessonProps) {
  const swipe = useSwipeMode();
  if (!swipe) {
    return <iframe src={src} title={title} className="aspect-video w-full rounded-2xl border border-muted/20" />;
  }
  return <PdfViewer key={src} src={src} title={title} />;
}
