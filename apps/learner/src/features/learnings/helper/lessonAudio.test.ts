import {describe, expect, it} from "vitest";
import {audioPath, canListen, firstItemFrom, nextSpeed, playlist, readSpeed, sectionLabel, type AudioManifest} from "./lessonAudio";

const sec = (index: number, parts: number) => ({index, heading: `H${index}`, parts, chars: parts * 100});
const manifest = (sections = [sec(0, 2), sec(1, 0), sec(2, 1)]): AudioManifest => ({available: true, sections});

describe("lesson audio helpers", () => {
  it("addresses a course's and a program's lessons", () => {
    expect(audioPath("course", "c1", "l1")).toBe("/courses/c1/lectures/l1/audio");
    expect(audioPath("exam", "p1", "l1", 2, 1)).toBe("/exams/p1/lectures/l1/audio/2/1");
  });

  it("plays every part in order and skips sections with nothing to say", () => {
    expect(playlist(manifest().sections)).toEqual([
      {section: 0, part: 0},
      {section: 0, part: 1},
      {section: 2, part: 0},
    ]);
  });

  it("starts from a section, or the next one that has audio", () => {
    const items = playlist(manifest().sections);
    expect(firstItemFrom(items, 0)).toBe(0);
    expect(firstItemFrom(items, 1)).toBe(2);
    expect(firstItemFrom(items, 3)).toBe(-1);
  });

  it("cycles through the speeds and reads a stored one safely", () => {
    expect(nextSpeed(1)).toBe(1.25);
    expect(nextSpeed(2)).toBe(0.75);
    expect(nextSpeed(3)).toBe(0.75);
    expect(readSpeed("1.5")).toBe(1.5);
    expect(readSpeed("7")).toBe(1);
    expect(readSpeed(null)).toBe(1);
  });

  it("is offered only when the server can speak it and the sections match the pages", () => {
    expect(canListen(manifest(), 3)).toBe(true);
    expect(canListen(manifest(), 4)).toBe(false);
    expect(canListen({available: false, sections: []}, 0)).toBe(false);
    expect(canListen(manifest([sec(0, 0)]), 1)).toBe(false);
    expect(canListen(undefined, 3)).toBe(false);
  });

  it("labels the section being heard", () => {
    expect(sectionLabel(1, 5)).toBe("Section 2 of 5");
  });
});
