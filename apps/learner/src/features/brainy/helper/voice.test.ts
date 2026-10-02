import {describe, expect, it} from "vitest";
import {mergeTranscript, speechErrorMessage} from "./voice";

describe("mergeTranscript", () => {
  it("appends speech after what was already typed with a single space", () => {
    expect(mergeTranscript("Explain", "photosynthesis")).toBe("Explain photosynthesis");
  });

  it("does not leave a leading space when nothing was typed", () => {
    expect(mergeTranscript("", "  hello there ")).toBe("hello there");
  });

  it("keeps the typed text when nothing was heard", () => {
    expect(mergeTranscript("typed", "")).toBe("typed");
  });

  it("is idempotent for interim guesses: each call rebuilds from the same typed base", () => {
    const base = "Explain";
    expect(mergeTranscript(base, "photo")).toBe("Explain photo");
    expect(mergeTranscript(base, "photosynthesis")).toBe("Explain photosynthesis");
  });
});

describe("speechErrorMessage", () => {
  it("explains a blocked microphone", () => {
    expect(speechErrorMessage("not-allowed")).toMatch(/blocked/i);
    expect(speechErrorMessage("service-not-allowed")).toMatch(/blocked/i);
  });

  it("stays silent when we aborted the recording ourselves", () => {
    expect(speechErrorMessage("aborted")).toBeNull();
  });

  it("always gives a message for an unrecognised code", () => {
    expect(speechErrorMessage("something-new")).toBeTruthy();
  });
});
