import {describe, expect, it} from "vitest";
import {filterByName, normalizeCatalogItem, toOptions, type CatalogItem} from "./catalog";

const item = (id: string, name: string, is_active = true): CatalogItem => ({id, name, is_active, program_count: 0});

describe("normalizeCatalogItem", () => {
  it("reads exam_id for exam types and subject_id for subjects", () => {
    expect(normalizeCatalogItem("types", {exam_id: "e1", name: "JAMB", is_active: true, program_count: 3})).toEqual({
      id: "e1", name: "JAMB", is_active: true, program_count: 3,
    });
    expect(normalizeCatalogItem("subjects", {subject_id: "s1", name: "Maths"}).id).toBe("s1");
  });
  it("defaults to active with zero programs", () => {
    const n = normalizeCatalogItem("subjects", {subject_id: "s1", name: "Maths"});
    expect(n.is_active).toBe(true);
    expect(n.program_count).toBe(0);
  });
  it("keeps an explicit inactive flag", () => {
    expect(normalizeCatalogItem("types", {exam_id: "e", name: "X", is_active: false}).is_active).toBe(false);
  });
});

describe("toOptions", () => {
  const items = [item("a", "JAMB"), item("b", "Old", false), item("c", "WAEC")];
  it("lists active items only", () => {
    expect(toOptions(items).map((o) => o.value)).toEqual(["a", "c"]);
  });
  it("keeps a deactivated item that is currently selected, labelled as inactive", () => {
    const options = toOptions(items, "b");
    expect(options.map((o) => o.value)).toEqual(["a", "b", "c"]);
    expect(options[1].label).toBe("Old (inactive)");
  });
  it("uses the id as the value", () => {
    expect(toOptions(items)[0]).toEqual({label: "JAMB", value: "a"});
  });
});

describe("filterByName", () => {
  const items = [item("a", "JAMB"), item("b", "Mathematics")];
  it("is case-insensitive and ignores surrounding spaces", () => {
    expect(filterByName(items, "  math ").map((i) => i.id)).toEqual(["b"]);
  });
  it("returns everything for a blank query", () => {
    expect(filterByName(items, " ")).toHaveLength(2);
  });
});
