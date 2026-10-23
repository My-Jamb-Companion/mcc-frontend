import {describe, expect, it} from "vitest";
import {nextVersion, withCourseVersion} from "./contentVersion";

describe("withCourseVersion", () => {
  const modules = [{title: "M", lectures: []}] as never;

  it("adds the version the editor holds to a save that carries the content", () => {
    expect(withCourseVersion({modules}, 3)).toMatchObject({base_content_version: 3});
    expect(withCourseVersion({modules}, 0)).toMatchObject({base_content_version: 0});
  });

  it("leaves a details-only save alone: no content, so nothing to protect", () => {
    const details = {title: "Only the title"};
    expect(withCourseVersion(details, 3)).toBe(details);
  });

  it("sends none when the editor holds none", () => {
    const payload = {modules};
    expect(withCourseVersion(payload, null)).toBe(payload);
    expect(withCourseVersion(payload, undefined)).toBe(payload);
  });
});

describe("nextVersion", () => {
  it("takes the server's, and keeps the held one if the server sent none", () => {
    expect(nextVersion(2, 3)).toBe(3);
    expect(nextVersion(2, undefined)).toBe(2);
    expect(nextVersion(null, 1)).toBe(1);
    expect(nextVersion(null, undefined)).toBeNull();
  });
});
