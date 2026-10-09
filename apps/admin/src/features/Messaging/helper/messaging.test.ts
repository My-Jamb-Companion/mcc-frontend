// @vitest-environment jsdom
import {describe, expect, it} from "vitest";
import {displayName, htmlToText, listTime, previewLine} from "./messaging";

describe("htmlToText", () => {
  it("turns a template's rich text into plain text", () => {
    expect(htmlToText("<p>Hi <strong>Sam</strong>,</p><p>See you &amp; Tia.</p>")).toBe("Hi Sam,\nSee you & Tia.");
    expect(htmlToText("<ul><li>One</li><li>Two</li></ul>")).toBe("- One\n- Two");
    expect(htmlToText("Line one<br>Line two")).toBe("Line one\nLine two");
  });
  it("never keeps markup, and leaves plain text alone", () => {
    expect(htmlToText("<img src=x onerror=alert(1)>Hello")).toBe("Hello");
    expect(htmlToText("a < b and c > d")).toBe("a < b and c > d");
  });
});

describe("conversation labels", () => {
  it("falls back to the email when there is no name", () => {
    expect(displayName({full_name: "Sam", email: "s@x.com"})).toBe("Sam");
    expect(displayName({full_name: "  ", email: "s@x.com"})).toBe("s@x.com");
    expect(displayName({full_name: null, email: "s@x.com"})).toBe("s@x.com");
  });
  it("shows what was said last, and who said it", () => {
    expect(previewLine({last_direction: "outbound", last_body: "Welcome"})).toBe("You: Welcome");
    expect(previewLine({last_direction: "inbound", last_body: "Thanks"})).toBe("Thanks");
  });
  it("shortens times for a list", () => {
    const now = new Date("2026-10-09T15:00:00");
    expect(listTime("2026-10-09T09:05:00", now)).toMatch(/9:05/);
    expect(listTime("2026-10-08T23:00:00", now)).toBe("Yesterday");
    expect(listTime("2026-09-30T10:00:00", now)).toBe("Sep 30");
    expect(listTime("2025-12-30T10:00:00", now)).toBe("Dec 30, 2025");
  });
});
