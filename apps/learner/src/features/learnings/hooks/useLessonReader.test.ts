import {afterEach, beforeEach, describe, expect, it, vi} from "vitest";
import {act, renderHook, waitFor} from "@testing-library/react";
import type {AudioManifest} from "../helper/lessonAudio";

const getAudioPart = vi.fn();
vi.mock("../services/lessonAudio.service", () => ({getAudioPart: (...a: unknown[]) => getAudioPart(...a)}));

class FakeAudio {
  static instances: FakeAudio[] = [];
  src = "";
  preload = "";
  playbackRate = 1;
  paused = true;
  listeners: Record<string, Array<() => void>> = {};
  constructor() {
    FakeAudio.instances.push(this);
  }
  addEventListener(name: string, fn: () => void) {
    (this.listeners[name] ??= []).push(fn);
  }
  removeEventListener(name: string, fn: () => void) {
    this.listeners[name] = (this.listeners[name] ?? []).filter((f) => f !== fn);
  }
  play() {
    this.paused = false;
    return Promise.resolve();
  }
  pause() {
    this.paused = true;
  }
  end() {
    (this.listeners.ended ?? []).forEach((f) => f());
  }
}

import {useLessonReader} from "./useLessonReader";

const manifest: AudioManifest = {
  available: true,
  sections: [
    {index: 0, heading: "A", parts: 2, chars: 10},
    {index: 1, heading: "B", parts: 1, chars: 10},
  ],
};

const setup = () => {
  const onSection = vi.fn();
  const view = renderHook(() => useLessonReader({kind: "course", parentId: "c", lectureId: "l", manifest, onSection}));
  return {...view, onSection, audio: () => FakeAudio.instances[FakeAudio.instances.length - 1]};
};

beforeEach(() => {
  FakeAudio.instances = [];
  vi.stubGlobal("Audio", FakeAudio);
  let n = 0;
  vi.stubGlobal("URL", {...URL, createObjectURL: () => `blob:${n++}`, revokeObjectURL: vi.fn()});
  getAudioPart.mockReset();
  getAudioPart.mockResolvedValue(new Blob(["x"]));
  window.localStorage.clear();
});
afterEach(() => vi.unstubAllGlobals());

describe("useLessonReader", () => {
  it("plays the parts in order, moving the page along, and is idle at the end", async () => {
    const {result, onSection, audio} = setup();
    act(() => result.current.playFrom(0));
    await waitFor(() => expect(result.current.status).toBe("playing"));
    expect(onSection).toHaveBeenLastCalledWith(0);
    expect(getAudioPart).toHaveBeenCalledWith("course", "c", "l", 0, 0);
    // The next part is fetched while the first plays.
    await waitFor(() => expect(getAudioPart).toHaveBeenCalledWith("course", "c", "l", 0, 1));

    // Part one ends: part two of the same section plays, and the page stays where it is.
    act(() => audio().end());
    await waitFor(() => expect(audio().src).toBe("blob:1"));
    expect(onSection).toHaveBeenLastCalledWith(0);
    await waitFor(() => expect(getAudioPart).toHaveBeenCalledWith("course", "c", "l", 1, 0));

    // Section one ends: the next section plays and the page moves to it.
    act(() => audio().end());
    await waitFor(() => expect(onSection).toHaveBeenLastCalledWith(1));

    // The last part ends: nothing left, so idle.
    act(() => audio().end());
    await waitFor(() => expect(result.current.status).toBe("idle"));
  });

  it("pauses, resumes and stops", async () => {
    const {result, audio} = setup();
    act(() => result.current.playFrom(0));
    await waitFor(() => expect(result.current.status).toBe("playing"));
    act(() => result.current.pause());
    expect(result.current.status).toBe("paused");
    expect(audio().paused).toBe(true);
    act(() => result.current.resume());
    await waitFor(() => expect(result.current.status).toBe("playing"));
    act(() => result.current.stop());
    expect(result.current.status).toBe("idle");
  });

  it("starts from the section asked for", async () => {
    const {result} = setup();
    act(() => result.current.playFrom(1));
    await waitFor(() => expect(result.current.status).toBe("playing"));
    expect(getAudioPart).toHaveBeenCalledWith("course", "c", "l", 1, 0);
    expect(getAudioPart).not.toHaveBeenCalledWith("course", "c", "l", 0, 0);
  });

  it("shows the server's reason when audio cannot be made", async () => {
    getAudioPart.mockRejectedValue(new Error("Listening is paused for today. Please try again tomorrow."));
    const {result} = setup();
    act(() => result.current.playFrom(0));
    await waitFor(() => expect(result.current.status).toBe("error"));
    expect(result.current.error).toContain("paused for today");
  });

  it("remembers the speed between visits and applies it to the audio", async () => {
    const first = setup();
    act(() => first.result.current.setSpeed(1.5));
    expect(window.localStorage.getItem("lesson_listen_speed")).toBe("1.5");
    first.unmount();
    const second = setup();
    await waitFor(() => expect(second.result.current.speed).toBe(1.5));
    act(() => second.result.current.playFrom(0));
    await waitFor(() => expect(second.result.current.status).toBe("playing"));
    expect(second.audio().playbackRate).toBe(1.5);
  });
});
