import {describe, expect, it} from "vitest";
import {nextLectureId} from "./lectureOrder";

const lectures = [{lecture_id: "a"}, {lecture_id: "b"}, {lecture_id: "c"}];

describe("nextLectureId", () => {
  it("is the lecture after the given one", () => {
    expect(nextLectureId(lectures, "a")).toBe("b");
    expect(nextLectureId(lectures, "b")).toBe("c");
  });
  it("is null after the last lecture, for an unknown id and for no lectures", () => {
    expect(nextLectureId(lectures, "c")).toBeNull();
    expect(nextLectureId(lectures, "zzz")).toBeNull();
    expect(nextLectureId([], "a")).toBeNull();
  });
});
