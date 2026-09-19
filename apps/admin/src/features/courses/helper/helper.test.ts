// @vitest-environment node
/**
 * toUpdateCoursePayload only includes `modules` when there's something real
 * to sync or the admin is on the Content step. The backend refuses an
 * explicit empty `modules` list against a course that still has content
 * (app/features/admin/courses/service.py::update_course_details) -- this
 * guards the common case (editing Details or Upload) from ever risking that
 * refusal, or worse, from wiping content before that guard existed.
 */
import {describe, expect, it} from "vitest";
import {toUpdateCoursePayload} from "./helper";
import {CoursesFormValues} from "../types/types";

const baseValues: CoursesFormValues = {
  id: "course_abc123",
  status: "draft",
  courseName: "Test course",
  category: "science",
  instructorName: "teacher_1",
  price: "0",
  level: "all",
  description: "A course",
  learnItems: ["Learn things"],
  tags: ["test"],
  content: {topics: []},
  upload: {coverImage: null, promoVideo: null},
};

const withTopics: CoursesFormValues = {
  ...baseValues,
  content: {
    topics: [
      {
        id: "t1",
        label: "Main Topic",
        modules: [{id: "m1", label: "Module 1", content: []}],
      },
    ],
  },
};

describe("toUpdateCoursePayload", () => {
  it("omits modules when saving from Details with no local content loaded", () => {
    const payload = toUpdateCoursePayload(baseValues, "details");
    expect(payload).not.toHaveProperty("modules");
  });

  it("omits modules when saving from Upload with no local content loaded", () => {
    const payload = toUpdateCoursePayload(baseValues, "upload");
    expect(payload).not.toHaveProperty("modules");
  });

  it("includes modules when saving from Details if content was actually loaded", () => {
    const payload = toUpdateCoursePayload(withTopics, "details");
    expect(payload.modules).toHaveLength(1);
    expect(payload.modules?.[0].title).toBe("Module 1");
  });

  it("includes an empty modules list when saving from the Content step itself", () => {
    // A deliberate edit on Content (e.g. removing the last module) must
    // still reach the backend so its own guard/error can apply -- silently
    // dropping it here would make a real content change look like it saved
    // when it didn't.
    const payload = toUpdateCoursePayload(baseValues, "content");
    expect(payload.modules).toEqual([]);
  });

  it("always includes the non-content fields regardless of step", () => {
    const payload = toUpdateCoursePayload(baseValues, "details");
    expect(payload.title).toBe("Test course");
    expect(payload.teacher_id).toBe("teacher_1");
  });
});
