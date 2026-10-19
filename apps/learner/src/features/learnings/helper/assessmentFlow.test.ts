import {describe, expect, it} from "vitest";
import {
  afterCheck, afterHint, afterReveal, canCheck, canTakeHint, finishedCount, firstTryCount, isFinished,
  minutesLabel, newQuestionState, pickOption, primaryLabel, starParts,
} from "./assessmentFlow";

const wrong = {is_correct: false, attempt_no: 1, first_try: false, hints_used: 0, correct_answer: null, explanation: null, option_feedback: null, already_solved: false};
const right = {...wrong, is_correct: true, first_try: true, correct_answer: "A", explanation: "Because."};

describe("a question's life", () => {
  it("starts idle with nothing picked, and picking an option sets the answer", () => {
    const s = newQuestionState();
    expect(s.status).toBe("idle");
    expect(canCheck(s, null)).toBe(false);
    expect(canCheck(pickOption(s, "B"), null)).toBe(true);
  });

  it("a wrong answer keeps the question open and shows nothing about the answer", () => {
    const s = afterCheck(pickOption(newQuestionState(), "B"), wrong);
    expect(s.status).toBe("wrong");
    expect(s.correctAnswer).toBeNull();
    expect(isFinished(s)).toBe(false);
    expect(primaryLabel(s, false)).toBe("Check again");
  });

  it("after a miss the same option cannot be checked again, a different one can", () => {
    const s = afterCheck(pickOption(newQuestionState(), "B"), wrong);
    expect(canCheck(s, "B")).toBe(false);
    expect(canCheck(pickOption(s, "C"), "B")).toBe(true);
  });

  it("after a miss the student can pick another option and the hints stay", () => {
    const hinted = afterHint(afterCheck(pickOption(newQuestionState(), "B"), wrong), {step: 1, total: 3, text: "t", last: false, steps: ["t"]});
    const again = pickOption(hinted, "C");
    expect(again.status).toBe("wrong");
    expect(again.answer).toBe("C");
    expect(again.hints).toEqual(["t"]);
    expect(again.attempts).toBe(1);
  });

  it("a right answer closes the question and records first try", () => {
    const s = afterCheck(pickOption(newQuestionState(), "A"), right);
    expect(s.status).toBe("solved");
    expect(s.firstTry).toBe(true);
    expect(s.correctAnswer).toBe("A");
    expect(isFinished(s)).toBe(true);
    expect(primaryLabel(s, false)).toBe("Next question");
    expect(primaryLabel(s, true)).toBe("Show summary");
  });

  it("right after a miss is solved but not first try", () => {
    let s = afterCheck(pickOption(newQuestionState(), "B"), wrong);
    s = afterCheck(pickOption(s, "A"), {...right, attempt_no: 2, first_try: false});
    expect(s.status).toBe("solved");
    expect(s.firstTry).toBe(false);
  });

  it("a finished question cannot be picked again", () => {
    const solved = afterCheck(pickOption(newQuestionState(), "A"), right);
    expect(pickOption(solved, "B").answer).toBe("A");
  });

  it("skipping reveals the answer and closes the question", () => {
    const s = afterReveal(newQuestionState(), {correct_answer: "A", explanation: "Because."});
    expect(s.status).toBe("revealed");
    expect(s.correctAnswer).toBe("A");
    expect(s.firstTry).toBe(false);
    expect(canTakeHint(s)).toBe(false);
  });
});

describe("hints", () => {
  it("can be asked for until the last step is shown", () => {
    let s = newQuestionState();
    expect(canTakeHint(s)).toBe(true);
    s = afterHint(s, {step: 1, total: 2, text: "a", last: false, steps: ["a"]});
    expect(canTakeHint(s)).toBe(true);
    s = afterHint(s, {step: 2, total: 2, text: "b", last: true, steps: ["a", "b"]});
    expect(canTakeHint(s)).toBe(false);
    expect(s.hints).toEqual(["a", "b"]);
  });
});

describe("the tally", () => {
  it("counts finished and right-first-time questions", () => {
    const solved = afterCheck(pickOption(newQuestionState(), "A"), right);
    const slow = afterCheck(pickOption(newQuestionState(), "A"), {...right, attempt_no: 2, first_try: false});
    const skipped = afterReveal(newQuestionState(), {correct_answer: "A", explanation: null});
    const open = newQuestionState();
    expect(finishedCount([solved, slow, skipped, open])).toBe(3);
    expect(firstTryCount([solved, slow, skipped, open])).toBe(1);
  });
});

describe("labels", () => {
  it("describes the time estimate", () => {
    expect(minutesLabel({min: 5, max: 10})).toBe("5 - 10 minutes");
    expect(minutesLabel({min: 1, max: 1})).toBe("1 minute");
  });

  it("splits a star score into whole, half and empty stars", () => {
    expect(starParts(3.5)).toEqual({full: 3, half: true, empty: 1});
    expect(starParts(0)).toEqual({full: 0, half: false, empty: 5});
    expect(starParts(5)).toEqual({full: 5, half: false, empty: 0});
    expect(starParts(9)).toEqual({full: 5, half: false, empty: 0});
  });
});
