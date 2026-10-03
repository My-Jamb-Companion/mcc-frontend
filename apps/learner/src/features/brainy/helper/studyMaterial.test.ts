import {describe, expect, it} from "vitest";
import {combineMaterial, deckIsSavable, fileKey, mergeDeck, splitIntoParts, titleFromFilename} from "./studyMaterial";

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

describe("combineMaterial", () => {
  it("is just the transcript when there are no screenshots", () => {
    expect(combineMaterial("  hello  ", [])).toBe("hello");
  });

  it("appends labelled screenshot text after the transcript, numbered in order", () => {
    const out = combineMaterial("Spoken words", [
      {name: "slide1.png", text: "Photosynthesis"},
      {name: "slide2.png", text: "Chlorophyll"},
    ]);
    expect(out.startsWith("Spoken words\n\n")).toBe(true);
    expect(out).toContain("[Screenshot 1: slide1.png]\nPhotosynthesis");
    expect(out).toContain("[Screenshot 2: slide2.png]\nChlorophyll");
  });

  it("works with screenshots only", () => {
    const out = combineMaterial("", [{name: "a.png", text: "Only slide"}]);
    expect(out.startsWith("Screenshots taken during the lecture")).toBe(true);
    expect(out).toContain("Only slide");
  });

  it("skips screenshots that read as blank, without leaving gaps in the numbering", () => {
    const out = combineMaterial("t", [
      {name: "blank.png", text: "   "},
      {name: "real.png", text: "Content"},
    ]);
    expect(out).not.toContain("blank.png");
    expect(out).toContain("[Screenshot 1: real.png]");
  });

  it("is empty when there is nothing at all", () => {
    expect(combineMaterial("  ", [{name: "x.png", text: ""}])).toBe("");
  });
});

describe("fileKey", () => {
  it("matches the same file and tells different ones apart", () => {
    const a = {name: "s.png", size: 10, lastModified: 1};
    expect(fileKey(a)).toBe(fileKey({...a}));
    expect(fileKey(a)).not.toBe(fileKey({...a, size: 11}));
    expect(fileKey(a)).not.toBe(fileKey({...a, name: "t.png"}));
  });
});
