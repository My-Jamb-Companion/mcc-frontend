import { describe, expect, it } from "vitest";
import { DOCUMENTS } from "./legalDocuments";
import {
  LEGAL_BLOCK_BY_TYPE,
  LEGAL_SECTION_TYPE,
  LEGAL_SLUGS,
  legalContentFromDocument,
  legalDefaultContent,
  normalizeLegalContent,
  toLegalDocument,
} from "./legal";

describe("legal pages as stored content", () => {
  it("starts every page from its built-in text, one block per section", () => {
    for (const slug of LEGAL_SLUGS) {
      const content = legalDefaultContent(slug);
      expect(content.blocks).toHaveLength(DOCUMENTS[slug].sections.length);
      expect(content.blocks.every((b) => b.type === LEGAL_SECTION_TYPE && LEGAL_BLOCK_BY_TYPE[b.type])).toBe(true);
      expect(new Set(content.blocks.map((b) => b.id)).size).toBe(content.blocks.length);
      expect(content.site.show_draft_notice).toBe(true);
    }
  });

  it("round-trips the built-in text unchanged", () => {
    for (const slug of LEGAL_SLUGS) {
      const doc = toLegalDocument(legalDefaultContent(slug), slug);
      expect(doc.sections).toEqual(DOCUMENTS[slug].sections.map((s) => ({ heading: s.heading, paragraphs: s.paragraphs ?? [], bullets: s.bullets ?? [] })));
      expect(doc.title).toBe(DOCUMENTS[slug].title);
      expect(doc.updated).toBe(DOCUMENTS[slug].updated);
    }
  });

  it("leaves out hidden sections and unknown section types, and blank paragraphs", () => {
    const content = legalDefaultContent("terms");
    content.blocks = [
      { id: "a", type: LEGAL_SECTION_TYPE, visible: true, data: { heading: "1. Shown", paragraphs: ["Hello", "  ", "World"], bullets: [] } },
      { id: "b", type: LEGAL_SECTION_TYPE, visible: false, data: { heading: "2. Hidden", paragraphs: ["x"] } },
      { id: "c", type: "mystery", visible: true, data: { heading: "3. Unknown" } },
    ];
    const doc = toLegalDocument(content, "terms");
    expect(doc.sections).toEqual([{ heading: "1. Shown", paragraphs: ["Hello", "World"], bullets: [] }]);
  });

  it("carries the draft-notice switch, defaulting to shown", () => {
    const off = { ...legalDefaultContent("privacy"), site: { title: "P", show_draft_notice: false } };
    expect(toLegalDocument(off, "privacy").showDraftNotice).toBe(false);
    expect(toLegalDocument({ site: {}, blocks: [] }, "privacy").showDraftNotice).toBe(true);
  });

  it("falls back to the built-in title, summary and date when they were cleared", () => {
    const doc = toLegalDocument({ site: { title: " ", summary: "", updated: "" }, blocks: [] }, "refund");
    expect(doc.title).toBe(DOCUMENTS.refund.title);
    expect(doc.summary).toBe(DOCUMENTS.refund.summary);
    expect(doc.updated).toBe(DOCUMENTS.refund.updated);
  });

  it("copes with garbage", () => {
    expect(normalizeLegalContent(null, "terms").blocks).toEqual([]);
    expect(normalizeLegalContent({ blocks: [1, "x", { id: 5 }, { id: "a", type: "t" }] }, "terms").blocks).toHaveLength(1);
    expect(toLegalDocument(undefined, "terms").sections).toEqual([]);
  });

  it("builds content from any document", () => {
    const content = legalContentFromDocument({ slug: "terms", title: "T", summary: "S", updated: "U", sections: [{ heading: "H" }], showDraftNotice: false });
    expect(content.blocks[0].data).toEqual({ heading: "H", paragraphs: [], bullets: [] });
    expect(content.site.show_draft_notice).toBe(false);
  });
});
