import {describe, expect, it} from "vitest";
import {bannerPayload, emptyBannerForm, formFromBanner, moved, validateBanner} from "./bannerForm";

const ok = () => ({...emptyBannerForm(), caption: "Learn Maths"});

describe("slide form", () => {
  it("accepts a caption on a colour", () => {
    expect(validateBanner(ok())).toEqual({});
  });

  it("needs a caption, and an image when the background is an image", () => {
    expect(validateBanner({...ok(), caption: "  "}).caption).toBeDefined();
    expect(validateBanner({...ok(), caption: "x".repeat(201)}).caption).toBeDefined();
    expect(validateBanner({...ok(), background: "image"}).image).toBeDefined();
    expect(validateBanner({...ok(), background: "image", imageUrl: "https://cdn.test/a.png"}).image).toBeUndefined();
  });

  it("needs real colours", () => {
    expect(validateBanner({...ok(), bgColor: "red"}).bgColor).toBeDefined();
    expect(validateBanner({...ok(), textColor: "#fff"}).textColor).toBeDefined();
  });

  it("wants a button's words and its link together, and a safe link", () => {
    expect(validateBanner({...ok(), buttonLabel: "Go"}).linkUrl).toBeDefined();
    expect(validateBanner({...ok(), linkUrl: "/learnings"}).buttonLabel).toBeDefined();
    expect(validateBanner({...ok(), buttonLabel: "Go", linkUrl: "/learnings/course/abc"})).toEqual({});
    expect(validateBanner({...ok(), buttonLabel: "Go", linkUrl: "https://example.com"})).toEqual({});
    for (const bad of ["javascript:alert(1)", "//evil.test", "learnings"]) {
      expect(validateBanner({...ok(), buttonLabel: "Go", linkUrl: bad}).linkUrl).toBeDefined();
    }
  });

  it("sends no image when the background is a colour, even if one was picked before", () => {
    const payload = bannerPayload({...ok(), imageUrl: "https://cdn.test/a.png", bgColor: "#0f766e"});
    expect(payload.image_url).toBe("");
    expect(payload.bg_color).toBe("#0F766E");
  });

  it("opens an existing slide on the background it uses", () => {
    const f = formFromBanner({
      banner_id: "1", caption: "c", image_url: "https://cdn.test/a.png", bg_color: "#112233", text_color: "#FFFFFF",
      button_label: "", link_url: "", sort_order: 0, is_active: true,
    });
    expect(f.background).toBe("image");
  });

  it("moves a slide one place and stays put at the ends", () => {
    expect(moved(["a", "b", "c"], "b", -1)).toEqual(["b", "a", "c"]);
    expect(moved(["a", "b", "c"], "b", 1)).toEqual(["a", "c", "b"]);
    expect(moved(["a", "b", "c"], "a", -1)).toEqual(["a", "b", "c"]);
    expect(moved(["a", "b", "c"], "c", 1)).toEqual(["a", "b", "c"]);
  });
});
