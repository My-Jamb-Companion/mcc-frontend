import { describe, expect, it } from "vitest";
import { formatLabel, needsWeeklySlot, onboardingBlurb } from "./liveFormat";

describe("onboarding by live-teaching format", () => {
  it("asks for a weekly slot only for 1-to-1 and older purchases", () => {
    expect(needsWeeklySlot("one_to_one")).toBe(true);
    expect(needsWeeklySlot(null)).toBe(true);
    expect(needsWeeklySlot("self_paced")).toBe(false);
    expect(needsWeeklySlot("group")).toBe(false);
  });

  it("names the format, treating older purchases as 1-to-1", () => {
    expect(formatLabel("self_paced")).toBe("Self-paced");
    expect(formatLabel("group")).toBe("Live group");
    expect(formatLabel("one_to_one")).toBe("Live 1-to-1");
    expect(formatLabel(null)).toBe("Live 1-to-1");
  });

  it("tells the coordinator what completing means for each format", () => {
    expect(onboardingBlurb("one_to_one", "Ada")).toContain("weekly day and time");
    expect(onboardingBlurb("group", "Ada")).toContain("group class");
    expect(onboardingBlurb("self_paced", "Ada")).toContain("no weekly session");
  });
});
