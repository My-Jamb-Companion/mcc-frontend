import {describe, expect, it} from "vitest";
import {formatTotalDuration} from "./useLesson";

describe("total video length", () => {
  it("shows hours and minutes, minutes, or seconds for very short totals", () => {
    expect(formatTotalDuration(3900)).toBe("1hr 5min");
    expect(formatTotalDuration(720)).toBe("12min");
    expect(formatTotalDuration(37)).toBe("37s");
    expect(formatTotalDuration(0)).toBe("0min");
  });
});
