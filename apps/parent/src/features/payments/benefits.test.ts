import { describe, expect, it } from "vitest";
import { programBenefits, programFacts } from "./benefits";
import type { CatalogueFormat } from "./formats";

const offer = (over: Partial<CatalogueFormat> = {}): CatalogueFormat => ({
  format: "group", label: "Live group", seats: 5, tier_prices: [], live_sessions: 8, hours_per_session: "1.5", duration_weeks: 12, ...over,
});

describe("programFacts", () => {
  it("states weeks, live sessions, their length and the class size", () => {
    expect(programFacts(offer(), "group")).toEqual([
      { label: "Duration", value: "12 weeks" },
      { label: "Live sessions", value: "8", note: "1.5 hours each, 12 hours in all" },
      { label: "Class size", value: "Up to 5", note: "students with 1 Tutor" },
    ]);
  });

  it("shows no live sessions for self-paced, and leaves out weeks not yet entered", () => {
    const facts = programFacts(offer({ format: "self_paced", seats: 1, live_sessions: 0, duration_weeks: null }), "self_paced");
    expect(facts).toEqual([{ label: "Live sessions", value: "None", note: "Learns at their own pace" }]);
  });

  it("has nothing for a program with no priced format", () => {
    expect(programFacts(undefined, undefined)).toEqual([]);
  });
});

describe("programBenefits", () => {
  it("lists the unlimited benefits and the monthly report", () => {
    const list = programBenefits("exam", "self_paced");
    expect(list).toContain("Unlimited practice, Smart Zone and mock exams");
    expect(list).toContain("Unlimited study sets and flashcards");
    expect(list.some((b) => b.includes("monthly progress report"))).toBe(true);
  });

  it("adds live classes only for a live format; courses have no mock exams", () => {
    expect(programBenefits("course", "self_paced", offer()).some((b) => b.includes("live class"))).toBe(false);
    expect(programBenefits("course", "one_to_one", offer({ live_sessions: 1 }))).toContain("1 live class with a Tutor just for your child");
    expect(programBenefits("course", "self_paced").some((b) => b.includes("mock exams"))).toBe(false);
  });
});
