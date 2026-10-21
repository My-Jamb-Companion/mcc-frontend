import {describe, expect, it} from "vitest";
import {hasUnderline, splitUnderlined} from "./markedText";

describe("splitUnderlined", () => {
  it("leaves plain text alone", () => {
    expect(splitUnderlined("No marks here")).toEqual([{text: "No marks here", underline: false}]);
    expect(hasUnderline("No marks here")).toBe(false);
  });

  it("underlines what is between double underscores", () => {
    expect(splitUnderlined("He spoke with __his heart in his mouth__ yesterday")).toEqual([
      {text: "He spoke with ", underline: false},
      {text: "his heart in his mouth", underline: true},
      {text: " yesterday", underline: false},
    ]);
  });

  it("handles several marks, one at the very start and one at the very end", () => {
    expect(splitUnderlined("__a__ and __b__").map((p) => [p.text, p.underline])).toEqual([["a", true], [" and ", false], ["b", true]]);
  });

  it("works across a line break inside the marks", () => {
    expect(splitUnderlined("x __two\nlines__ y")[1]).toEqual({text: "two\nlines", underline: true});
  });

  it("leaves a lone pair of underscores as typed", () => {
    expect(splitUnderlined("snake__case")).toEqual([{text: "snake__case", underline: false}]);
    expect(splitUnderlined("a ____ b").some((p) => p.underline)).toBe(false);
  });

  it("an empty string stays one empty part", () => {
    expect(splitUnderlined("")).toEqual([{text: "", underline: false}]);
  });
});
