import {describe, expect, it} from "vitest";
import {describeDuration, formatCountdown, isCountdownLow, secondsLeft} from "./countdown";

describe("formatCountdown", () => {
  it("shows minutes and zero-padded seconds", () => {
    expect(formatCountdown(725)).toBe("12:05");
    expect(formatCountdown(59)).toBe("0:59");
    expect(formatCountdown(0)).toBe("0:00");
  });
  it("rounds a part-second up and never goes negative", () => {
    expect(formatCountdown(59.2)).toBe("1:00");
    expect(formatCountdown(-4)).toBe("0:00");
  });
});

describe("isCountdownLow", () => {
  it("flags the last minute", () => {
    expect(isCountdownLow(61)).toBe(false);
    expect(isCountdownLow(60)).toBe(true);
    expect(isCountdownLow(0)).toBe(true);
  });
});

describe("secondsLeft", () => {
  it("counts down from a deadline and stops at zero", () => {
    expect(secondsLeft(10_000, 4_000)).toBe(6);
    expect(secondsLeft(10_000, 9_001)).toBe(1);
    expect(secondsLeft(10_000, 12_000)).toBe(0);
  });
});

describe("describeDuration", () => {
  it("reads naturally", () => {
    expect(describeDuration(20)).toBe("20 min");
    expect(describeDuration(60)).toBe("1 hr");
    expect(describeDuration(90)).toBe("1 hr 30 min");
  });
});
