import { afterEach, describe, expect, it, vi } from "vitest";
import { DOCUMENTS, legalDefaultContent } from "@mcc/landing-content";
import { getLegalDocument, legalMetadata } from "./content";

afterEach(() => vi.unstubAllGlobals());

const reply = (body: unknown, ok = true) => vi.fn().mockResolvedValue({ ok, json: async () => body });

const published = () => {
  const content = legalDefaultContent("terms");
  content.site = { title: "Terms of Service", summary: "New summary.", updated: "1 March 2027", show_draft_notice: false };
  content.blocks = [{ id: "s1", type: "legal_section", visible: true, data: { heading: "1. Only section", paragraphs: ["Hello."], bullets: ["a"] } }];
  return content;
};

describe("getLegalDocument", () => {
  it("shows what was published", async () => {
    vi.stubGlobal("fetch", reply({ data: { content: published() } }));
    const doc = await getLegalDocument("terms");
    expect(doc.title).toBe("Terms of Service");
    expect(doc.updated).toBe("1 March 2027");
    expect(doc.showDraftNotice).toBe(false);
    expect(doc.sections).toEqual([{ heading: "1. Only section", paragraphs: ["Hello."], bullets: ["a"] }]);
  });

  it("asks for its own page", async () => {
    const fetchMock = reply({ data: { content: null } });
    vi.stubGlobal("fetch", fetchMock);
    await getLegalDocument("privacy");
    expect(String(fetchMock.mock.calls[0][0])).toMatch(/\/landing\/pages\/privacy$/);
    expect(fetchMock.mock.calls[0][1].next.revalidate).toBe(60);
  });

  it("falls back to the built-in text when nothing is published, or the API fails", async () => {
    vi.stubGlobal("fetch", reply({ data: { content: null } }));
    expect(await getLegalDocument("refund")).toBe(DOCUMENTS.refund);
    vi.stubGlobal("fetch", reply({}, false));
    expect(await getLegalDocument("refund")).toBe(DOCUMENTS.refund);
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("down")));
    expect(await getLegalDocument("refund")).toBe(DOCUMENTS.refund);
  });
});

describe("legalMetadata", () => {
  it("uses the live title and summary", async () => {
    vi.stubGlobal("fetch", reply({ data: { content: published() } }));
    const meta = await legalMetadata("terms");
    expect(meta.title).toBe("Terms of Service");
    expect(meta.description).toBe("New summary.");
    expect(meta.alternates?.canonical).toBe("/terms");
  });
});
