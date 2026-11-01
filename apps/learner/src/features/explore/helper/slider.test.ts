import {describe, expect, it} from "vitest";
import {isExternalLink, nextSlide, prevSlide, slideAt} from "./slider";

describe("slider helpers", () => {
  it("tells a link out of the app from one inside it", () => {
    expect(isExternalLink("https://example.com/x")).toBe(true);
    expect(isExternalLink("http://localhost:3000")).toBe(true);
    expect(isExternalLink("/learnings/course/abc")).toBe(false);
  });

  it("finds the slide the track is on, however it was moved", () => {
    expect(slideAt(0, 500, 3)).toBe(0);
    expect(slideAt(260, 500, 3)).toBe(1);
    expect(slideAt(240, 500, 3)).toBe(0);
    expect(slideAt(5000, 500, 3)).toBe(2);
    expect(slideAt(-10, 500, 3)).toBe(0);
    expect(slideAt(100, 0, 3)).toBe(0);
    expect(slideAt(100, 500, 0)).toBe(0);
  });

  it("wraps round at both ends", () => {
    expect(nextSlide(2, 3)).toBe(0);
    expect(nextSlide(0, 3)).toBe(1);
    expect(prevSlide(0, 3)).toBe(2);
    expect(prevSlide(2, 3)).toBe(1);
    expect(nextSlide(0, 0)).toBe(0);
  });
});
