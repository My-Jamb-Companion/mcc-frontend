import { describe, expect, it } from "vitest";
import sitemap from "./sitemap";
import robots from "./robots";

describe("sitemap and robots", () => {
  it("lists the public pages once each and none of the app hand-offs", () => {
    const urls = sitemap().map((e) => e.url);
    expect(new Set(urls).size).toBe(urls.length);
    for (const path of ["/about", "/contact", "/terms", "/privacy", "/refund"]) {
      expect(urls.some((u) => u.endsWith(path))).toBe(true);
    }
    expect(urls.some((u) => /\/(login|signup|go|preview|payment)/.test(u))).toBe(false);
  });
  it("points crawlers at the sitemap and away from the preview and hand-offs", () => {
    const r = robots();
    expect(String(r.sitemap)).toMatch(/\/sitemap\.xml$/);
    expect(JSON.stringify(r.rules)).toContain("/preview");
  });
});
