import {describe, expect, it} from "vitest";
import {emailMatches} from "./deleteConfirm";

describe("emailMatches", () => {
  it("needs the email typed back, ignoring case and spaces", () => {
    expect(emailMatches("Test@Example.com ", "test@example.com")).toBe(true);
    expect(emailMatches("test@example.co", "test@example.com")).toBe(false);
    expect(emailMatches("", "test@example.com")).toBe(false);
  });

  it("never matches an empty email", () => {
    expect(emailMatches("", "")).toBe(false);
  });
});
