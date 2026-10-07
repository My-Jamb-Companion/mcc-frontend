import {describe, expect, it} from "vitest";
import {changedFields, initialsOf, passwordProblem, photoProblem} from "./profileForm";

describe("passwordProblem", () => {
  it("names the first thing to fix", () => {
    expect(passwordProblem("", "abcdef", "abcdef")).toMatch(/current password/);
    expect(passwordProblem("old-pass", "abc", "abc")).toMatch(/at least 6/);
    expect(passwordProblem("same-pass", "same-pass", "same-pass")).toMatch(/different/);
    expect(passwordProblem("old-pass", "new-pass", "new-pas")).toMatch(/don't match/);
  });
  it("lets a valid change through", () => {
    expect(passwordProblem("old-pass", "new-pass", "new-pass")).toBeNull();
  });
});

describe("photoProblem", () => {
  it("accepts a normal image and refuses non-images and huge files", () => {
    expect(photoProblem({name: "me.png", type: "image/png", size: 1000})).toBeNull();
    expect(photoProblem({name: "cv.pdf", type: "application/pdf", size: 1000})).toMatch(/isn't an image/);
    expect(photoProblem({name: "big.jpg", type: "image/jpeg", size: 6 * 1024 * 1024})).toMatch(/5 MB/);
  });
});

describe("changedFields", () => {
  const original = {full_name: "Ada Obi", username: "ada", phone_number: null};
  it("sends only what changed, trimmed", () => {
    expect(changedFields(original, {full_name: " Ada Obi ", username: "ada", phone_number: ""})).toEqual({});
    expect(changedFields(original, {full_name: "Ada O.", username: "ada", phone_number: " 0801 "})).toEqual({full_name: "Ada O.", phone_number: "0801"});
  });
});

describe("initialsOf", () => {
  it("uses first and last initials", () => {
    expect(initialsOf("Ada Grace Obi")).toBe("AO");
    expect(initialsOf("ada")).toBe("AD");
    expect(initialsOf(" ")).toBe("?");
  });
});
