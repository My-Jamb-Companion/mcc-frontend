import {describe, expect, it} from "vitest";
import {fromApiCourseDetail} from "./course.mapper";

const api = (over: Record<string, unknown>) =>
  ({
    course_id: "c1",
    title: "T",
    description: "D",
    price: "0",
    level: "all_levels",
    tags: [],
    learning_outcomes: [],
    modules: [],
    teacher: null,
    ...over,
  }) as never;

describe("fromApiCourseDetail uploads", () => {
  it("treats a saved cover image and promo video as present, so Publish and preview unlock", () => {
    const {upload} = fromApiCourseDetail(api({cover_image_url: "https://x/c.jpg", promo_video_url: "https://x/p.mp4"}));
    expect(upload.coverImage).toEqual({previewUrl: "https://x/c.jpg", remoteUrl: "https://x/c.jpg"});
    expect(upload.promoVideo).toEqual({previewUrl: "https://x/p.mp4", remoteUrl: "https://x/p.mp4"});
    expect(upload.coverImageUrl).toBe("https://x/c.jpg");
  });

  it("leaves them empty when nothing was uploaded", () => {
    const {upload} = fromApiCourseDetail(api({cover_image_url: null, promo_video_url: null}));
    expect(upload.coverImage).toBeNull();
    expect(upload.promoVideo).toBeNull();
  });
});
