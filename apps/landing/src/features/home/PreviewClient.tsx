"use client";

import { useEffect, useState } from "react";
import { PREVIEW_CONTENT, PREVIEW_READY, PREVIEW_SCROLL, defaultContent, normalizeContent } from "@mcc/landing-content";
import type { LandingContent } from "@mcc/landing-content";
import { ADMIN_URL } from "@/src/config";
import { LandingPage } from "./LandingPage";

/**
 * The page as the admin's unsaved edits would publish it. The admin console sends the content
 * with postMessage, so edits show instantly and nothing is stored. Only the admin console's
 * origin is listened to. Opened on its own, it shows the built-in design.
 */
export function PreviewClient() {
  const [content, setContent] = useState<LandingContent>(() => defaultContent());

  useEffect(() => {
    function onMessage(event: MessageEvent) {
      if (event.origin !== ADMIN_URL) return;
      const message = event.data as { type?: string; content?: unknown; blockId?: string } | null;
      if (message?.type === PREVIEW_CONTENT) setContent(normalizeContent(message.content));
      if (message?.type === PREVIEW_SCROLL && message.blockId) {
        const target = document.querySelector(`[data-block-id="${CSS.escape(message.blockId)}"]`);
        target?.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
    window.addEventListener("message", onMessage);
    // Tell the admin console we are ready for the first content.
    if (window.parent !== window) window.parent.postMessage({ type: PREVIEW_READY }, ADMIN_URL);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  return <LandingPage content={content} />;
}
