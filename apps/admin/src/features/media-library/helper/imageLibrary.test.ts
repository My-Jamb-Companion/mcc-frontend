import {describe, expect, it} from "vitest";
import {allImages, formatSize, formatUploaded, nextOffset} from "./imageLibrary";
import type {ImageLibraryPage, LibraryImage} from "../services/imageLibrary.service";

const img = (n: number): LibraryImage => ({url: `https://cdn/${n}.png`, name: `${n}.png`, size_bytes: 1, uploaded_at: "2026-10-29T10:00:00+00:00"});
const page = (items: LibraryImage[], offset: number, total: number): ImageLibraryPage => ({items, offset, total, limit: 2});

describe("formatSize", () => {
  it("uses bytes, KB and MB", () => {
    expect(formatSize(12)).toBe("12 B");
    expect(formatSize(340 * 1024)).toBe("340 KB");
    expect(formatSize(2 * 1024 * 1024)).toBe("2.0 MB");
  });
});

describe("formatUploaded", () => {
  it("writes a short date, and nothing for one it can't read", () => {
    expect(formatUploaded("2026-10-29T10:00:00+00:00")).toContain("2026");
    expect(formatUploaded("not a date")).toBe("");
  });
});

describe("paging", () => {
  it("joins the pages, each image once", () => {
    expect(allImages([page([img(1), img(2)], 0, 3), page([img(2), img(3)], 2, 3)]).map((i) => i.name)).toEqual(["1.png", "2.png", "3.png"]);
  });
  it("asks for the next page until everything is loaded", () => {
    expect(nextOffset([page([img(1), img(2)], 0, 3)])).toBe(2);
    expect(nextOffset([page([img(1), img(2)], 0, 3), page([img(3)], 2, 3)])).toBeUndefined();
    expect(nextOffset([page([], 0, 0)])).toBeUndefined();
    expect(nextOffset([])).toBeUndefined();
  });
});
