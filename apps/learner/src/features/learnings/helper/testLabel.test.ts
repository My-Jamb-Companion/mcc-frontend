import {describe, expect, it} from "vitest";
import {testLabel} from "./testLabel";

describe("testLabel", () => {
  it("shows an unnamed quiz set as just Test", () => {
    expect(testLabel("Quiz")).toBe("Test");
    expect(testLabel("")).toBe("Test");
  });

  it("shows a named one as Test: <name>", () => {
    expect(testLabel("Final")).toBe("Test: Final");
  });
});
