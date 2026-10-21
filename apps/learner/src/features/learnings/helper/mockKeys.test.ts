import {describe, expect, it} from "vitest";
import {interpretKey} from "./mockKeys";

const play = {confirming: false, optionCount: 4};
const confirming = {confirming: true, optionCount: 4};

describe("interpretKey while taking the exam", () => {
  it("A to D choose that option, in either case", () => {
    expect(interpretKey({key: "a"}, play)).toEqual({type: "pick", index: 0});
    expect(interpretKey({key: "B"}, play)).toEqual({type: "pick", index: 1});
    expect(interpretKey({key: "c"}, play)).toEqual({type: "pick", index: 2});
    expect(interpretKey({key: "D"}, play)).toEqual({type: "pick", index: 3});
  });

  it("an option the question does not have is not chosen", () => {
    expect(interpretKey({key: "d"}, {confirming: false, optionCount: 3})).toBeNull();
    expect(interpretKey({key: "c"}, {confirming: false, optionCount: 3})).toEqual({type: "pick", index: 2});
  });

  it("N is next, P is previous, S ends the exam", () => {
    expect(interpretKey({key: "n"}, play)).toEqual({type: "next"});
    expect(interpretKey({key: "P"}, play)).toEqual({type: "previous"});
    expect(interpretKey({key: "s"}, play)).toEqual({type: "end"});
  });

  it("Y and R do nothing until the confirmation box is open", () => {
    expect(interpretKey({key: "y"}, play)).toBeNull();
    expect(interpretKey({key: "r"}, play)).toBeNull();
  });

  it("other keys are left alone", () => {
    for (const key of ["e", "x", "1", "Enter", " ", "Escape", "ArrowRight", "Tab"]) expect(interpretKey({key}, play)).toBeNull();
  });
});

describe("interpretKey in the confirmation box", () => {
  it("Y ends the exam for good and R returns to it", () => {
    expect(interpretKey({key: "y"}, confirming)).toEqual({type: "confirm"});
    expect(interpretKey({key: "R"}, confirming)).toEqual({type: "return"});
  });

  it("nothing behind the box can be touched", () => {
    for (const key of ["a", "b", "n", "p", "s"]) expect(interpretKey({key}, confirming)).toBeNull();
  });
});

describe("interpretKey leaves real shortcuts and typing alone", () => {
  it("ignores Ctrl, Cmd and Alt combinations", () => {
    expect(interpretKey({key: "r", ctrlKey: true}, play)).toBeNull();
    expect(interpretKey({key: "s", metaKey: true}, play)).toBeNull();
    expect(interpretKey({key: "n", altKey: true}, play)).toBeNull();
  });

  it("ignores a held key", () => {
    expect(interpretKey({key: "a", repeat: true}, play)).toBeNull();
  });

  it("ignores keys typed into a text field", () => {
    const input = document.createElement("input");
    expect(interpretKey({key: "a", target: input}, play)).toBeNull();
    expect(interpretKey({key: "a", target: document.createElement("button")}, play)).toEqual({type: "pick", index: 0});
  });
});
