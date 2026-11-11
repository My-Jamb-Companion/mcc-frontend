import {describe, expect, it} from "vitest";
import {isMultipleChoice, isRightAnswerOption, parseStoredAnswer} from "./questionType";

describe("isMultipleChoice", () => {
  it("counts both spellings the admin and exam screens save", () => {
    expect(isMultipleChoice("multi_choice")).toBe(true);
    expect(isMultipleChoice("multiple_choice")).toBe(true);
  });

  it("is false for a single-answer or typed question", () => {
    expect(isMultipleChoice("single_choice")).toBe(false);
    expect(isMultipleChoice("long_short_answer", ["a", "b"])).toBe(false);
    expect(isMultipleChoice(undefined)).toBe(false);
  });

  it("is true whenever more than one answer is right, whatever the type says", () => {
    expect(isMultipleChoice("single_choice", ["A", "C"])).toBe(true);
    expect(isMultipleChoice("single_choice", ["A"])).toBe(false);
  });
});

describe("isRightAnswerOption", () => {
  it("matches one right answer or any of several worded as a list", () => {
    expect(isRightAnswerOption("Paris", "Paris")).toBe(true);
    expect(isRightAnswerOption("Intentional rest, Planned exercise", "Planned exercise")).toBe(true);
    expect(isRightAnswerOption("Intentional rest, Planned exercise", "Focused study")).toBe(false);
  });

  it("does not match part of a longer option, and nothing before the answer is known", () => {
    expect(isRightAnswerOption("Red wine, Blue", "Red")).toBe(false);
    expect(isRightAnswerOption(null, "Red")).toBe(false);
  });
});

describe("parseStoredAnswer", () => {
  it("reads a list answer, a plain answer, and nothing", () => {
    expect(parseStoredAnswer('["A","C"]')).toEqual(["A", "C"]);
    expect(parseStoredAnswer("B")).toEqual(["B"]);
    expect(parseStoredAnswer("[not json")).toEqual(["[not json"]);
    expect(parseStoredAnswer(null)).toEqual([]);
  });
});
