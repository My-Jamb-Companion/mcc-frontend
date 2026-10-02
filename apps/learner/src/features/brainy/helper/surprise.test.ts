import {describe, expect, it} from "vitest";
import {brainyChatUrl, FALLBACK_SURPRISE_PROMPTS, pickSurprisePrompt} from "./surprise";

describe("pickSurprisePrompt", () => {
  const suggestions = ["a", "b", "c"];

  it("picks from the provided suggestions", () => {
    expect(pickSurprisePrompt(suggestions, () => 0)).toBe("a");
    expect(pickSurprisePrompt(suggestions, () => 0.5)).toBe("b");
    expect(pickSurprisePrompt(suggestions, () => 0.99)).toBe("c");
  });

  it("never indexes past the end when random() returns exactly 1", () => {
    expect(pickSurprisePrompt(suggestions, () => 1)).toBe("c");
  });

  it("falls back to built-in prompts when suggestions haven't loaded or are empty", () => {
    expect(FALLBACK_SURPRISE_PROMPTS).toContain(pickSurprisePrompt([], () => 0));
  });

  it("ignores blank suggestions rather than sending an empty question", () => {
    expect(pickSurprisePrompt(["", "  "], () => 0)).toBe(FALLBACK_SURPRISE_PROMPTS[0]);
    expect(pickSurprisePrompt(["", "real"], () => 0)).toBe("real");
  });
});

describe("brainyChatUrl", () => {
  it("encodes the question so punctuation survives the round trip", () => {
    const url = brainyChatUrl("What's 2 + 2? & why");
    expect(new URLSearchParams(url.split("?")[1]).get("q")).toBe("What's 2 + 2? & why");
  });
});
