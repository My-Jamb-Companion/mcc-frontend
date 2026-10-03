import {describe, expect, it} from "vitest";
import {fromApiExamProgramSummary} from "./list.mapper";
import type {ApiExamProgramSummary} from "../services/exam.service";

const api = (over: Partial<ApiExamProgramSummary> = {}): ApiExamProgramSummary => ({
  program_id: "p1",
  exam_name: "JAMB",
  subject_name: "English",
  category_name: "Languages",
  teacher_name: "Ada",
  level: "all",
  price: "0.00",
  rating: "0.0",
  status: "published",
  created_at: "2026-01-01",
  ...over,
});

describe("fromApiExamProgramSummary thumbnail", () => {
  it("uses the program's cover image as the list thumbnail", () => {
    expect(fromApiExamProgramSummary(api({cover_image_url: "https://x/c.jpg"})).logoUrl).toBe("https://x/c.jpg");
  });

  it("leaves it out when there is no cover image, so the row shows its placeholder", () => {
    expect(fromApiExamProgramSummary(api({cover_image_url: null})).logoUrl).toBeUndefined();
    expect(fromApiExamProgramSummary(api()).logoUrl).toBeUndefined();
  });
});
