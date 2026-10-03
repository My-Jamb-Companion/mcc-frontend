import {describe, expect, it} from "vitest";
import {groupContentRows} from "./content.mapper";
import type {ApiCourseContentRow} from "@/src/features/courses/services/course.service";

const row = (over: Partial<ApiCourseContentRow>): ApiCourseContentRow => ({
  module_id: "m1",
  module_title: "Module 1",
  lesson_id: "l1",
  lesson_title: "Lesson 1",
  ...over,
});

describe("groupContentRows", () => {
  it("groups the flat rows into modules with their lessons, in order", () => {
    const modules = groupContentRows([
      row({lesson_id: "l1"}),
      row({lesson_id: "l2", lesson_title: "Lesson 2"}),
      row({module_id: "m2", module_title: "Module 2", lesson_id: "l3"}),
    ]);
    expect(modules.map((m) => [m.id, m.lessons.map((l) => l.id)])).toEqual([
      ["m1", ["l1", "l2"]],
      ["m2", ["l3"]],
    ]);
  });

  it("carries a module's exercise sets, which the API repeats on each of its rows", () => {
    const sets = [{name: "Algebra drill", count: 2}, {name: "Geometry drill", count: 1}];
    const [module] = groupContentRows([
      row({lesson_id: "l1", exercise_sets: sets}),
      row({lesson_id: "l2", exercise_sets: sets}),
    ]);
    expect(module.exerciseSets).toEqual(sets);
  });

  it("has no exercise sets when the API sends none", () => {
    expect(groupContentRows([row({})])[0].exerciseSets).toEqual([]);
  });

  it("keeps a module that has no lessons (quiz- or exercise-only)", () => {
    const [module] = groupContentRows([
      row({lesson_id: null, lesson_title: null, exercise_sets: [{name: "Drill", count: 3}]}),
    ]);
    expect(module.lessons).toEqual([]);
    expect(module.exerciseSets).toEqual([{name: "Drill", count: 3}]);
  });
});
