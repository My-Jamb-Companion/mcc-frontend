import {describe, expect, it} from "vitest";
import {lessonProgress, targetPage} from "./lessonPager";

describe("lesson pager keys", () => {
  it("moves one page down or up and stops at the ends", () => {
    expect(targetPage("ArrowDown", 0, 4)).toBe(1);
    expect(targetPage("PageDown", 3, 4)).toBe(3);
    expect(targetPage("ArrowUp", 2, 4)).toBe(1);
    expect(targetPage("PageUp", 0, 4)).toBe(0);
  });

  it("jumps to the first or last page", () => {
    expect(targetPage("Home", 2, 4)).toBe(0);
    expect(targetPage("End", 0, 4)).toBe(3);
  });

  it("ignores other keys", () => {
    expect(targetPage("a", 1, 4)).toBeNull();
    expect(targetPage("Tab", 1, 4)).toBeNull();
  });
});

describe("lesson progress", () => {
  it("is the share of sections reached, never above 100", () => {
    expect(lessonProgress(0, 4)).toBe(25);
    expect(lessonProgress(3, 4)).toBe(100);
    expect(lessonProgress(9, 4)).toBe(100);
    expect(lessonProgress(0, 0)).toBe(0);
  });
});
