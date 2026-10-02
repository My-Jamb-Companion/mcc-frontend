import {describe, expect, it} from "vitest";
import {isImageFile, scaleToFit} from "./imageUpload";

describe("scaleToFit", () => {
  it("shrinks the longest edge to the limit and keeps the aspect ratio", () => {
    expect(scaleToFit({width: 4000, height: 3000}, 1600)).toEqual({width: 1600, height: 1200});
    expect(scaleToFit({width: 3000, height: 4000}, 1600)).toEqual({width: 1200, height: 1600});
  });

  it("never enlarges a small image", () => {
    expect(scaleToFit({width: 800, height: 600}, 1600)).toEqual({width: 800, height: 600});
  });

  it("leaves an image exactly at the limit alone", () => {
    expect(scaleToFit({width: 1600, height: 900}, 1600)).toEqual({width: 1600, height: 900});
  });
});

describe("isImageFile", () => {
  it("recognises photos by mime type or extension, including HEIC", () => {
    expect(isImageFile({name: "a.bin", type: "image/png"})).toBe(true);
    expect(isImageFile({name: "IMG_1.HEIC"})).toBe(true);
    expect(isImageFile({name: "notes.pdf", type: "application/pdf"})).toBe(false);
  });
});
