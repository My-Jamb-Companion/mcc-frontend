import { describe, it, expect, vi } from "vitest";
import { getCourses, getPrograms } from "./catalogue.service";

const mockGet = vi.fn();
vi.mock("@mcc/api", () => ({
  apiClient: { get: (...args: unknown[]) => mockGet(...args) },
}));

describe("getCourses", () => {
  it("calls GET /courses/ and unwraps data.courses", async () => {
    mockGet.mockResolvedValue({ data: { success: true, data: { courses: [{ course_id: "c1", price: "1000.00" }] } } });
    const result = await getCourses();
    expect(mockGet).toHaveBeenCalledWith("/courses/");
    expect(result).toEqual([{ course_id: "c1", price: 1000 }]);
  });

  it("coerces the backend's string-encoded Decimal price into a real number", async () => {
    // pydantic v2's default JSON encoding serializes Decimal as a string
    // ("7500.00"), not a number -- "7500.00".toLocaleString() silently
    // no-ops (strings have their own, different toLocaleString) rather than
    // formatting as a price, so this coercion is load-bearing, not cosmetic.
    mockGet.mockResolvedValue({ data: { success: true, data: { courses: [{ course_id: "c1", price: "7500.00" }] } } });
    const result = await getCourses();
    expect(result[0].price).toBe(7500);
    expect(typeof result[0].price).toBe("number");
  });
});

describe("getPrograms", () => {
  it("calls GET /exams/programs and unwraps data.programs", async () => {
    mockGet.mockResolvedValue({ data: { success: true, data: { programs: [{ program_id: "p1", price: "3000.00" }] } } });
    const result = await getPrograms();
    expect(mockGet).toHaveBeenCalledWith("/exams/programs");
    expect(result).toEqual([{ program_id: "p1", price: 3000 }]);
  });
});
