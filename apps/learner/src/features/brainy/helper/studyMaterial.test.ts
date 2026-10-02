import {describe, expect, it} from "vitest";
import {deckIsSavable, mergeDeck, splitIntoParts, titleFromFilename} from "./studyMaterial";

describe("splitIntoParts", () => {
  it("returns nothing for blank material", () => {
    expect(splitIntoParts("   \n ")).toEqual([]);
  });

  it("keeps short material as a single part", () => {
    expect(splitIntoParts("Short notes.", 100)).toEqual(["Short notes."]);
  });

  it("never exceeds the limit and loses no words", () => {
    const text = Array.from({length: 400}, (_, i) => `word${i}`).join(" ");
    const parts = splitIntoParts(text, 300);
    expect(parts.every((p) => p.length <= 300)).toBe(true);
    expect(parts.join(" ").split(/\s+/)).toEqual(text.split(/\s+/));
  });

  it("prefers paragraph boundaries over mid-paragraph cuts", () => {
    const p1 = "A".repeat(60), p2 = "B".repeat(60);
    const parts = splitIntoParts(`${p1}\n\n${p2}`, 100);
    expect(parts).toEqual([p1, p2]);
  });

  it("falls back to sentence ends and keeps the full stop with its sentence", () => {
    const text = "First sentence is here. Second sentence is also here and quite long okay.";
    const parts = splitIntoParts(text, 40);
    expect(parts[0].endsWith(".")).toBe(true);
    expect(parts[0]).toBe("First sentence is here.");
  });

  it("hard-cuts an unbroken string rather than looping forever", () => {
    const parts = splitIntoParts("x".repeat(250), 100);
    expect(parts.map((p) => p.length)).toEqual([100, 100, 50]);
  });

  it("does not leave a tiny first part because of an early paragraph break", () => {
    const text = `Hi\n\n${"word ".repeat(40)}`;
    const parts = splitIntoParts(text, 100);
    expect(parts[0].length).toBeGreaterThan(40);
  });
});

describe("mergeDeck", () => {
  const card = (front: string, back = "answer") => ({front, back});

  it("adds new cards and reports how many", () => {
    const result = mergeDeck([card("A")], [card("B"), card("C")]);
    expect(result.added).toBe(2);
    expect(result.deck.map((c) => c.front)).toEqual(["A", "B", "C"]);
  });

  it("skips cards whose front is already there, ignoring case and spacing", () => {
    const result = mergeDeck([card("What is  Osmosis?")], [card("what is osmosis?"), card("New")]);
    expect(result.added).toBe(1);
    expect(result.deck.map((c) => c.front)).toEqual(["What is  Osmosis?", "New"]);
  });

  it("de-dupes within the incoming batch too", () => {
    expect(mergeDeck([], [card("Same"), card("same")]).added).toBe(1);
  });

  it("ignores blank fronts", () => {
    expect(mergeDeck([], [card("  ")]).added).toBe(0);
  });
});

describe("deckIsSavable", () => {
  it("needs at least one card", () => expect(deckIsSavable([])).toBe(false));
  it("rejects a half-empty card", () => {
    expect(deckIsSavable([{front: "Q", back: " "}])).toBe(false);
    expect(deckIsSavable([{front: "", back: "A"}])).toBe(false);
  });
  it("accepts complete cards", () => expect(deckIsSavable([{front: "Q", back: "A"}])).toBe(true));
});

describe("titleFromFilename", () => {
  it("drops the extension and tidies separators", () => {
    expect(titleFromFilename("biology_chapter-3.pdf")).toBe("biology chapter 3");
    expect(titleFromFilename("notes.final.docx")).toBe("notes.final");
  });
});
