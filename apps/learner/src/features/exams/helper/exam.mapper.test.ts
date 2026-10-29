import {describe, expect, it} from "vitest";
import {fromApiEnrolledProgram, fromApiExamProgram} from "./exam.mapper";

describe("exam program cards", () => {
  it("carry the program's cover image, for a program on offer and an enrolled one", () => {
    expect(fromApiExamProgram({program_id: "p", exam_name: "JAMB", subject_name: "English", price: 100, level: "x", cover_image_url: "https://cdn/c.png", tier_prices: []}).imageUrl).toBe("https://cdn/c.png");
    expect(fromApiEnrolledProgram({program_id: "p", exam_name: "JAMB", subject_name: "English", progress_percent: 16, cover_image_url: "https://cdn/c.png"}).imageUrl).toBe("https://cdn/c.png");
  });

  it("have no image when the program has none", () => {
    expect(fromApiEnrolledProgram({program_id: "p", progress_percent: 0, cover_image_url: null}).imageUrl).toBeUndefined();
    expect(fromApiEnrolledProgram({program_id: "p", progress_percent: 0}).imageUrl).toBeUndefined();
  });
});
