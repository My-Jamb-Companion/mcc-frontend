import {describe, expect, it} from "vitest";
import type {AudioStatus, LessonAudio} from "../services/lessonAudio.service";
import {allNeeding, buildTasks, exceedsAllowance, formatChars, lessonState, needsAudio, percentDone, remainingToday, stateLabel, toggled, totalChars} from "./pregenerate";

const lesson = (id: string, parts: number, ready: number, chars = 100): LessonAudio => ({
  lecture_id: id, title: `Lesson ${id}`, module_title: "M", sections: parts, parts, chars: parts * chars, ready_parts: ready,
  missing: Array.from({length: parts - ready}, (_, i) => ({section: ready + i, part: 0, chars})),
});
const status = (lectures: LessonAudio[], over: Partial<AudioStatus> = {}): AudioStatus => ({
  configured: true, voice: {provider: "elevenlabs", model: "m", voice: "v"}, daily_limit: 1000, spent_today: 0, lectures,
  totals: {lectures: lectures.length, parts: 0, chars: 0, missing_parts: 0, missing_chars: 0}, ...over,
});

describe("pre-generating lesson audio", () => {
  it("says how much of a lesson is ready", () => {
    expect(lessonState(lesson("a", 3, 3))).toBe("ready");
    expect(lessonState(lesson("a", 3, 1))).toBe("partial");
    expect(lessonState(lesson("a", 3, 0))).toBe("none");
    expect(stateLabel(lesson("a", 3, 1))).toBe("1 of 3 ready");
    expect(stateLabel(lesson("a", 3, 3))).toBe("Ready");
    expect(stateLabel(lesson("a", 3, 0))).toBe("Not made");
    expect(needsAudio(lesson("a", 3, 3))).toBe(false);
  });

  it("makes a list of every missing part of the chosen lessons, in order", () => {
    const s = status([lesson("a", 2, 0), lesson("b", 1, 0), lesson("c", 2, 1)]);
    const tasks = buildTasks(s, new Set(["a", "c"]));
    expect(tasks.map((t) => `${t.lectureId}:${t.section}`)).toEqual(["a:0", "a:1", "c:1"]);
    expect(totalChars(tasks)).toBe(300);
    expect(buildTasks(s, new Set())).toEqual([]);
  });

  it("warns when a run would go past today's allowance", () => {
    const s = status([lesson("a", 3, 0)], {daily_limit: 500, spent_today: 300});
    expect(remainingToday(s)).toBe(200);
    expect(exceedsAllowance(s, buildTasks(s, new Set(["a"])))).toBe(true);
    expect(exceedsAllowance({daily_limit: 1000, spent_today: 0}, buildTasks(s, new Set(["a"])))).toBe(false);
    expect(remainingToday({daily_limit: 100, spent_today: 500})).toBe(0);
  });

  it("selects and clears lessons", () => {
    const s = status([lesson("a", 1, 0), lesson("b", 1, 1), lesson("c", 2, 0)]);
    expect([...toggled(new Set(), "a")]).toEqual(["a"]);
    expect([...toggled(new Set(["a"]), "a")]).toEqual([]);
    expect([...allNeeding(s, new Set())].sort()).toEqual(["a", "c"]);
    expect(allNeeding(s, new Set(["a", "c"])).size).toBe(0);
    expect(allNeeding(status([lesson("b", 1, 1)]), new Set()).size).toBe(0);
  });

  it("formats numbers and progress", () => {
    expect(formatChars(12400)).toBe("12,400");
    expect(percentDone(3, 12)).toBe(25);
    expect(percentDone(0, 0)).toBe(0);
    expect(percentDone(20, 12)).toBe(100);
  });
});
