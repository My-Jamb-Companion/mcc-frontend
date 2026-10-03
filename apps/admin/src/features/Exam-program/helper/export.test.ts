import {describe, expect, it} from "vitest";
import {exportDaysFor, exportFileName, isHeaderOnlyCsv} from "./export";

describe("exportDaysFor", () => {
  it("maps the page's period filter to days", () => {
    expect(exportDaysFor("last 7 days")).toBe(7);
    expect(exportDaysFor("last month")).toBe(30);
    expect(exportDaysFor("last 3 months")).toBe(90);
  });
  it("falls back to a week for anything unknown", () => {
    expect(exportDaysFor("whenever")).toBe(7);
  });
});

describe("isHeaderOnlyCsv", () => {
  it("is true for a header and nothing else, however it ends", () => {
    expect(isHeaderOnlyCsv("Name,Email\r\n")).toBe(true);
    expect(isHeaderOnlyCsv("Name,Email")).toBe(true);
    expect(isHeaderOnlyCsv("")).toBe(true);
  });
  it("is false once there is a data row", () => {
    expect(isHeaderOnlyCsv("Name,Email\r\nAda,ada@example.com\r\n")).toBe(false);
  });
});

describe("exportFileName", () => {
  it("builds a safe name from the program title", () => {
    expect(exportFileName("JAMB - English", 30)).toBe("students-jamb-english-last-30-days.csv");
  });
  it("copes with a title that has no usable characters", () => {
    expect(exportFileName("???", 7)).toBe("students-program-last-7-days.csv");
  });
});
