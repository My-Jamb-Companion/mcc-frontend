"use client";

import {useState} from "react";
import {ConfirmModal} from "@mcc/ui";
import {
  LEGAL_BLOCKS,
  LEGAL_BLOCK_BY_TYPE,
  LEGAL_LABELS,
  LEGAL_SITE_FIELDS,
  LEGAL_SLUGS,
  normalizeLegalContent,
  legalDefaultContent,
  str,
  strings,
} from "@mcc/landing-content";
import type {LegalSlug} from "@mcc/landing-content";
import PageEditor from "./PageEditor";
import type {PageEditorConfig} from "./PageEditor";
import LegalPreview from "./LegalPreview";

/** How the editor treats one legal page. */
export const legalConfig = (slug: LegalSlug): PageEditorConfig => ({
  page: slug,
  area: "landing",
  heading: LEGAL_LABELS[slug],
  subtitle: "Edit the text of this page. Changes reach visitors only when you publish. The page it replaces stays in the history.",
  siteTitle: "Title, summary and notice",
  siteHint: "Title, summary, last updated, draft notice",
  siteFields: LEGAL_SITE_FIELDS,
  blocks: LEGAL_BLOCKS,
  blockByType: LEGAL_BLOCK_BY_TYPE,
  startContent: (state) => normalizeLegalContent(state.draft?.content ?? state.published?.content ?? legalDefaultContent(slug), slug),
  describe: (block) => {
    const heading = str(block.data, "heading").trim();
    const first = strings(block.data, "paragraphs")[0] ?? strings(block.data, "bullets")[0] ?? "";
    return {title: heading || "Untitled section", subtitle: first.length > 70 ? `${first.slice(0, 70)}…` : first};
  },
  sectionNoun: "section",
  notPublishedLabel: "Not published yet: visitors see the built-in text",
  publishTitle: `Publish the ${LEGAL_LABELS[slug]}?`,
  publishBody: "Visitors will read this version within about a minute. Check the \"Last updated\" date first. The page it replaces stays in the history, so you can go back.",
  publishedMessage: "Published. Visitors will see it within about a minute.",
  Preview: ({content, focusBlockId}) => <LegalPreview content={content} focusBlockId={focusBlockId} slug={slug} />,
});

const CONFIGS = Object.fromEntries(LEGAL_SLUGS.map((slug) => [slug, legalConfig(slug)])) as Record<LegalSlug, PageEditorConfig>;

/** Edit the Terms of Use, Privacy Policy and Refund Policy: one tab each, each with its own draft and history. */
export default function LegalEditor() {
  const [slug, setSlug] = useState<LegalSlug>("terms");
  const [dirty, setDirty] = useState(false);
  const [switchTo, setSwitchTo] = useState<LegalSlug | null>(null);

  function pick(next: LegalSlug) {
    if (next === slug) return;
    if (dirty) setSwitchTo(next);
    else setSlug(next);
  }

  return (
    <div className="flex flex-col gap-4">
      <div role="tablist" aria-label="Legal pages" className="flex w-fit gap-1 rounded-xl bg-gray-100 p-1">
        {LEGAL_SLUGS.map((s) => (
          <button
            key={s}
            type="button"
            role="tab"
            aria-selected={slug === s}
            onClick={() => pick(s)}
            className={`rounded-lg px-4 py-1.5 text-sm font-medium ${slug === s ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
          >
            {LEGAL_LABELS[s]}
          </button>
        ))}
      </div>

      <PageEditor key={slug} config={CONFIGS[slug]} onDirtyChange={setDirty} />

      <ConfirmModal
        open={switchTo !== null}
        variant="danger"
        title="Leave without saving?"
        message="You have changes that aren't saved as a draft. They are lost if you switch to another page."
        confirmText="Switch and lose them"
        cancelText="Stay here"
        onConfirm={() => {
          if (switchTo) {
            setDirty(false);
            setSlug(switchTo);
          }
          setSwitchTo(null);
        }}
        onCancel={() => setSwitchTo(null)}
      />
    </div>
  );
}
