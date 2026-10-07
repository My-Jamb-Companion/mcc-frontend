import {describe, expect, it} from "vitest";
import {bandLabel, barWidth, changeStyle, signed} from "./surveyView";

const BANDS = ["Below 40%", "40-49%", "50-59%", "60-69%", "70-79%", "80-89%", "90-100%"].map((label, i) => ({value: String(i), label}));

describe("bandLabel", () => {
  it("names the band a mean rank is nearest to", () => {
    expect(bandLabel(1, BANDS)).toBe("Below 40%");
    expect(bandLabel(3.4, BANDS)).toBe("50-59%");
    expect(bandLabel(3.6, BANDS)).toBe("60-69%");
    expect(bandLabel(7, BANDS)).toBe("90-100%");
  });
  it("stays inside the scale and copes with no data", () => {
    expect(bandLabel(0.2, BANDS)).toBe("Below 40%");
    expect(bandLabel(9, BANDS)).toBe("90-100%");
    expect(bandLabel(null, BANDS)).toBe("—");
  });
});

describe("signed and changeStyle", () => {
  it("shows direction, and treats a rounding-level change as flat", () => {
    expect(signed(1.234)).toBe("+1.2");
    expect(signed(-0.44)).toBe("-0.4");
    expect(signed(0.01)).toBe("0");
    expect(signed(null)).toBe("—");
    expect(changeStyle(1)).toContain("emerald");
    expect(changeStyle(-1)).toContain("red");
    expect(changeStyle(0.01)).toContain("slate");
  });
});

describe("barWidth", () => {
  it("scales to the largest value and keeps a visible sliver for small non-zero ones", () => {
    expect(barWidth(5, 10)).toBe(50);
    expect(barWidth(10, 10)).toBe(100);
    expect(barWidth(0.01, 10)).toBe(2);
    expect(barWidth(0, 10)).toBe(0);
    expect(barWidth(3, 0)).toBe(0);
  });
});
