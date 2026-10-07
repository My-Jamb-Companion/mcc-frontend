import {describe, expect, it} from "vitest";
import {
  addRank,
  Answers,
  blankRow,
  buildPayload,
  isAnswered,
  moveRank,
  Question,
  removeRank,
  stepOfQuestion,
  stepProblems,
  SurveyDefinition,
  toggleMulti,
} from "./survey";

const resultsQ: Question = {key: "results", kind: "results", title: "R", required: true, min_rows: 1, max_rows: 12, bands: [], exams: [], subjects: [], before_label: "b", after_label: "a"};
const singleQ: Question = {key: "enjoyable", kind: "single", title: "E", required: true, options: [{value: "agree", label: "Agree"}]};
const multiQ: Question = {key: "challenges", kind: "multi", title: "C", required: false, options: [{value: "time", label: "Time"}]};
const pairsQ: Question = {
  key: "changes", kind: "pairs", title: "P", required: true,
  items: [{key: "a", title: "A", style: "number", options: []}, {key: "b", title: "B", style: "number", options: []}],
};
const textQ: Question = {key: "comments", kind: "text", title: "T", required: false, max_length: 2000};
const rankQ: Question = {key: "top", kind: "rank", title: "K", required: false, max: 5, options: []};

const DEF: SurveyDefinition = {
  key: "k", title: "t", intro: "i",
  steps: [{id: "one", title: "One", questions: [resultsQ]}, {id: "two", title: "Two", questions: [pairsQ, singleQ]}, {id: "three", title: "Three", questions: [multiQ, rankQ, textQ]}],
};

const row = {subject: "Maths", exam: "waec", before: "40_49", after: "60_69"};

describe("isAnswered", () => {
  it("needs a complete row for results, and every item rated before and after for pairs", () => {
    expect(isAnswered(resultsQ, [row])).toBe(true);
    expect(isAnswered(resultsQ, [])).toBe(false);
    expect(isAnswered(resultsQ, [{...row, after: ""}])).toBe(false);
    expect(isAnswered(pairsQ, {a: {before: 1, after: 3}, b: {before: 2, after: 2}})).toBe(true);
    expect(isAnswered(pairsQ, {a: {before: 1, after: 3}, b: {before: 2}})).toBe(false);
  });
  it("handles choices and text", () => {
    expect(isAnswered(singleQ, "agree")).toBe(true);
    expect(isAnswered(singleQ, undefined)).toBe(false);
    expect(isAnswered(multiQ, [])).toBe(false);
    expect(isAnswered(multiQ, ["time"])).toBe(true);
    expect(isAnswered(textQ, "  ")).toBe(false);
  });
});

describe("stepProblems", () => {
  it("reports each required question that is not answered", () => {
    expect(Object.keys(stepProblems(DEF.steps[1], {}))).toEqual(["changes", "enjoyable"]);
    expect(stepProblems(DEF.steps[1], {changes: {a: {before: 1, after: 2}, b: {before: 1, after: 2}}, enjoyable: "agree"})).toEqual({});
  });
  it("lets optional questions be skipped", () => {
    expect(stepProblems(DEF.steps[2], {})).toEqual({});
  });
  it("won't let a half-filled subject slip through", () => {
    expect(stepProblems(DEF.steps[0], {results: [row, {...blankRow(), subject: "Physics"}]}).results).toMatch(/Finish or remove/);
    expect(stepProblems(DEF.steps[0], {results: [row, blankRow()]}).results).toBeUndefined();
  });
});

describe("buildPayload", () => {
  it("sends only what was answered, with text trimmed", () => {
    const answers: Answers = {results: [row], enjoyable: "agree", challenges: [], comments: "  hi  ", top: ["a"], ignored: "x"};
    expect(buildPayload(DEF, answers)).toEqual({results: [row], enjoyable: "agree", top: ["a"], comments: "hi"});
  });
  it("leaves out a blank spare row's question when nothing complete was entered", () => {
    expect(buildPayload(DEF, {results: [blankRow()]})).toEqual({});
  });
});

describe("stepOfQuestion", () => {
  it("finds the step to send the student back to", () => {
    expect(stepOfQuestion(DEF, "results")).toBe(0);
    expect(stepOfQuestion(DEF, "enjoyable")).toBe(1);
    expect(stepOfQuestion(DEF, "unknown")).toBe(0);
  });
});

describe("ranking", () => {
  it("adds each once up to the limit, removes, and reorders", () => {
    expect(addRank(["a"], "b", 5)).toEqual(["a", "b"]);
    expect(addRank(["a"], "a", 5)).toEqual(["a"]);
    expect(addRank(["a", "b"], "c", 2)).toEqual(["a", "b"]);
    expect(removeRank(["a", "b"], "a")).toEqual(["b"]);
    expect(moveRank(["a", "b", "c"], 2, -1)).toEqual(["a", "c", "b"]);
    expect(moveRank(["a", "b"], 0, -1)).toEqual(["a", "b"]);
    expect(moveRank(["a", "b"], 1, 1)).toEqual(["a", "b"]);
  });
  it("toggles a multi-choice value", () => {
    expect(toggleMulti(["a"], "b")).toEqual(["a", "b"]);
    expect(toggleMulti(["a", "b"], "a")).toEqual(["b"]);
  });
});
