import {describe, expect, it} from "vitest";
import {skillsStats} from "./skillsStats";

describe("skillsStats", () => {
  it("counts in-progress and completed courses separately", () => {
    const stats = skillsStats(12, [
      {progress_percent: 40},
      {progress_percent: 100},
      {progress_percent: 80, completed_at: "2026-01-01T00:00:00Z"},
    ]);
    expect(stats.map((s) => s.value)).toEqual(["12", "1", "2"]);
  });

  it("is all zeros for a new student with an empty catalogue", () => {
    expect(skillsStats(0, []).map((s) => s.value)).toEqual(["0", "0", "0"]);
  });
});
