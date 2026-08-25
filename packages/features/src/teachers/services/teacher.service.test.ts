import { describe, it, expect, vi, beforeEach } from "vitest";
import { apiClient } from "@mcc/api";
import { getTeachersApi } from "./teacher.service";

vi.mock("@mcc/api", () => ({
  apiClient: {
    get: vi.fn(),
  },
}));

const mockGet = vi.mocked(apiClient.get);

beforeEach(() => {
  vi.clearAllMocks();
});

describe("getTeachersApi", () => {
  const mockTeachers = [
    {
      teacher_id: "9ee758d3-73ad-40ad-987c-dc73c1a5ecd7",
      teacher_name: "mayowa",
      email: "ayotest01@gmail.com",
      subject: "new teacher",
    },
  ];

  it("calls GET /admin/teachers with query params", async () => {
    mockGet.mockResolvedValueOnce({
      data: {
        success: true,
        data: { items: mockTeachers, page: 1, limit: 50, total: 1 },
      },
    });

    const params = { search: "mayowa", page: 1, limit: 50 };
    await getTeachersApi(params);

    expect(mockGet).toHaveBeenCalledWith("/admin/teachers", { params });
  });

  it("extracts teachers array from enveloped pagination response { data: { items: [...] } }", async () => {
    mockGet.mockResolvedValueOnce({
      data: {
        success: true,
        message: "Teachers list retrieved",
        data: {
          items: mockTeachers,
          limit: 50,
          page: 1,
          total: 1,
          total_pages: 1,
        },
      },
    });

    const teachers = await getTeachersApi();
    expect(teachers).toEqual(mockTeachers);
    expect(teachers[0].teacher_name).toBe("mayowa");
    expect(teachers[0].teacher_id).toBe("9ee758d3-73ad-40ad-987c-dc73c1a5ecd7");
  });

  it("returns array directly if server sends raw array response", async () => {
    mockGet.mockResolvedValueOnce({
      data: mockTeachers,
    });

    const teachers = await getTeachersApi();
    expect(teachers).toEqual(mockTeachers);
  });

  it("handles empty or unexpected response format gracefully", async () => {
    mockGet.mockResolvedValueOnce({
      data: null,
    });

    const teachers = await getTeachersApi();
    expect(teachers).toEqual([]);
  });
});
