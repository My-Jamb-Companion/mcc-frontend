// @vitest-environment jsdom
import {describe, expect, it} from "vitest";
import type {CreatPracticeQuestionType} from "@/src/features/question-editor/types";
import {apiName, displayName, flatten, groupByName, nameTaken, nextName, PracticeSet, setsOf} from "./practiceSets";

const q = (id: string): CreatPracticeQuestionType => ({id, type: "single", question: id, options: []});
const set = (id: string, name: string, ...questions: string[]): PracticeSet => ({id, name, questions: questions.map(q)});

describe("names", () => {
  it("the default set is called Practice, on screen and to students", () => {
    expect(displayName("")).toBe("Practice");
    expect(displayName("   ")).toBe("Practice");
    expect(displayName(" Passages ")).toBe("Passages");
  });

  it("the server is sent no name for the default set, and the name trimmed otherwise", () => {
    expect(apiName("")).toBeUndefined();
    expect(apiName("practice")).toBeUndefined();
    expect(apiName("  Practice ")).toBeUndefined();
    expect(apiName("  Passage practice ")).toBe("Passage practice");
  });
});

describe("setsOf", () => {
  it("is the leaf's own sets", () => {
    const sets = [set("s1", "A", "q1")];
    expect(setsOf({id: "l", sets})).toBe(sets);
  });

  it("is one default set made of the questions when the leaf has no sets yet", () => {
    const sets = setsOf({id: "l", questions: [q("q1"), q("q2")]});
    expect(sets).toHaveLength(1);
    expect(sets[0].name).toBe("");
    expect(sets[0].questions.map((x) => x.id)).toEqual(["q1", "q2"]);
  });

  it("is one empty default set for a brand new leaf", () => {
    expect(setsOf({id: "l"})[0].questions).toEqual([]);
  });

  it("is stable between renders, so the chosen set does not jump", () => {
    expect(setsOf({id: "l"})[0].id).toBe(setsOf({id: "l"})[0].id);
  });
});

describe("flatten", () => {
  it("lists every question, set after set", () => {
    expect(flatten([set("a", "A", "q1", "q2"), set("b", "B", "q3")]).map((x) => x.id)).toEqual(["q1", "q2", "q3"]);
  });
});

describe("groupByName", () => {
  let n = 0;
  const id = () => `set${++n}`;
  const rows = (names: (string | null)[]) => names.map((set_name, i) => ({set_name, id: `q${i}`}));
  const toQuestion = (row: {id: string}) => q(row.id);

  it("makes one set per name, in the order the names first appear", () => {
    const sets = groupByName(rows([null, null, "Passages", "Vocab", "Passages"]), toQuestion, id);
    expect(sets.map((s) => [s.name, s.questions.map((x) => x.id)])).toEqual([
      ["", ["q0", "q1"]],
      ["Passages", ["q2", "q4"]],
      ["Vocab", ["q3"]],
    ]);
  });

  it("treats a set explicitly named Practice as the default set", () => {
    const sets = groupByName(rows([null, "Practice", "practice"]), toQuestion, id);
    expect(sets).toHaveLength(1);
    expect(sets[0].name).toBe("");
    expect(sets[0].questions).toHaveLength(3);
  });

  it("groups names that differ only in case, keeping the first spelling", () => {
    const sets = groupByName(rows(["Vocab", "vocab"]), toQuestion, id);
    expect(sets.map((s) => s.name)).toEqual(["Vocab"]);
    expect(sets[0].questions).toHaveLength(2);
  });

  it("is empty when there are no practice questions", () => {
    expect(groupByName([], toQuestion, id)).toEqual([]);
  });
});

describe("naming a new set", () => {
  it("another set already has the name (the default counts as Practice)", () => {
    const sets = [set("a", ""), set("b", "Passages")];
    expect(nameTaken(sets, "c", "practice")).toBe(true);
    expect(nameTaken(sets, "c", "PASSAGES")).toBe(true);
    expect(nameTaken(sets, "c", "Vocab")).toBe(false);
  });

  it("a set keeping its own name is not a clash", () => {
    expect(nameTaken([set("a", "Passages")], "a", "Passages")).toBe(false);
  });

  it("the next name skips ones in use", () => {
    expect(nextName([set("a", "")])).toBe("Practice 2");
    expect(nextName([set("a", ""), set("b", "Practice 3")])).toBe("Practice 2");
    expect(nextName([set("a", ""), set("b", "Practice 2"), set("c", "Practice 3")])).toBe("Practice 4");
  });
});
