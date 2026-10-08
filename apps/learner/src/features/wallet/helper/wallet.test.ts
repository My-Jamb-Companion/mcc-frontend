import {describe, expect, it} from "vitest";
import {CONVERSIONS, courseGemCost, formatSigned, hasReceipt, parseGemAmount, planConversion} from "./wallet";

const custom = {min_gems: 1, max_gems: 5000};
const pointsToGems = CONVERSIONS[0];
const gemsToPoints = CONVERSIONS[2];

describe("planConversion", () => {
  it("converts whole units only and keeps the remainder", () => {
    expect(planConversion(pointsToGems, 40, 100)).toEqual({received: 2, spent: 30, unused: 10, problem: null});
  });
  it("is exact when converting gems up", () => {
    expect(planConversion(gemsToPoints, 3, 10)).toMatchObject({received: 45, spent: 3, unused: 0, problem: null});
  });
  it("says what is missing when too little is offered", () => {
    expect(planConversion(pointsToGems, 10, 100).problem).toMatch(/at least 15 points/);
  });
  it("refuses more than the balance", () => {
    expect(planConversion(pointsToGems, 30, 20).problem).toMatch(/only have 20 points/);
  });
  it("is quiet for empty or invalid input", () => {
    expect(planConversion(pointsToGems, NaN, 100).problem).toBeNull();
    expect(planConversion(pointsToGems, 0, 100).received).toBe(0);
  });
});

describe("parseGemAmount", () => {
  it("accepts a number within bounds", () => expect(parseGemAmount(" 25 ", custom)).toEqual({ok: true, gems: 25}));
  it("is not an error while empty", () => expect(parseGemAmount("", custom)).toEqual({ok: false, error: ""}));
  it("rejects non-numbers, zero and too many", () => {
    expect(parseGemAmount("2.5", custom)).toMatchObject({ok: false});
    expect(parseGemAmount("0", custom)).toMatchObject({ok: false, error: expect.stringMatching(/at least 1/)});
    expect(parseGemAmount("5001", custom)).toMatchObject({ok: false, error: expect.stringMatching(/at most 5,000/)});
  });
});

describe("small helpers", () => {
  it("rounds a course's gem cost up, like the server", () => {
    expect(courseGemCost(5000, 100)).toBe(50);
    expect(courseGemCost(5050, 100)).toBe(51);
    expect(courseGemCost(100, 0)).toBe(0);
  });
  it("signs amounts", () => {
    expect(formatSigned(10)).toBe("+10");
    expect(formatSigned(-5)).toBe("−5");
    expect(formatSigned(0)).toBe("0");
  });
  it("has receipts only for paid or refunded payments", () => {
    expect(hasReceipt("successful")).toBe(true);
    expect(hasReceipt("refunded")).toBe(true);
    expect(hasReceipt("pending")).toBe(false);
    expect(hasReceipt("failed")).toBe(false);
  });
});
