import {describe, expect, it} from "vitest";
import {isClosed, prettyPage, reporterLabel, safeLink} from "./bugStatus";

describe("prettyPage", () => {
  it("shows the path and query of a link, not the whole address", () => {
    expect(prettyPage("https://mcc-frontend-learner.vercel.app/learnings/course/c1?tab=overview")).toBe("/learnings/course/c1?tab=overview");
  });
  it("shows the host for a home page link and passes through plain text", () => {
    expect(prettyPage("https://example.com/")).toBe("example.com");
    expect(prettyPage("the quiz page")).toBe("the quiz page");
  });
});

describe("safeLink", () => {
  it("only offers http(s) links, so a reporter can't plant a script link", () => {
    expect(safeLink("https://example.com/a")).toBe("https://example.com/a");
    expect(safeLink("javascript:alert(1)")).toBeNull();
    expect(safeLink("data:text/html,hi")).toBeNull();
    expect(safeLink("not a link")).toBeNull();
  });
});

describe("reporterLabel", () => {
  it("prefers name, then email, then a placeholder", () => {
    expect(reporterLabel({reporter_name: " Ada ", reporter_email: "a@x.com"})).toBe("Ada");
    expect(reporterLabel({reporter_name: "", reporter_email: "a@x.com"})).toBe("a@x.com");
    expect(reporterLabel({reporter_name: null, reporter_email: null})).toBe("Deleted account");
  });
});

describe("isClosed", () => {
  it("treats resolved and won't-fix as closed", () => {
    expect([isClosed("open"), isClosed("in_progress"), isClosed("resolved"), isClosed("wont_fix")]).toEqual([false, false, true, true]);
  });
});
