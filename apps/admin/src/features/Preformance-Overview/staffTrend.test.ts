import { describe, expect, it } from "vitest";
import { compactCount, trend } from "./staffTrend";

describe("trend", () => {
  it("compares with the previous period", () => {
    expect(trend(15, 10)).toEqual({ label: "50.0%", isPositive: true });
    expect(trend(5, 10)).toEqual({ label: "50.0%", isPositive: false });
    expect(trend(10, 10)).toEqual({ label: "0.0%", isPositive: true });
  });
  it("says New when there was nothing before, and nothing when both are zero", () => {
    expect(trend(3, 0)).toEqual({ label: "New", isPositive: true });
    expect(trend(0, 0)).toBeNull();
  });
  it("shortens big counts", () => {
    expect(compactCount(240)).toBe("240");
    expect(compactCount(12_500)).toBe("12.5k");
  });
});
