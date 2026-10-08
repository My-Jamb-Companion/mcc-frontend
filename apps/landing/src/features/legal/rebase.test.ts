import { describe, expect, it } from "vitest";
import { rebaseSite } from "./rebase";
import { legalFallbackHref } from "./documents";

describe("rebaseSite", () => {
  it("points section anchors back at the home page and leaves other links alone", () => {
    const site = rebaseSite({
      nav_links: [{ label: "Exam prep", href: "#exams" }, { label: "Teach", href: "/go/teacher/signup" }],
      parent_href: "#parents",
      footer_columns: [{ title: "LEARN", links: [{ label: "Brainy", href: "#brainy" }, { label: "Terms", href: "/terms" }] }],
    });
    expect(site.nav_links).toEqual([{ label: "Exam prep", href: "/#exams" }, { label: "Teach", href: "/go/teacher/signup" }]);
    expect(site.parent_href).toBe("/#parents");
    expect((site.footer_columns as { links: unknown[] }[])[0].links).toEqual([{ label: "Brainy", href: "/#brainy" }, { label: "Terms", href: "/terms" }]);
  });

  it("copes with a site that has no menus", () => {
    expect(rebaseSite({ brand_name: "MCC" })).toMatchObject({ brand_name: "MCC", nav_links: [], footer_columns: [] });
  });
});

describe("legalFallbackHref", () => {
  it("finds the page for a legal link left blank in the footer", () => {
    expect(legalFallbackHref("Terms")).toBe("/terms");
    expect(legalFallbackHref("Terms of Use")).toBe("/terms");
    expect(legalFallbackHref("Privacy")).toBe("/privacy");
    expect(legalFallbackHref("Refund policy")).toBe("/refund");
  });
  it("leaves other links alone", () => {
    expect(legalFallbackHref("About")).toBe("");
  });
});
