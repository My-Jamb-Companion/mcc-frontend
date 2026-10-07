import {describe, expect, it} from "vitest";
import {bugFormErrors, startingPage} from "./bugForm";

const ok = {description: "The quiz button does nothing", page_url: "https://x.app/quiz", urgency: "urgent" as const};

describe("bugFormErrors", () => {
  it("accepts a complete report, with or without a screenshot", () => {
    expect(bugFormErrors(ok)).toEqual({});
    expect(bugFormErrors(ok, {name: "a.png", type: "image/png", size: 1000})).toEqual({});
  });

  it("lists every missing required field at once", () => {
    expect(Object.keys(bugFormErrors({description: "  ", page_url: "", urgency: ""})).sort()).toEqual(["description", "page_url", "urgency"]);
  });

  it("limits the description", () => {
    expect(bugFormErrors({...ok, description: "bad"}).description).toBeTruthy();
    expect(bugFormErrors({...ok, description: "x".repeat(4001)}).description).toMatch(/under 4000/);
  });

  it("only takes small images as screenshots", () => {
    expect(bugFormErrors(ok, {name: "n.txt", type: "text/plain", size: 10}).screenshot).toMatch(/PNG/);
    expect(bugFormErrors(ok, {name: "big.png", type: "image/png", size: 6 * 1024 * 1024}).screenshot).toMatch(/5 MB/);
  });
});

describe("startingPage", () => {
  const site = "https://app.example.com";
  it("starts from the page the menu was opened on", () => {
    expect(startingPage("/learnings/course/1?tab=notes", site)).toBe("https://app.example.com/learnings/course/1?tab=notes");
    expect(startingPage("https://app.example.com/dashboard", site)).toBe("https://app.example.com/dashboard");
  });
  it("ignores another site's link and an empty value, leaving the field for the student", () => {
    expect(startingPage("https://evil.example.org/phish", site)).toBe("");
    expect(startingPage("javascript:alert(1)", site)).toBe("");
    expect(startingPage(null, site)).toBe("");
  });
});
