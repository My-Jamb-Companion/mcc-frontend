import {describe, expect, it} from "vitest";
import {nextStreak, showStreak, streakPitch, streakSparkles, streakText} from "./streak";
import {smartZoneLabel} from "./label";

describe("streak", () => {
  it("grows with each answer right first time and starts again after anything else", () => {
    expect(nextStreak(0, true)).toBe(1);
    expect(nextStreak(3, true)).toBe(4);
    expect(nextStreak(3, false)).toBe(0);
  });

  it("is shown from two in a row, with sparkles from three", () => {
    expect([1, 2, 3].map(showStreak)).toEqual([false, true, true]);
    expect([2, 3].map(streakSparkles)).toEqual([false, true]);
    expect(streakText(4)).toBe("4 in a row");
  });

  it("raises the chime a little with the streak, up to a limit", () => {
    expect(streakPitch(0)).toBe(1);
    expect(streakPitch(1)).toBe(1);
    expect(streakPitch(3)).toBeCloseTo(1.08);
    expect(streakPitch(50)).toBeCloseTo(1.24);
  });
});

describe("smartZoneLabel", () => {
  it("names an unnamed or default set just 'Smart Zone'", () => {
    expect(smartZoneLabel(undefined)).toBe("Smart Zone");
    expect(smartZoneLabel("")).toBe("Smart Zone");
    expect(smartZoneLabel("Exercise")).toBe("Smart Zone");
  });

  it("puts the set's own name after it", () => {
    expect(smartZoneLabel("Algebra drill")).toBe("Smart Zone: Algebra drill");
  });
});
