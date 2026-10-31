import {describe, expect, it} from "vitest";
import {programBenefits, programFacts} from "./programBenefits";
import type {ApiFormatOffer} from "./liveFormats";

const offer = (over: Partial<ApiFormatOffer> = {}): ApiFormatOffer => ({
  format: "group", label: "Live group", seats: 5, tier_prices: [], live_sessions: 8, hours_per_session: "1.5", duration_weeks: 12, ...over,
});

describe("programFacts", () => {
  it("states weeks, live sessions, their length and the class size for a live group", () => {
    expect(programFacts(offer(), "group")).toEqual([
      {label: "Duration", value: "12 weeks"},
      {label: "Live sessions", value: "8", note: "1.5 hours each, 12 hours in all"},
      {label: "Class size", value: "Up to 5", note: "students with 1 Tutor"},
    ]);
  });

  it("says one-to-one is just the student", () => {
    const facts = programFacts(offer({format: "one_to_one", seats: 1, hours_per_session: 1}), "one_to_one");
    expect(facts.find((f) => f.label === "Class size")).toMatchObject({value: "Just you"});
    expect(facts.find((f) => f.label === "Live sessions")?.note).toBe("1 hour each, 8 hours in all");
  });

  it("shows no live sessions for self-paced, still with the weeks", () => {
    const facts = programFacts(offer({format: "self_paced", seats: 1, live_sessions: 0}), "self_paced");
    expect(facts).toEqual([
      {label: "Duration", value: "12 weeks"},
      {label: "Live sessions", value: "None", note: "Learn at your own pace"},
    ]);
  });

  it("leaves out weeks the admin has not entered, and singular weeks read right", () => {
    expect(programFacts(offer({duration_weeks: null}), "group").some((f) => f.label === "Duration")).toBe(false);
    expect(programFacts(offer({duration_weeks: 1}), "group")[0].value).toBe("1 week");
  });

  it("has nothing to say for a program with no priced format", () => {
    expect(programFacts(undefined, null)).toEqual([]);
  });
});

describe("programBenefits", () => {
  it("lists the unlimited benefits for an exam program, including mock exams and Smart Zone", () => {
    const list = programBenefits("exam", "self_paced");
    expect(list).toContain("Unlimited practice, Smart Zone and mock exams");
    expect(list).toContain("Unlimited study sets and flashcards");
    expect(list.some((b) => b.startsWith("Unlimited access"))).toBe(true);
    expect(list.some((b) => b.includes("Brainy"))).toBe(true);
  });

  it("does not promise mock exams on a course, but does offer the Tutor and notes", () => {
    const list = programBenefits("course", "self_paced");
    expect(list.some((b) => b.includes("mock exams"))).toBe(false);
    expect(list.some((b) => b.includes("Ask your Tutor"))).toBe(true);
  });

  it("adds the live classes only for a live format", () => {
    expect(programBenefits("course", "self_paced", offer()).some((b) => b.includes("live class"))).toBe(false);
    expect(programBenefits("course", "group", offer())).toContain("8 live classes with your Tutor and up to 4 other students");
    expect(programBenefits("exam", "one_to_one", offer({live_sessions: 1}))).toContain("1 live class with a Tutor just for you");
  });
});
