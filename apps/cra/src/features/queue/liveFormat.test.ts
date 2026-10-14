import { describe, expect, it } from "vitest";
import { formatLabel, needsWeeklySlot, onboardingBlurb } from "./liveFormat";

describe("onboarding by live-teaching format", () => {
  it("asks for a weekly slot only for paid 1-to-1 and older paid purchases", () => {
    expect(needsWeeklySlot("one_to_one", true)).toBe(true);
    expect(needsWeeklySlot(null, true)).toBe(true);
    expect(needsWeeklySlot("self_paced", true)).toBe(false);
    expect(needsWeeklySlot("group", true)).toBe(false);
  });

  it("never asks for one on a free enrolment, even though its format is empty", () => {
    expect(needsWeeklySlot(null, false)).toBe(false);
    expect(needsWeeklySlot("one_to_one", false)).toBe(false);
  });

  it("treats a missing paid flag from an older backend as paid", () => {
    expect(needsWeeklySlot(null)).toBe(true);
    expect(formatLabel(null)).toBe("Live 1-to-1");
  });

  it("names the format, calling out a free enrolment", () => {
    expect(formatLabel("self_paced")).toBe("Self-paced");
    expect(formatLabel("group")).toBe("Live group");
    expect(formatLabel("one_to_one")).toBe("Live 1-to-1");
    expect(formatLabel(null, false)).toBe("Free enrolment");
  });

  it("tells the coordinator what completing means for each case", () => {
    expect(onboardingBlurb("one_to_one", "Ada")).toContain("weekly day and time");
    expect(onboardingBlurb("group", "Ada")).toContain("group class");
    expect(onboardingBlurb("self_paced", "Ada")).toContain("no weekly session");
    expect(onboardingBlurb(null, "Ada", false)).toContain("only for paid enrolments");
  });
});
