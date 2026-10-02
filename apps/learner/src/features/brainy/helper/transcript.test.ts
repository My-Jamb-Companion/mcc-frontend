import {describe, expect, it} from "vitest";
import {applyResults, displayTranscript, EMPTY_TRANSCRIPT, formatDuration, joinSpoken} from "./transcript";

const result = (transcript: string, isFinal: boolean) => Object.assign([{transcript}], {isFinal});

describe("applyResults", () => {
  it("shows the live guess as interim without committing it", () => {
    const state = applyResults(EMPTY_TRANSCRIPT, [result("photo", false)], 0);
    expect(state).toEqual({final: "", interim: "photo"});
  });

  it("replaces the interim guess each event instead of piling it up", () => {
    let state = applyResults(EMPTY_TRANSCRIPT, [result("photo", false)], 0);
    state = applyResults(state, [result("photosynthesis is", false)], 0);
    expect(displayTranscript(state)).toBe("photosynthesis is");
  });

  it("commits a finalised phrase and clears the interim", () => {
    const state = applyResults(EMPTY_TRANSCRIPT, [result("photosynthesis is how plants eat", true)], 0);
    expect(state).toEqual({final: "photosynthesis is how plants eat", interim: ""});
  });

  it("appends later phrases to what is already committed", () => {
    let state = applyResults(EMPTY_TRANSCRIPT, [result("first phrase", true)], 0);
    state = applyResults(state, [result("first phrase", true), result("second phrase", false)], 1);
    expect(state).toEqual({final: "first phrase", interim: "second phrase"});
    state = applyResults(state, [result("first phrase", true), result("second phrase", true)], 1);
    expect(displayTranscript(state)).toBe("first phrase second phrase");
  });

  it("keeps committed text when the engine restarts and indexes begin at 0 again", () => {
    let state = applyResults(EMPTY_TRANSCRIPT, [result("before the restart", true)], 0);
    state = applyResults(state, [result("after the restart", true)], 0);
    expect(state.final).toBe("before the restart after the restart");
  });

  it("copes with an empty alternative", () => {
    const empty = Object.assign([], {isFinal: true});
    expect(applyResults(EMPTY_TRANSCRIPT, [empty], 0)).toEqual(EMPTY_TRANSCRIPT);
  });
});

describe("joinSpoken", () => {
  it("uses exactly one space and drops empties", () => {
    expect(joinSpoken(" a ", " b ")).toBe("a b");
    expect(joinSpoken("", "b")).toBe("b");
    expect(joinSpoken("a", "")).toBe("a");
  });
});

describe("formatDuration", () => {
  it("formats minutes and hours", () => {
    expect(formatDuration(0)).toBe("0:00");
    expect(formatDuration(65)).toBe("1:05");
    expect(formatDuration(3725)).toBe("1:02:05");
  });
  it("never goes negative", () => expect(formatDuration(-4)).toBe("0:00"));
});
