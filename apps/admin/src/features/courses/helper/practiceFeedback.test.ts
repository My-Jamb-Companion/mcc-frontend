import {describe, expect, it} from "vitest";
import {hasAnyResponse, isChosenCorrect, responsesForChosen} from "./practiceFeedback";

const question = {options: ["Paris", "Lyon", "Nice"], option_feedback: ["Yes, the capital.", "A big city, not the capital.", null]};

describe("isChosenCorrect", () => {
  it("compares as sets, ignoring order, case and padding", () => {
    expect(isChosenCorrect([" paris "], ["Paris"])).toBe(true);
    expect(isChosenCorrect(["A", "B"], ["b", "a"])).toBe(true);
  });
  it("is wrong for a missing, extra or different option", () => {
    expect(isChosenCorrect(["A"], ["A", "B"])).toBe(false);
    expect(isChosenCorrect(["A", "C"], ["A"])).toBe(false);
    expect(isChosenCorrect([], ["A"])).toBe(false);
  });
});

describe("responsesForChosen", () => {
  it("gives the response written for the chosen option, right or wrong", () => {
    expect(responsesForChosen(question, ["Paris"], ["Paris"])).toEqual([
      {option: "Paris", response: "Yes, the capital.", correct: true},
    ]);
    expect(responsesForChosen(question, ["Lyon"], ["Paris"])).toEqual([
      {option: "Lyon", response: "A big city, not the capital.", correct: false},
    ]);
  });

  it("finds the response by the option's text, so a shuffled screen still matches", () => {
    // the screen shows [Nice, Paris, Lyon]; the student picks "Paris" -> still the Paris response
    expect(responsesForChosen(question, ["Paris"], ["Paris"])[0].response).toBe("Yes, the capital.");
  });

  it("returns null where no response was written", () => {
    expect(responsesForChosen(question, ["Nice"], ["Paris"])[0].response).toBeNull();
    expect(responsesForChosen({options: ["A"]}, ["A"], ["A"])[0].response).toBeNull();
  });

  it("covers every option chosen on a multiple-choice question, in order", () => {
    const out = responsesForChosen(question, ["Lyon", "Paris"], ["Paris", "Nice"]);
    expect(out.map((r) => [r.option, r.correct])).toEqual([["Lyon", false], ["Paris", true]]);
  });

  it("ignores blank choices and unknown options", () => {
    expect(responsesForChosen(question, ["", "Mars"], ["Paris"])).toEqual([{option: "Mars", response: null, correct: false}]);
  });
});

describe("hasAnyResponse", () => {
  it("is true only when some option has text", () => {
    expect(hasAnyResponse(question)).toBe(true);
    expect(hasAnyResponse({options: ["A"], option_feedback: [null, "  "]})).toBe(false);
    expect(hasAnyResponse({options: ["A"]})).toBe(false);
  });
});
