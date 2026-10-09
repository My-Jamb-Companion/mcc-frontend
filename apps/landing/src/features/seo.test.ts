import { describe, expect, it } from "vitest";
import { absoluteUrl, pageMetadata } from "./seo";

describe("seo", () => {
  it("builds absolute addresses without a doubled slash", () => {
    expect(absoluteUrl("/")).not.toMatch(/\/$/);
    expect(absoluteUrl("/about")).toMatch(/^https?:\/\/[^/]+\/about$/);
  });
  it("uses the page's own path as canonical and repeats the text on sharing cards", () => {
    const m = pageMetadata({ title: "About us", description: "d", path: "/about" });
    expect(m.alternates?.canonical).toBe("/about");
    expect(m.openGraph).toMatchObject({ title: "About us", description: "d", url: "/about" });
    expect(m.twitter).toMatchObject({ card: "summary", title: "About us" });
  });
  it("asks for a large card only when there is an image", () => {
    expect(pageMetadata({ title: "t", description: "d", path: "/", image: "https://x/y.png" }).twitter).toMatchObject({ card: "summary_large_image" });
  });
});
