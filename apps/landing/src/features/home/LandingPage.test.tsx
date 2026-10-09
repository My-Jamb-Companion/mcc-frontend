import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { defaultContent, normalizeContent } from "@mcc/landing-content";
import { LandingPage } from "./LandingPage";

afterEach(cleanup);

describe("LandingPage", () => {
  it("draws the built-in design with its sections in order, and hides the ones with nothing to say yet", () => {
    const { container } = render(<LandingPage content={defaultContent()} />);
    const ids = Array.from(container.querySelectorAll("main > section")).map((s) => s.id);
    expect(ids).toEqual(["top", "exams", "how", "brainy", "practice", "teachers", "parents", "faq", "start"]);
    expect(screen.getByRole("heading", { level: 1 }).textContent).toContain("Walk into your exam");
  });

  it("follows the content: a hidden block is skipped, an unknown one is ignored, order is kept", () => {
    const page = normalizeContent({
      site: { brand_name: "Learnly" },
      blocks: [
        { id: "b1", type: "faq", visible: true, data: { headline: "Ask away", items: [{ q: "Why?", a: "Because." }] } },
        { id: "b2", type: "hero", visible: false, data: { headline_lead: "Hidden hero" } },
        { id: "b3", type: "from_a_newer_editor", visible: true, data: {} },
        { id: "b4", type: "cta", visible: true, data: { headline: "Join now", cta_label: "Go", cta_href: "/signup" } },
      ],
    });
    const { container } = render(<LandingPage content={page} />);
    expect(Array.from(container.querySelectorAll("main > section")).map((s) => s.id)).toEqual(["faq", "start"]);
    expect(screen.queryByText("Hidden hero")).toBeNull();
    expect(screen.getAllByText("Learnly").length).toBeGreaterThan(0);
    expect(container.querySelector('[data-block-id="b1"]')).not.toBeNull();
  });

  it("never links to something that could run script", () => {
    const page = normalizeContent({
      blocks: [{ id: "b", type: "cta", visible: true, data: { headline: "Hi", cta_label: "Go", cta_href: "javascript:alert(1)" } }],
    });
    const { container } = render(<LandingPage content={page} />);
    const hrefs = Array.from(container.querySelectorAll("a")).map((a) => a.getAttribute("href") ?? "");
    expect(hrefs.every((h) => !h.toLowerCase().startsWith("javascript:"))).toBe(true);
  });

  it("shows footer links without an address as plain text, and only socials that have one", () => {
    const page = normalizeContent({
      site: { socials: [{ label: "Instagram", href: "https://instagram.com/x" }, { label: "TikTok", href: "" }] },
      blocks: [],
    });
    const { container } = render(<LandingPage content={page} />);
    expect(screen.queryByText("TikTok")).toBeNull();
    expect(screen.getByText("Instagram").closest("a")?.getAttribute("href")).toBe("https://instagram.com/x");
    // "Help centre" has no page yet: plain text, not a dead link.
    expect(container.querySelector("footer")?.textContent).toContain("Help centre");
    expect(Array.from(container.querySelectorAll("footer a")).some((a) => a.textContent === "Help centre")).toBe(false);
  });

  it("links a blank About and Contact footer entry to their pages", () => {
    const page = normalizeContent({
      site: { footer_columns: [{ title: "COMPANY", links: [{ label: "About", href: "" }, { label: "Contact", href: "" }] }] },
      blocks: [],
    });
    const { container } = render(<LandingPage content={page} />);
    const hrefOf = (label: string) =>
      Array.from(container.querySelectorAll("footer a")).find((a) => a.textContent === label)?.getAttribute("href");
    expect(hrefOf("About")).toBe("/about");
    expect(hrefOf("Contact")).toBe("/contact");
  });

  it("links the legal footer entries to their pages, even when published content left them blank", () => {
    const page = normalizeContent({
      site: { footer_columns: [{ title: "LEGAL", links: [{ label: "Terms", href: "" }, { label: "Privacy", href: "" }, { label: "Refund policy", href: "" }] }] },
      blocks: [],
    });
    const { container } = render(<LandingPage content={page} />);
    const hrefOf = (label: string) =>
      Array.from(container.querySelectorAll("footer a")).find((a) => a.textContent === label)?.getAttribute("href");
    expect(hrefOf("Terms")).toBe("/terms");
    expect(hrefOf("Privacy")).toBe("/privacy");
    expect(hrefOf("Refund policy")).toBe("/refund");
  });
});
