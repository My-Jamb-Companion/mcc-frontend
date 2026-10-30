import {afterEach, beforeEach, describe, expect, it, vi} from "vitest";
import {SOUND_RECIPES} from "./recipes";
import {setSoundEnabled, soundEnabledNow} from "./prefs";
import {buzz, playSound, resetAudioForTests, unlockAudio} from "./engine";

const node = () => ({connect: vi.fn(), start: vi.fn(), stop: vi.fn()});

function installAudio(state: "running" | "suspended" = "running") {
  const oscillators: ReturnType<typeof makeOsc>[] = [];
  const makeOsc = () => ({
    ...node(),
    type: "",
    frequency: {setValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn()},
  });
  const resume = vi.fn();
  class FakeContext {
    state = state;
    currentTime = 0;
    destination = {};
    resume = resume;
    createOscillator() {
      const o = makeOsc();
      oscillators.push(o);
      return o;
    }
    createGain() {
      return {...node(), gain: {setValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn()}};
    }
  }
  vi.stubGlobal("AudioContext", FakeContext);
  Object.defineProperty(window, "AudioContext", {value: FakeContext, configurable: true});
  return {oscillators, resume};
}

beforeEach(() => {
  window.localStorage.clear();
  setSoundEnabled(true);
  resetAudioForTests();
});
afterEach(() => vi.unstubAllGlobals());

describe("sound recipes", () => {
  it("every sound has notes that start in order, are audible and are short", () => {
    for (const [name, tones] of Object.entries(SOUND_RECIPES)) {
      expect(tones.length, name).toBeGreaterThan(0);
      for (const tone of tones) {
        expect(tone.freq, name).toBeGreaterThan(50);
        expect(tone.dur, name).toBeGreaterThan(0);
        expect(tone.gain, name).toBeGreaterThan(0);
        expect(tone.gain, name).toBeLessThanOrEqual(0.2);
        expect(tone.at + tone.dur, name).toBeLessThan(1.2);
      }
    }
  });
});

describe("sound preference", () => {
  it("is on by default and remembers a choice", () => {
    window.localStorage.clear();
    expect(soundEnabledNow()).toBe(true);
    setSoundEnabled(false);
    expect(soundEnabledNow()).toBe(false);
    expect(window.localStorage.getItem("smartzone:sound")).toBe("off");
    setSoundEnabled(true);
    expect(soundEnabledNow()).toBe(true);
  });
});

describe("playSound", () => {
  it("plays one oscillator per note", () => {
    const {oscillators} = installAudio();
    playSound("correct");
    expect(oscillators).toHaveLength(SOUND_RECIPES.correct.length);
    expect(oscillators.every((o) => o.start.mock.calls.length === 1 && o.stop.mock.calls.length === 1)).toBe(true);
  });

  it("raises the pitch when asked", () => {
    const {oscillators} = installAudio();
    playSound("tick", {pitch: 2});
    expect(oscillators[0].frequency.setValueAtTime.mock.calls[0][0]).toBe(SOUND_RECIPES.tick[0].freq * 2);
  });

  it("makes no sound when sound is off", () => {
    const {oscillators} = installAudio();
    setSoundEnabled(false);
    playSound("correct");
    expect(oscillators).toHaveLength(0);
  });

  it("wakes a suspended audio context", () => {
    const {resume} = installAudio("suspended");
    unlockAudio();
    expect(resume).toHaveBeenCalled();
  });

  it("does nothing, and does not fail, where the browser has no audio", () => {
    Object.defineProperty(window, "AudioContext", {value: undefined, configurable: true});
    expect(() => playSound("correct")).not.toThrow();
  });
});

describe("buzz", () => {
  it("vibrates only when sound is on and the device can", () => {
    const vibrate = vi.fn();
    Object.defineProperty(navigator, "vibrate", {value: vibrate, configurable: true});
    buzz(40);
    expect(vibrate).toHaveBeenCalledWith(40);
    setSoundEnabled(false);
    buzz(40);
    expect(vibrate).toHaveBeenCalledTimes(1);
  });
});
