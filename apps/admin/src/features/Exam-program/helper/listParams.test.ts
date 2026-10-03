import {describe, expect, it} from "vitest";
import {PAGE_SIZE, resultsLabel, toListParams} from "./listParams";

describe("toListParams", () => {
  it("maps the Published tab to published and Drafts to draft", () => {
    expect(toListParams({tab: "published", search: "", page: 1}).status).toBe("published");
    expect(toListParams({tab: "drafts", search: "", page: 1}).status).toBe("draft");
  });
  it("sends page and the fixed page size", () => {
    expect(toListParams({tab: "drafts", search: "", page: 3})).toMatchObject({page: 3, limit: PAGE_SIZE});
  });
  it("omits search and teacher when empty, and trims search", () => {
    const p = toListParams({tab: "published", search: "  ", page: 1});
    expect(p).not.toHaveProperty("search");
    expect(p).not.toHaveProperty("teacher_id");
    expect(toListParams({tab: "published", search: " eng ", teacherId: "t1", page: 1})).toMatchObject({
      search: "eng",
      teacher_id: "t1",
    });
  });
});

describe("resultsLabel", () => {
  it("handles none, one and many", () => {
    expect(resultsLabel(undefined)).toBe("No results");
    expect(resultsLabel({page: 1, per_page: 15, total: 0})).toBe("No results");
    expect(resultsLabel({page: 1, per_page: 15, total: 1})).toBe("1 result");
    expect(resultsLabel({page: 1, per_page: 15, total: 42})).toBe("1–15 of 42 results");
  });
  it("clamps the last page's range to the total", () => {
    expect(resultsLabel({page: 3, per_page: 15, total: 42})).toBe("31–42 of 42 results");
  });
});
