import {describe, expect, it} from "vitest";
import type {ApiMockQuestion, ApiMockState} from "@/src/features/exams/services/exam.service";
import {
  addSpent,
  applyUpdate,
  durationLabel,
  filterReview,
  isRightOption,
  isYourOption,
  mockCounts,
  paletteStatus,
  pickAnswer,
  stateDiff,
  submitWarning,
  timeUsedLabel,
  toggleFlag,
} from "./mockExam";

const q = (id: string, type = "single_choice"): ApiMockQuestion => ({
  question_id: id, question_text: id, description: null, question_type: type, options: ["A", "B", "C"],
});
const empty = (): ApiMockState => ({answers: {}, flagged: [], spent: {}, current: 0});

describe("palette", () => {
  it("marks the current, flagged, answered and unanswered questions", () => {
    const state: ApiMockState = {...empty(), answers: {q2: "A"}, flagged: ["q3"]};
    expect(paletteStatus("q1", 0, 0, state)).toBe("current");
    expect(paletteStatus("q2", 1, 0, state)).toBe("answered");
    expect(paletteStatus("q3", 2, 0, state)).toBe("flagged");
    expect(paletteStatus("q4", 3, 0, state)).toBe("unanswered");
  });

  it("a flagged question shows as flagged even when answered", () => {
    expect(paletteStatus("q2", 1, 0, {...empty(), answers: {q2: "A"}, flagged: ["q2"]})).toBe("flagged");
  });

  it("counts answered, unanswered and flagged", () => {
    const state: ApiMockState = {...empty(), answers: {q1: "A", q2: ["A", "B"]}, flagged: ["q2", "q3"]};
    expect(mockCounts([q("q1"), q("q2"), q("q3"), q("q4")], state)).toEqual({total: 4, answered: 2, unanswered: 2, flagged: 2});
  });
});

describe("pickAnswer", () => {
  it("picks, changes and clears a single-choice answer", () => {
    let s = pickAnswer(empty(), q("q1"), "A");
    expect(s.answers).toEqual({q1: "A"});
    s = pickAnswer(s, q("q1"), "B");
    expect(s.answers).toEqual({q1: "B"});
    s = pickAnswer(s, q("q1"), "B");
    expect(s.answers).toEqual({});
  });

  it("toggles options of a multiple-choice question and clears when none are left", () => {
    const m = q("q1", "multiple_choice");
    let s = pickAnswer(empty(), m, "A");
    s = pickAnswer(s, m, "C");
    expect(s.answers.q1).toEqual(["A", "C"]);
    s = pickAnswer(s, m, "A");
    expect(s.answers.q1).toEqual(["C"]);
    s = pickAnswer(s, m, "C");
    expect(s.answers).toEqual({});
  });

  it("does not change the state it was given", () => {
    const before = empty();
    pickAnswer(before, q("q1"), "A");
    expect(before.answers).toEqual({});
  });
});

describe("flags and time", () => {
  it("toggles a flag", () => {
    const s = toggleFlag(empty(), "q1");
    expect(s.flagged).toEqual(["q1"]);
    expect(toggleFlag(s, "q1").flagged).toEqual([]);
  });

  it("adds whole seconds to a question and ignores nothing-or-negative", () => {
    let s = addSpent(empty(), "q1", 12.9);
    s = addSpent(s, "q1", 3);
    expect(s.spent).toEqual({q1: 15});
    expect(addSpent(s, "q1", -5)).toBe(s);
    expect(addSpent(s, "q1", 0.4)).toBe(s);
  });
});

describe("autosave diff", () => {
  it("is null when nothing changed", () => {
    expect(stateDiff(empty(), empty())).toBeNull();
  });

  it("sends only what changed, with a cleared answer as null", () => {
    const saved: ApiMockState = {answers: {q1: "A", q2: "B"}, flagged: ["q1"], spent: {q1: 5}, current: 0};
    const now: ApiMockState = {answers: {q1: "C", q3: "A"}, flagged: ["q1"], spent: {q1: 5, q3: 2}, current: 2};
    expect(stateDiff(saved, now)).toEqual({answers: {q1: "C", q3: "A", q2: null}, spent: {q3: 2}, current: 2});
  });

  it("sends the whole flag list when it changed, whatever the order", () => {
    const saved = {...empty(), flagged: ["a", "b"]};
    expect(stateDiff(saved, {...saved, flagged: ["b", "a"]})).toBeNull();
    expect(stateDiff(saved, {...saved, flagged: ["a"]})).toEqual({flagged: ["a"]});
  });

  it("applying the diff makes the saved copy equal to the current one", () => {
    const saved: ApiMockState = {answers: {q1: "A", q2: "B"}, flagged: [], spent: {q1: 5}, current: 0};
    const now: ApiMockState = {answers: {q1: "C", q3: "A"}, flagged: ["q3"], spent: {q1: 9}, current: 3};
    const diff = stateDiff(saved, now)!;
    expect(applyUpdate(saved, diff)).toEqual(now);
    expect(stateDiff(applyUpdate(saved, diff), now)).toBeNull();
  });
});

describe("labels", () => {
  it("describes durations", () => {
    expect(durationLabel(45)).toBe("45 min");
    expect(durationLabel(60)).toBe("1 hr");
    expect(durationLabel(150)).toBe("2 hr 30 min");
  });

  it("describes time used", () => {
    expect(timeUsedLabel(45)).toBe("45 s");
    expect(timeUsedLabel(125)).toBe("2 min 5 s");
    expect(timeUsedLabel(600)).toBe("10 min");
    expect(timeUsedLabel(5400)).toBe("1 hr 30 min");
  });

  it("warns about what is left undone", () => {
    expect(submitWarning({total: 5, answered: 5, unanswered: 0, flagged: 0})).toBe("You have answered every question.");
    expect(submitWarning({total: 5, answered: 4, unanswered: 1, flagged: 0})).toBe("1 question is unanswered and will be marked wrong.");
    expect(submitWarning({total: 5, answered: 2, unanswered: 3, flagged: 2})).toBe(
      "3 questions are unanswered and will be marked wrong, and 2 are flagged for review.",
    );
  });
});

describe("review helpers", () => {
  it("knows the right option, including for multiple choice", () => {
    expect(isRightOption("Paris", "Paris")).toBe(true);
    expect(isRightOption("Paris", "Rome")).toBe(false);
    expect(isRightOption("A, C", "C")).toBe(true);
    expect(isRightOption("A, C", "B")).toBe(false);
  });

  it("knows which options the student picked", () => {
    expect(isYourOption("A", "A")).toBe(true);
    expect(isYourOption(["A", "C"], "C")).toBe(true);
    expect(isYourOption(["A"], "B")).toBe(false);
    expect(isYourOption(null, "A")).toBe(false);
  });

  it("filters the review", () => {
    const rows = [
      {id: 1, is_correct: true, flagged: false}, {id: 2, is_correct: false, flagged: true}, {id: 3, is_correct: false, flagged: false},
    ];
    expect(filterReview(rows, "all")).toHaveLength(3);
    expect(filterReview(rows, "wrong").map((r) => r.id)).toEqual([2, 3]);
    expect(filterReview(rows, "flagged").map((r) => r.id)).toEqual([2]);
  });
});
