import { describe, expect, it } from "vitest";
import { MAX_PINNED, answersLabel, canPinMore, pinnedCount, removeWarning } from "./community.helpers";

describe("pinning", () => {
  it("counts what is pinned and stops at three", () => {
    const posts = [{ pinned: true }, { pinned: false }, { pinned: true }, {}];
    expect(pinnedCount(posts)).toBe(2);
    expect(canPinMore(posts)).toBe(true);
    expect(canPinMore([{ pinned: true }, { pinned: true }, { pinned: true }])).toBe(false);
    expect(MAX_PINNED).toBe(3);
  });
});

describe("answersLabel", () => {
  it("counts answers", () => {
    expect(answersLabel(0)).toBe("No answers yet");
    expect(answersLabel(1)).toBe("1 answer");
    expect(answersLabel(4)).toBe("4 answers");
  });
});

describe("removeWarning", () => {
  it("tells the teacher what removing does", () => {
    expect(removeWarning("Ada")).toContain("Ada will be told");
    expect(removeWarning(null)).toContain("The author will be told");
    expect(removeWarning("Ada")).toContain("mutes them");
  });
});
