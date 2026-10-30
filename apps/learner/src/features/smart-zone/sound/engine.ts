import {SOUND_RECIPES, type SoundName} from "./recipes";
import {soundEnabledNow} from "./prefs";

type ContextCtor = typeof AudioContext;

let context: AudioContext | null = null;

function getContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (context) return context;
  const Ctor: ContextCtor | undefined =
    window.AudioContext ?? (window as unknown as {webkitAudioContext?: ContextCtor}).webkitAudioContext;
  if (!Ctor) return null;
  try {
    context = new Ctor();
  } catch {
    return null;
  }
  return context;
}

/**
 * Browsers keep audio silent until the learner has done something on the page. Call this from a click
 * or key press (the Start button does) so the first real sound is heard.
 */
export function unlockAudio(): void {
  const ctx = getContext();
  if (ctx && ctx.state === "suspended") void ctx.resume();
}

/** Plays one of the Smart Zone sounds. Does nothing when sound is off or the browser has no audio. */
export function playSound(name: SoundName, options: {pitch?: number} = {}): void {
  if (!soundEnabledNow()) return;
  const ctx = getContext();
  if (!ctx) return;
  if (ctx.state === "suspended") void ctx.resume();

  const pitch = options.pitch ?? 1;
  const start = ctx.currentTime + 0.005;
  for (const tone of SOUND_RECIPES[name]) {
    const osc = ctx.createOscillator();
    const amp = ctx.createGain();
    const begin = start + tone.at;
    const end = begin + tone.dur;
    osc.type = tone.type;
    osc.frequency.setValueAtTime(tone.freq * pitch, begin);
    if (tone.glideTo) osc.frequency.exponentialRampToValueAtTime(tone.glideTo * pitch, end);
    // A quick fade in and out stops the clicks a hard start or stop would make.
    amp.gain.setValueAtTime(0.0001, begin);
    amp.gain.exponentialRampToValueAtTime(tone.gain, begin + Math.min(0.012, tone.dur / 3));
    amp.gain.exponentialRampToValueAtTime(0.0001, end);
    osc.connect(amp);
    amp.connect(ctx.destination);
    osc.start(begin);
    osc.stop(end + 0.03);
  }
}

/** A short buzz on phones that support it, with the same on/off switch as the sounds. */
export function buzz(pattern: number | number[]): void {
  if (!soundEnabledNow() || typeof navigator === "undefined" || typeof navigator.vibrate !== "function") return;
  navigator.vibrate(pattern);
}

/** For tests: forget the audio context. */
export function resetAudioForTests(): void {
  context = null;
}
