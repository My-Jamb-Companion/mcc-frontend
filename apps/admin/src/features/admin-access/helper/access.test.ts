import {describe, expect, it} from "vitest";
import {
  areaForPath,
  canManage,
  canOpen,
  canView,
  firstAllowedHref,
  hasValidAccess,
  MyAccess,
  PresetLike,
  permissionsForPreset,
  presetFor,
  sameAreas,
  summarizeAccess,
  toApiPermissions,
} from "./access";

const access = (permissions: MyAccess["permissions"], over: Partial<MyAccess> = {}): MyAccess => ({
  user_id: "u",
  level: "limited",
  is_super: false,
  preset: "custom",
  preset_label: "Custom access",
  permissions,
  ...over,
});
const superAdmin = access({}, {level: "super", is_super: true});

const PRESETS: PresetLike[] = [
  {key: "super_admin", is_super: true, permissions: {}},
  {key: "course_developer", is_super: false, permissions: {courses: "manage", exams: "manage", teachers: "view"}},
  {key: "read_only", is_super: false, permissions: {courses: "view", exams: "view"}},
];

describe("areaForPath", () => {
  it.each([
    ["/dashboard/courses", "courses"],
    ["/dashboard/courses/edit-course", "courses"],
    ["/dashboard/exam-program/catalog", "exams"],
    ["/dashboard/categories", "courses"],
    ["/dashboard/question-bank", "question_bank"],
    ["/dashboard/students/active-students", "students"],
    ["/finance", "finance"],
    ["/finance/pricing", "finance"],
    ["/users", "users"],
    ["/settings", "ai"],
  ])("%s needs %s", (path, area) => expect(areaForPath(path)).toBe(area));

  it("treats the home page and unknown pages as open", () => {
    expect(areaForPath("/dashboard")).toBeNull();
    expect(areaForPath("/somewhere-new")).toBeNull();
    expect(areaForPath(null)).toBeNull();
  });

  it("does not match a longer name that merely starts the same", () => {
    expect(areaForPath("/dashboard/coursesplus")).toBeNull();
  });
});

describe("levels", () => {
  it("manage includes view; view does not include manage; absent is none", () => {
    const a = access({courses: "manage", teachers: "view"});
    expect([canView(a, "courses"), canManage(a, "courses")]).toEqual([true, true]);
    expect([canView(a, "teachers"), canManage(a, "teachers")]).toEqual([true, false]);
    expect([canView(a, "finance"), canManage(a, "finance")]).toEqual([false, false]);
  });

  it("a super admin can do everything", () => {
    expect([canView(superAdmin, "finance"), canManage(superAdmin, "finance")]).toEqual([true, true]);
  });
});

describe("canOpen", () => {
  const dev = access({courses: "manage"});
  it("opens pages in granted areas, and the home page, and refuses the rest", () => {
    expect(canOpen(dev, "/dashboard/courses")).toBe(true);
    expect(canOpen(dev, "/dashboard")).toBe(true);
    expect(canOpen(dev, "/finance")).toBe(false);
  });

  it("shows everything while access is unknown, since the server still decides", () => {
    expect(canOpen(undefined, "/finance")).toBe(true);
  });

  it("finds the first page worth sending someone to", () => {
    expect(firstAllowedHref(dev, ["/finance", "/dashboard/courses", "/users"])).toBe("/dashboard/courses");
    expect(firstAllowedHref(access({}), ["/finance", "/users"])).toBeNull();
  });
});

describe("summarizeAccess", () => {
  it("lists what is managed and what is only viewable", () => {
    expect(summarizeAccess({courses: "manage", exams: "manage", teachers: "view", finance: "none"})).toBe(
      "Manage Courses, Exam programs · View Teachers",
    );
  });
  it("says so for super admins and for none", () => {
    expect(summarizeAccess({}, true)).toMatch(/Everything/);
    expect(summarizeAccess({finance: "none"})).toBe("No areas");
  });
});

describe("templates", () => {
  it("only sends the areas actually granted", () => {
    expect(toApiPermissions({courses: "manage", exams: "none", teachers: "view"})).toEqual({courses: "manage", teachers: "view"});
  });

  it("recognises a template by its areas, and anything else as custom", () => {
    expect(presetFor({courses: "manage", exams: "manage", teachers: "view"}, PRESETS)).toBe("course_developer");
    expect(presetFor({courses: "manage", exams: "manage", teachers: "view", finance: "none"}, PRESETS)).toBe("course_developer");
    expect(presetFor({courses: "manage", exams: "manage"}, PRESETS)).toBe("custom");
    expect(presetFor({}, PRESETS)).toBe("custom");
  });

  it("starts the form from a template's areas, or empty for custom and the super template", () => {
    expect(permissionsForPreset("course_developer", PRESETS)).toEqual(PRESETS[1].permissions);
    expect(permissionsForPreset("custom", PRESETS)).toEqual({});
    expect(permissionsForPreset("super_admin", PRESETS)).toEqual({});
  });

  it("compares areas ignoring order and 'none'", () => {
    expect(sameAreas({a: "view", b: "none"}, {a: "view"})).toBe(true);
    expect(sameAreas({a: "view"}, {a: "manage"})).toBe(false);
  });

  it("needs at least one area unless it is the super template", () => {
    expect(hasValidAccess("custom", {})).toBe(false);
    expect(hasValidAccess("custom", {courses: "none"})).toBe(false);
    expect(hasValidAccess("custom", {courses: "view"})).toBe(true);
    expect(hasValidAccess("super_admin", {})).toBe(true);
  });
});
