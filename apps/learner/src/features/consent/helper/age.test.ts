import {describe, expect, it} from "vitest";
import {ageFromDob, isPlausibleDob, isUnder18, todayIso} from "./age";

const today = new Date(2026, 9, 14); // 14 Oct 2026

describe("age from date of birth", () => {
  it("counts whole years and turns over on the birthday", () => {
    expect(ageFromDob("2008-10-14", today)).toBe(18);
    expect(ageFromDob("2008-10-15", today)).toBe(17);
    expect(ageFromDob("2000-01-01", today)).toBe(26);
  });

  it("rejects text that isn't a real date", () => {
    expect(ageFromDob("", today)).toBeNull();
    expect(ageFromDob("2026-02-30", today)).toBeNull();
    expect(ageFromDob("14/10/2008", today)).toBeNull();
  });

  it("treats under 18 as a child and 18 as an adult", () => {
    expect(isUnder18("2008-10-15", today)).toBe(true);
    expect(isUnder18("2008-10-14", today)).toBe(false);
    expect(isUnder18("", today)).toBe(false);
  });

  it("refuses a future or implausible date", () => {
    expect(isPlausibleDob("2027-01-01", today)).toBe(false);
    expect(isPlausibleDob("1900-01-01", today)).toBe(false);
    expect(isPlausibleDob("2010-05-05", today)).toBe(true);
  });

  it("formats today for a date input's max", () => {
    expect(todayIso(today)).toBe("2026-10-14");
  });
});
