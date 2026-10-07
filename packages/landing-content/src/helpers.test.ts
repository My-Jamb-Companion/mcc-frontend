import { describe, expect, it } from "vitest";
import { defaultContent } from "./defaults";
import {
  createBlock, duplicateBlock, insertBlock, isSafeHref, list, moveBlock, moveItem, normalizeContent,
  removeBlock, safeHref, sameContent, str, strings, updateBlock, visibleBlocks,
} from "./helpers";

const ids = (blocks: { id: string }[]) => blocks.map((b) => b.id);
const three = [createBlock("hero"), createBlock("faq"), createBlock("cta")];

describe("editing blocks", () => {
  it("creates a block from the definition's defaults, with its own copy of the data", () => {
    const a = createBlock("faq"); const b = createBlock("faq");
    expect(a.id).not.toBe(b.id);
    (a.data.items as unknown[]).pop();
    expect((b.data.items as unknown[]).length).toBeGreaterThan(0);
    expect(() => createBlock("nope")).toThrow();
  });

  it("inserts, removes and duplicates in place", () => {
    const extra = createBlock("steps");
    expect(ids(insertBlock(three, extra, 1))).toEqual([three[0].id, extra.id, three[1].id, three[2].id]);
    expect(ids(insertBlock(three, extra, 99)).at(-1)).toBe(extra.id);
    expect(ids(removeBlock(three, three[1].id))).toEqual([three[0].id, three[2].id]);

    const copied = duplicateBlock(three, three[0].id);
    expect(copied).toHaveLength(4);
    expect(copied[1].type).toBe("hero");
    expect(copied[1].id).not.toBe(three[0].id);
    expect(duplicateBlock(three, "missing")).toBe(three);
  });

  it("moves a block to a position, clamped to the list", () => {
    expect(ids(moveBlock(three, three[0].id, 2))).toEqual([three[1].id, three[2].id, three[0].id]);
    expect(ids(moveBlock(three, three[2].id, -5))[0]).toBe(three[2].id);
    expect(moveBlock(three, three[1].id, 1)).toBe(three);
    expect(moveBlock(three, "missing", 0)).toBe(three);
  });

  it("moves list items the same way", () => {
    expect(moveItem(["a", "b", "c"], 0, 2)).toEqual(["b", "c", "a"]);
    expect(moveItem(["a", "b"], 5, 0)).toEqual(["a", "b"]);
  });

  it("updates one block only", () => {
    const next = updateBlock(three, three[1].id, { visible: false });
    expect(next.map((b) => b.visible)).toEqual([true, false, true]);
  });

  it("knows when a page changed", () => {
    const a = defaultContent(); const b = defaultContent();
    expect(sameContent(a, b)).toBe(true);
    b.blocks[0].visible = false;
    expect(sameContent(a, b)).toBe(false);
  });
});

describe("reading stored content", () => {
  it("falls back for anything missing or the wrong type", () => {
    expect(str({ a: 1 }, "a", "x")).toBe("x");
    expect(str(undefined, "a")).toBe("");
    expect(list({ a: [{ k: 1 }, "no", null, [1]] }, "a")).toEqual([{ k: 1 }]);
    expect(strings({ a: ["x", " ", 3, "y"] }, "a")).toEqual(["x", "y"]);
  });

  it("normalises whatever the API returned", () => {
    expect(normalizeContent(null).blocks).toEqual([]);
    expect(normalizeContent(null).site.brand_name).toBe("My Course Companion");
    const page = normalizeContent({
      site: { brand_name: "Learnly" },
      blocks: [{ id: "a", type: "hero", data: { x: 1 } }, { id: 5 }, "junk", { id: "b", type: "faq", visible: false }],
    });
    expect(page.site.brand_name).toBe("Learnly");
    expect(page.site.login_label).toBe("Log in");
    expect(page.blocks.map((b) => [b.id, b.visible])).toEqual([["a", true], ["b", false]]);
  });

  it("shows only visible blocks of known types", () => {
    const page = normalizeContent({ blocks: [
      { id: "a", type: "hero", visible: true }, { id: "b", type: "faq", visible: false }, { id: "c", type: "from_the_future", visible: true },
    ] });
    expect(ids(visibleBlocks(page))).toEqual(["a"]);
  });
});

describe("links", () => {
  it.each(["https://x.test", "http://localhost:3000", "/signup", "#faq", "mailto:a@b.co", "tel:+234", ""])("%s is safe", (href) => {
    expect(isSafeHref(href)).toBe(true);
  });
  it.each(["javascript:alert(1)", "data:text/html,x", "//evil.test", "ftp://x"])("%s is not", (href) => {
    expect(isSafeHref(href)).toBe(false);
    expect(safeHref(href)).toBe("#");
  });
  it("turns an empty address into #", () => expect(safeHref("")).toBe("#"));
});
