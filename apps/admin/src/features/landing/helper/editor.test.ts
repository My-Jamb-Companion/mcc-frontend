import {describe, expect, it} from "vitest";
import {BLOCKS, createBlock} from "@mcc/landing-content";
import {blockSubtitle, blockTitle, editorStatus, emptyItem, findUnsafeLinks} from "./editor";

describe("emptyItem", () => {
  it("has every field of the list, empty, with the right shape", () => {
    const item = emptyItem([
      {kind: "text", key: "q", label: "Q"},
      {kind: "toggle", key: "highlight", label: "H"},
      {kind: "strings", key: "tags", label: "T", itemLabel: "Tag"},
      {kind: "list", key: "links", label: "L", itemLabel: "Link", titleKey: "label", fields: []},
      {kind: "select", key: "kind", label: "K", options: [{value: "a", label: "A"}]},
    ]);
    expect(item).toEqual({q: "", highlight: false, tags: [], links: [], kind: "a"});
  });

  it("builds an item that matches each real list field", () => {
    for (const block of BLOCKS)
      for (const f of block.fields)
        if (f.kind === "list") expect(Object.keys(emptyItem(f.fields)).sort(), `${block.type}.${f.key}`).toEqual(f.fields.map((x) => x.key).sort());
  });
});

describe("block labels", () => {
  it("names a block by its type and shows its headline underneath", () => {
    const hero = createBlock("hero");
    expect(blockTitle(hero)).toBe("Hero");
    expect(blockSubtitle(hero)).toBe("Walk into your exam ready.");
    expect(blockSubtitle(createBlock("faq"))).toBe("Questions? We've got you.");
    expect(blockTitle({id: "x", type: "from_the_future", visible: true, data: {}})).toBe("from_the_future");
  });
});

describe("editorStatus", () => {
  const base = {dirty: false, hasDraft: false, hasPublished: true, draftDiffers: false};
  it("puts unsaved edits first", () => expect(editorStatus({...base, dirty: true})).toMatchObject({label: "Unsaved changes", tone: "warn"}));
  it("says when a saved draft is waiting", () => expect(editorStatus({...base, hasDraft: true, draftDiffers: true}).label).toBe("Draft saved, not published"));
  it("is plain 'Published' when nothing is pending", () => expect(editorStatus(base)).toEqual({label: "Published", tone: "ok"}));
  it("explains what visitors see before the first publish", () =>
    expect(editorStatus({...base, hasPublished: false}).label).toContain("built-in design"));
});

describe("findUnsafeLinks", () => {
  it("finds links the backend would refuse, by path", () => {
    const page = {
      site: {logo_url: "javascript:1", nav_links: [{label: "A", href: "/ok"}, {label: "B", href: "ftp://x"}]},
      blocks: [{id: "a", data: {cta_href: "data:text/html,x", image_url: ""}}],
    };
    expect(findUnsafeLinks(page)).toEqual(["site.logo_url", "site.nav_links[1].href", "blocks[0].data.cta_href"]);
  });

  it("is happy with the built-in page", async () => {
    const {defaultContent} = await import("@mcc/landing-content");
    expect(findUnsafeLinks(defaultContent())).toEqual([]);
  });
});
