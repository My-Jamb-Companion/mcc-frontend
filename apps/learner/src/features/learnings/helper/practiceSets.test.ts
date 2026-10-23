import {describe, expect, it} from "vitest";
import {practiceRows} from "./practiceSets";

describe("practiceRows", () => {
  it("is none when the module has no practice", () => {
    expect(practiceRows({practice_count: 0, practice_sets: []})).toEqual([]);
  });

  it("is the single Practice row, played as a whole, for one default set", () => {
    expect(practiceRows({practice_count: 6, practice_sets: [{name: "Practice", count: 6}]})).toEqual([{label: "Practice", count: 6}]);
  });

  it("is the same single row from an older server that lists no sets", () => {
    expect(practiceRows({practice_count: 6})).toEqual([{label: "Practice", count: 6}]);
  });

  it("is one row per set, each playing its own set, when there are several", () => {
    expect(practiceRows({practice_count: 9, practice_sets: [
      {name: "Practice", count: 2}, {name: "Passage practice", count: 5}, {name: "Vocabulary", count: 2},
    ]})).toEqual([
      {label: "Practice", count: 2, setName: "Practice"},
      {label: "Passage practice", count: 5, setName: "Passage practice"},
      {label: "Vocabulary", count: 2, setName: "Vocabulary"},
    ]);
  });

  it("a single named set shows its name", () => {
    expect(practiceRows({practice_count: 4, practice_sets: [{name: "Passage practice", count: 4}]})).toEqual([{label: "Passage practice", count: 4}]);
  });

  it("leaves out a set with nothing in it", () => {
    expect(practiceRows({practice_count: 3, practice_sets: [{name: "Empty", count: 0}, {name: "Real", count: 3}]})).toEqual([{label: "Real", count: 3}]);
  });
});
