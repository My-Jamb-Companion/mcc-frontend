import {describe, expect, it} from "vitest";
import {splitIntoBlocks} from "./lessonBlocks";

describe("splitIntoBlocks", () => {
  it("splits admin-authored HTML into one block per top-level heading", () => {
    const html = "<h2>Intro</h2><p>First</p><h2>Next</h2><p>Second</p>";
    expect(splitIntoBlocks(html)).toEqual([
      {heading: "Intro", html: "<p>First</p>"},
      {heading: "Next", html: "<p>Second</p>"},
    ]);
  });

  it("keeps content before the first heading as a headingless leading block", () => {
    const html = "<p>Leading</p><h2>Intro</h2><p>First</p>";
    expect(splitIntoBlocks(html)).toEqual([
      {heading: null, html: "<p>Leading</p>"},
      {heading: "Intro", html: "<p>First</p>"},
    ]);
  });

  it("strips inline formatting tags from the heading label", () => {
    const html = "<h2><strong>Bold</strong> heading</h2><p>Body</p>";
    expect(splitIntoBlocks(html)).toEqual([
      {heading: "Bold heading", html: "<p>Body</p>"},
    ]);
  });

  it("treats content with no heading at all as a single block", () => {
    const html = "<p>Just a paragraph, no heading.</p>";
    expect(splitIntoBlocks(html)).toEqual([
      {heading: null, html: "<p>Just a paragraph, no heading.</p>"},
    ]);
  });

  it("returns nothing for empty content", () => {
    expect(splitIntoBlocks("")).toEqual([]);
  });
});
