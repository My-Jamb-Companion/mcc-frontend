import {describe, expect, it} from "vitest";
import {gradeKey, indexGrades, percentLabel, verdictLabel} from "./quizGrades";

describe("quiz grades", () => {
  it("finds a grade by where it hangs, kind and set", () => {
    const items = [{id: "a", key: gradeKey("m1", "exercise", "Zone")}, {id: "b", key: gradeKey("m1", "practice", "")}];
    const map = indexGrades(items, (i) => i.key);
    expect(map.get(gradeKey("m1", "exercise", "Zone"))?.id).toBe("a");
    expect(map.get(gradeKey("m1", "practice"))?.id).toBe("b");
    expect(map.get(gradeKey("m2", "practice"))).toBeUndefined();
  });

  it("writes scores as whole percentages", () => {
    expect(percentLabel(66.6)).toBe("67%");
    expect(percentLabel(0)).toBe("0%");
  });

  it("says passed, not passed with the pass mark, or how the best score reads", () => {
    expect(verdictLabel({passed: true, passing_score: 70, best_percent: 80})).toBe("Passed");
    expect(verdictLabel({passed: false, passing_score: 70, best_percent: 40})).toMatch(/pass mark 70%/);
    expect(verdictLabel({passed: null, passing_score: null, best_percent: 60})).toBe("Well done");
    expect(verdictLabel({passed: null, passing_score: null, best_percent: 20})).toBe("Keep practising");
  });
});
