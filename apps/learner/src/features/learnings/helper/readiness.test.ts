import {describe, expect, it} from "vitest";
import {confidenceNote, leveledUpText, predictedRange, tileSummary} from "./readiness";

const predicted = {available: true, low: 62, high: 71, confidence: "medium" as const, answered: 40, needed: 15, message: null};

describe("predictedRange", () => {
  it("writes a range", () => {
    expect(predictedRange(predicted)).toBe("62% – 71%");
  });

  it("writes one number when the range has closed", () => {
    expect(predictedRange({...predicted, low: 80, high: 80})).toBe("80%");
  });

  it("is null before there is enough to say", () => {
    expect(predictedRange({...predicted, available: false, low: null, high: null})).toBeNull();
  });
});

describe("confidenceNote", () => {
  it("says when mock exams are behind the estimate", () => {
    expect(confidenceNote({...predicted, mocks: 1})).toMatch(/Leans on your latest mock exam\./);
    expect(confidenceNote({...predicted, mocks: 3})).toMatch(/Leans on your latest 3 mock exams\./);
    expect(confidenceNote({...predicted, mocks: 0})).not.toMatch(/mock/);
  });

  it("explains how much to trust it, and says nothing without one", () => {
    expect(confidenceNote({...predicted, confidence: "low"})).toMatch(/Early estimate/);
    expect(confidenceNote({...predicted, confidence: "high"})).toMatch(/solid/);
    expect(confidenceNote({...predicted, confidence: null})).toBeNull();
  });
});

describe("tileSummary and leveledUpText", () => {
  it("describes a tile", () => {
    expect(tileSummary({node_type: "module", node_id: "m", title: "Algebra", level: "familiar", score: 0.5, answered: 3, total: 7}))
      .toBe("Algebra: Familiar (3 of 7 questions played)");
  });

  it("counts topics levelled up", () => {
    expect(leveledUpText(0)).toBeNull();
    expect(leveledUpText(1)).toBe("Leveled up on 1 topic");
    expect(leveledUpText(3)).toBe("Leveled up on 3 topics");
  });
});
