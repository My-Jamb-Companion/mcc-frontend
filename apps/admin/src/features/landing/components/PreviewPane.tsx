"use client";

import {useEffect, useRef, useState} from "react";
import {Icon} from "@mcc/ui";
import {PREVIEW_CONTENT, PREVIEW_READY, PREVIEW_SCROLL} from "@mcc/landing-content";
import type {LandingContent} from "@mcc/landing-content";

export const LANDING_URL = process.env.NEXT_PUBLIC_LANDING_URL || "http://localhost:3004";

/**
 * The landing site's /preview page in a frame, fed the page as it is being edited, so every change
 * shows at once without saving. The frame only answers to the landing site's origin, and this only
 * talks to that origin.
 */
export default function PreviewPane({content, focusBlockId}: {content: LandingContent; focusBlockId: string | null}) {
  const frame = useRef<HTMLIFrameElement>(null);
  // Counts how many times the frame has said it is ready, so a reloaded frame is sent the page again.
  const [ready, setReady] = useState(0);
  const [device, setDevice] = useState<"desktop" | "phone">("desktop");

  useEffect(() => {
    function onMessage(event: MessageEvent) {
      if (event.origin !== LANDING_URL || event.source !== frame.current?.contentWindow) return;
      if ((event.data as {type?: string} | null)?.type === PREVIEW_READY) setReady((n) => n + 1);
    }
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  // Send the page whenever it changes (and once the frame says it is ready).
  useEffect(() => {
    if (ready === 0) return;
    const timer = setTimeout(() => frame.current?.contentWindow?.postMessage({type: PREVIEW_CONTENT, content}, LANDING_URL), 120);
    return () => clearTimeout(timer);
  }, [content, ready]);

  useEffect(() => {
    if (ready > 0 && focusBlockId) frame.current?.contentWindow?.postMessage({type: PREVIEW_SCROLL, blockId: focusBlockId}, LANDING_URL);
  }, [focusBlockId, ready]);

  const tab = (value: "desktop" | "phone", label: string, icon: string) => (
    <button
      type="button"
      onClick={() => setDevice(value)}
      aria-pressed={device === value}
      className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium ${device === value ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
    >
      <Icon icon={icon} size={14} /> {label}
    </button>
  );

  return (
    <div className="flex h-full min-h-[420px] flex-col rounded-2xl border border-gray-200 bg-gray-50">
      <div className="flex items-center justify-between gap-2 border-b border-gray-200 px-3 py-2">
        <span className="text-xs font-semibold uppercase tracking-wide text-gray-400">Live preview</span>
        <div className="flex gap-1 rounded-xl bg-gray-100 p-1">
          {tab("desktop", "Desktop", "lucide:monitor")}
          {tab("phone", "Phone", "lucide:smartphone")}
        </div>
        <a href={`${LANDING_URL}/preview`} target="_blank" rel="noreferrer" className="text-xs font-medium text-violet-700 hover:underline">Open site</a>
      </div>
      <div className="flex min-h-0 flex-1 justify-center overflow-hidden p-3">
        <iframe
          ref={frame}
          title="Landing page preview"
          src={`${LANDING_URL}/preview`}
          className={`h-full rounded-xl border border-gray-200 bg-white ${device === "phone" ? "w-[375px] max-w-full" : "w-full"}`}
        />
      </div>
      {ready === 0 && <p className="px-3 pb-3 text-xs text-gray-400">Loading the preview… If it stays empty, check the landing site is running at {LANDING_URL}.</p>}
    </div>
  );
}
