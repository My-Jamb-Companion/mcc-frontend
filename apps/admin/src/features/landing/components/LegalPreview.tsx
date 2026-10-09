"use client";

import {useEffect, useRef} from "react";
import {LEGAL_SECTION_TYPE, normalizeLegalContent, strings, str} from "@mcc/landing-content";
import type {LandingContent, LegalSlug} from "@mcc/landing-content";

/** The page as visitors will read it, redrawn on every keystroke. Hidden sections are left out, as on the site. */
export default function LegalPreview({content, focusBlockId, slug}: {content: LandingContent; focusBlockId: string | null; slug: LegalSlug}) {
  const page = normalizeLegalContent(content, slug);
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (focusBlockId) root.current?.querySelector(`[data-block="${focusBlockId}"]`)?.scrollIntoView?.({block: "nearest", behavior: "smooth"});
  }, [focusBlockId]);

  return (
    <div className="flex h-full min-h-[420px] flex-col rounded-2xl border border-gray-200 bg-gray-50">
      <div className="border-b border-gray-200 px-3 py-2">
        <span className="text-xs font-semibold uppercase tracking-wide text-gray-400">Preview</span>
      </div>
      <div ref={root} className="min-h-0 flex-1 overflow-y-auto p-3">
        <article className="mx-auto max-w-[780px] rounded-xl bg-white px-6 py-8 text-neutral-900">
          {page.site.show_draft_notice !== false && (
            <p role="note" className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
              <strong>Draft, pending legal review.</strong> This page describes how My Course Companion works today. It has not yet been
              reviewed by a lawyer and may change.
            </p>
          )}
          <p className="text-3xl font-bold leading-tight tracking-tight">{str(page.site, "title")}</p>
          <p className="mt-3 text-base leading-relaxed text-neutral-700">{str(page.site, "summary")}</p>
          <p className="mb-8 mt-1 text-sm text-neutral-500">Last updated {str(page.site, "updated")}</p>

          {page.blocks
            .filter((b) => b.visible && b.type === LEGAL_SECTION_TYPE)
            .map((block) => (
              <section key={block.id} data-block={block.id} className={`mb-7 rounded-lg ${focusBlockId === block.id ? "bg-violet-50/60 ring-8 ring-violet-50/60" : ""}`}>
                <h2 className="mb-2 text-xl font-semibold leading-snug">{str(block.data, "heading")}</h2>
                {strings(block.data, "paragraphs").map((p, i) => (
                  <p key={i} className="mb-3 whitespace-pre-line text-[15px] leading-7 text-neutral-800">{p}</p>
                ))}
                {strings(block.data, "bullets").length > 0 && (
                  <ul className="mb-3 list-disc pl-5 text-[15px] leading-7 text-neutral-800">
                    {strings(block.data, "bullets").map((b, i) => <li key={i} className="mb-1">{b}</li>)}
                  </ul>
                )}
              </section>
            ))}
          {page.blocks.every((b) => !b.visible || b.type !== LEGAL_SECTION_TYPE) && (
            <p className="text-sm text-neutral-400">This page has no visible sections.</p>
          )}
        </article>
      </div>
    </div>
  );
}
