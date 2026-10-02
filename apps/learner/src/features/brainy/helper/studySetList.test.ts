import {describe, expect, it} from "vitest";
import {filterSets, sortSets, studiedLabel, type ListableSet} from "./studySetList";

const set = (title: string, subject: string | null, created: string, due: number): ListableSet =>
  ({title, subject, created_at: created, due_count: due});

const sets = [
  set("Cells", "Biology", "2026-09-01T00:00:00Z", 2),
  set("algebra", "Mathematics", "2026-09-20T00:00:00Z", 9),
  set("Atoms", "Chemistry", "2026-09-10T00:00:00Z", 9),
];

describe("filterSets", () => {
  it("returns everything for a blank query", () => expect(filterSets(sets, "  ")).toHaveLength(3));
  it("matches title or subject, ignoring case", () => {
    expect(filterSets(sets, "BIO").map((s) => s.title)).toEqual(["Cells"]);
    expect(filterSets(sets, "chem").map((s) => s.title)).toEqual(["Atoms"]);
  });
  it("returns nothing when nothing matches", () => expect(filterSets(sets, "zzz")).toEqual([]));
  it("copes with a missing subject", () => expect(filterSets([set("Loose", null, "2026-09-01T00:00:00Z", 0)], "loose")).toHaveLength(1));
});

describe("sortSets", () => {
  it("newest first", () => expect(sortSets(sets, "newest").map((s) => s.title)).toEqual(["algebra", "Atoms", "Cells"]));
  it("A-Z ignores case", () => expect(sortSets(sets, "az").map((s) => s.title)).toEqual(["algebra", "Atoms", "Cells"]));
  it("most due first, newest breaking ties", () => expect(sortSets(sets, "due").map((s) => s.title)).toEqual(["algebra", "Atoms", "Cells"]));
  it("does not mutate the input", () => {
    const before = sets.map((s) => s.title);
    sortSets(sets, "az");
    expect(sets.map((s) => s.title)).toEqual(before);
  });
});

describe("studiedLabel", () => {
  const now = new Date(2026, 9, 2, 15, 0);
  it("says so when never studied", () => {
    expect(studiedLabel(null, now)).toBe("Not studied yet");
    expect(studiedLabel(undefined, now)).toBe("Not studied yet");
  });
  it("uses calendar days, not 24-hour windows", () => {
    expect(studiedLabel(new Date(2026, 9, 2, 1, 0).toISOString(), now)).toBe("Studied today");
    expect(studiedLabel(new Date(2026, 9, 1, 23, 30).toISOString(), now)).toBe("Studied yesterday");
    expect(studiedLabel(new Date(2026, 8, 27, 10, 0).toISOString(), now)).toBe("Studied 5 days ago");
  });
  it("falls back to a date after a month", () => {
    expect(studiedLabel(new Date(2026, 7, 1).toISOString(), now)).toMatch(/^Studied Aug 1, 2026$/);
  });
});
