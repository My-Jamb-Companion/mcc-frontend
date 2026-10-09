import type { Field, FieldData } from "./fields";
import type { BlockDefinition, LandingBlock, LandingContent } from "./types";
import { DOCUMENTS } from "./legalDocuments";
import type { LegalDocument, LegalSlug } from "./legalDocuments";

/**
 * The Terms, Privacy and Refund pages as the CMS stores them: the same document shape as the home page.
 * `site` holds the page's title, summary, "last updated" line and whether the "draft, pending legal
 * review" notice shows; each block is one numbered section of the text.
 */

export const LEGAL_SLUGS: LegalSlug[] = ["terms", "privacy", "refund"];

export const LEGAL_LABELS: Record<LegalSlug, string> = {
  terms: "Terms of Use",
  privacy: "Privacy Policy",
  refund: "Refund Policy",
};

export const LEGAL_SECTION_TYPE = "legal_section";

export const LEGAL_SITE_FIELDS: Field[] = [
  { kind: "text", key: "title", label: "Page title", maxLength: 100 },
  { kind: "textarea", key: "summary", label: "Summary", help: "One or two sentences under the title.", maxLength: 400 },
  { kind: "text", key: "updated", label: "Last updated", help: "Shown on the page, e.g. 8 October 2026. Change it whenever the text changes.", maxLength: 60 },
  {
    kind: "toggle",
    key: "show_draft_notice",
    label: "Show the \"Draft, pending legal review\" notice",
    help: "Turn this off once a lawyer has reviewed the text.",
  },
];

export const LEGAL_BLOCKS: BlockDefinition[] = [
  {
    type: LEGAL_SECTION_TYPE,
    label: "Section",
    description: "A headed part of the page: a heading, paragraphs and an optional bullet list.",
    icon: "lucide:file-text",
    anchor: "section",
    fields: [
      { kind: "text", key: "heading", label: "Heading", help: "Include the number, e.g. \"4. Payments\".", maxLength: 150 },
      { kind: "strings", key: "paragraphs", label: "Paragraphs", itemLabel: "Paragraph", max: 20, multiline: true, maxLength: 4000 },
      { kind: "strings", key: "bullets", label: "Bullet points", itemLabel: "Bullet", max: 30, multiline: true, maxLength: 1000 },
    ],
    defaults: { heading: "", paragraphs: [""], bullets: [] },
  },
];

export const LEGAL_BLOCK_BY_TYPE: Record<string, BlockDefinition> = Object.fromEntries(LEGAL_BLOCKS.map((b) => [b.type, b]));

/** A page's document turned into what the editor stores. */
export function legalContentFromDocument(doc: LegalDocument): LandingContent {
  return {
    site: {
      title: doc.title,
      summary: doc.summary,
      updated: doc.updated,
      show_draft_notice: doc.showDraftNotice ?? true,
    },
    blocks: doc.sections.map((section, i): LandingBlock => ({
      id: `sec_${i + 1}`,
      type: LEGAL_SECTION_TYPE,
      visible: true,
      data: { heading: section.heading, paragraphs: [...(section.paragraphs ?? [])], bullets: [...(section.bullets ?? [])] },
    })),
  };
}

/** What the editor starts from, and the site shows, until a page is published: the built-in text. */
export function legalDefaultContent(slug: LegalSlug): LandingContent {
  return legalContentFromDocument(DOCUMENTS[slug]);
}

/**
 * Accepts whatever was stored and returns a legal page the editor and the site can draw. Unlike the home
 * page, nothing is filled in from site defaults: a missing field is simply empty.
 */
export function normalizeLegalContent(raw: unknown, slug: LegalSlug): LandingContent {
  const input = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
  const fallback = legalDefaultContent(slug);
  const site = input.site && typeof input.site === "object" && !Array.isArray(input.site) ? (input.site as FieldData) : {};
  const blocks = Array.isArray(input.blocks) ? input.blocks : [];
  return {
    site: { ...fallback.site, ...site },
    blocks: blocks.flatMap((b): LandingBlock[] => {
      if (!b || typeof b !== "object") return [];
      const block = b as Record<string, unknown>;
      if (typeof block.id !== "string" || typeof block.type !== "string") return [];
      const data = block.data && typeof block.data === "object" && !Array.isArray(block.data) ? (block.data as FieldData) : {};
      return [{ id: block.id, type: block.type, visible: block.visible !== false, data }];
    }),
  };
}

const text = (value: unknown): string => (typeof value === "string" ? value : "");
const textList = (value: unknown): string[] =>
  Array.isArray(value) ? value.filter((v): v is string => typeof v === "string" && v.trim() !== "") : [];

/**
 * The page as a visitor reads it. Hidden sections and ones of a type this version doesn't know are left
 * out. Anything missing falls back to the built-in text for that field, so a half-filled page is never blank.
 */
export function toLegalDocument(content: unknown, slug: LegalSlug): LegalDocument {
  const fallback = DOCUMENTS[slug];
  const page = normalizeLegalContent(content, slug);
  return {
    slug,
    title: text(page.site.title).trim() || fallback.title,
    summary: text(page.site.summary).trim() || fallback.summary,
    updated: text(page.site.updated).trim() || fallback.updated,
    showDraftNotice: page.site.show_draft_notice !== false,
    sections: page.blocks
      .filter((b) => b.visible && b.type === LEGAL_SECTION_TYPE)
      .map((b) => ({ heading: text(b.data.heading), paragraphs: textList(b.data.paragraphs), bullets: textList(b.data.bullets) })),
  };
}
