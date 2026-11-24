import {describe, expect, it} from "vitest";
import {limitState, timeUntil} from "./dailyLimit";

const limit = (over: Partial<Parameters<typeof limitState>[0]> = {}) => ({
  restricted: true,
  unlocked_module_id: null,
  unlocked_course_id: null,
  unlocks_at: "2026-11-25T00:00:00+01:00",
  ...over,
});

describe("limitState", () => {
  it("is none for a learner the limit does not apply to", () => {
    expect(limitState(limit({restricted: false}), ["m1"])).toBe("none");
  });

  it("lets a learner choose until a module has been opened today", () => {
    expect(limitState(limit(), ["m1", "m2"])).toBe("choose");
  });

  it("tells today's module in this course from one in another course", () => {
    expect(limitState(limit({unlocked_module_id: "m2"}), ["m1", "m2"])).toBe("used-here");
    expect(limitState(limit({unlocked_module_id: "other"}), ["m1", "m2"])).toBe("used-elsewhere");
  });
});

describe("timeUntil", () => {
  const at = (iso: string) => Date.parse(iso);

  it("says hours and minutes, then minutes only", () => {
    expect(timeUntil("2026-11-25T00:00:00+01:00", at("2026-11-24T18:48:00+01:00"))).toBe("5 hr 12 min");
    expect(timeUntil("2026-11-25T00:00:00+01:00", at("2026-11-24T19:00:00+01:00"))).toBe("5 hr");
    expect(timeUntil("2026-11-25T00:00:00+01:00", at("2026-11-24T23:18:00+01:00"))).toBe("42 min");
  });

  it("never goes negative and copes with a missing time", () => {
    expect(timeUntil("2026-11-25T00:00:00+01:00", at("2026-11-25T00:05:00+01:00"))).toBe("less than a minute");
    expect(timeUntil(null)).toBe("tomorrow");
    expect(timeUntil("not a date")).toBe("tomorrow");
  });
});
