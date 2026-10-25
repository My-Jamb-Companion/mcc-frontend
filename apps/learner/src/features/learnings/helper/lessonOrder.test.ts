import {describe, expect, it} from "vitest";
import {afterLesson} from "./lessonOrder";
import type {Lesson, Module} from "./content.mapper";

const lesson = (id: string): Lesson => ({id, title: id, videoUrl: null, duration: 0, thumbnailUrl: null, format: null, content: null} as Lesson);
const mod = (id: string, lessons: string[], practiceCount?: number): Module => ({
  id, title: id, lessons: lessons.map(lesson), exerciseSets: [], quizSets: [], practiceCount,
});

describe("afterLesson", () => {
  const modules = [mod("m1", ["a", "b"], 3), mod("m2", ["c"], 2)];

  it("moves to the next lesson inside a module", () => {
    expect(afterLesson(modules, "a")).toMatchObject({kind: "lesson", lesson: {id: "b"}});
  });
  it("goes to the module's Practice quiz from its last lesson", () => {
    expect(afterLesson(modules, "b")).toEqual({kind: "quiz", moduleId: "m1"});
    expect(afterLesson(modules, "c")).toEqual({kind: "quiz", moduleId: "m2"});
  });
  it("skips an empty Practice quiz and carries on to the next lesson", () => {
    expect(afterLesson([mod("m1", ["a"], 0), mod("m2", ["b"], 1)], "a")).toMatchObject({kind: "lesson", lesson: {id: "b"}});
  });
  it("is null after the course's last lesson when its quiz is empty", () => {
    expect(afterLesson([mod("m1", ["a"], 0)], "a")).toBeNull();
  });
  it("still offers the quiz when the server did not say how many questions it has", () => {
    expect(afterLesson([mod("m1", ["a"])], "a")).toEqual({kind: "quiz", moduleId: "m1"});
  });
  it("is null for an unknown lesson", () => {
    expect(afterLesson(modules, "zzz")).toBeNull();
  });
});
