/**
 * The Smart Zone's sound effects, written as notes. They are synthesised in the browser
 * (see engine.ts), so there are no audio files to download, host or license.
 */
export type SoundName =
  | "select"
  | "enter"
  | "next"
  | "correct"
  | "wrong"
  | "streak"
  | "tick"
  | "tickLast"
  | "warning"
  | "timeup"
  | "complete"
  | "consolation"
  | "toggle";

export interface Tone {
  /** Pitch in Hz. */
  freq: number;
  /** Seconds after the sound starts. */
  at: number;
  /** How long it sounds, in seconds. */
  dur: number;
  type: OscillatorType;
  /** Peak loudness, 0 to 1. Kept low: these play often. */
  gain: number;
  /** Slide to this pitch over the note. */
  glideTo?: number;
}

const note = (freq: number, at: number, dur: number, type: OscillatorType, gain: number, glideTo?: number): Tone => ({
  freq, at, dur, type, gain, ...(glideTo ? {glideTo} : {}),
});

export const SOUND_RECIPES: Record<SoundName, Tone[]> = {
  // An option is picked: a small, soft pop.
  select: [note(520, 0, 0.07, "triangle", 0.12, 640)],
  // Enter / Check is pressed: a firm two-step confirm.
  enter: [note(330, 0, 0.07, "triangle", 0.14), note(495, 0.06, 0.1, "triangle", 0.14)],
  // Next question: a quick upward whoosh.
  next: [note(380, 0, 0.14, "sine", 0.1, 760)],
  // Right answer: a rising three-note chime (C5 E5 G5).
  correct: [
    note(523.25, 0, 0.18, "sine", 0.16),
    note(659.25, 0.09, 0.18, "sine", 0.16),
    note(783.99, 0.18, 0.28, "sine", 0.16),
  ],
  // Wrong answer: a low, short buzz.
  wrong: [note(200, 0, 0.3, "sawtooth", 0.1, 140), note(150, 0, 0.3, "sine", 0.12)],
  // Several right in a row: a sparkle on top of the chime.
  streak: [note(1046.5, 0.22, 0.09, "sine", 0.11), note(1318.5, 0.29, 0.14, "sine", 0.11)],
  // The clock, in its last ten seconds.
  tick: [note(1000, 0, 0.04, "sine", 0.08)],
  tickLast: [note(1400, 0, 0.06, "square", 0.07)],
  // A minute left.
  warning: [note(880, 0, 0.1, "square", 0.08), note(880, 0.2, 0.1, "square", 0.08)],
  // Time is up: a falling alarm.
  timeup: [note(480, 0, 0.55, "sawtooth", 0.12, 170), note(240, 0.05, 0.55, "square", 0.05, 90)],
  // Finished with a good score: a short fanfare (C5 E5 G5 C6).
  complete: [
    note(523.25, 0, 0.14, "triangle", 0.15),
    note(659.25, 0.12, 0.14, "triangle", 0.15),
    note(783.99, 0.24, 0.14, "triangle", 0.15),
    note(1046.5, 0.36, 0.5, "triangle", 0.17),
  ],
  // Finished, with more to learn: a gentle falling phrase, never a scolding.
  consolation: [note(392, 0, 0.16, "sine", 0.12), note(330, 0.16, 0.16, "sine", 0.12), note(262, 0.32, 0.34, "sine", 0.12)],
  // Sound switched on: a little blip so the learner can hear it works.
  toggle: [note(660, 0, 0.08, "triangle", 0.12), note(880, 0.08, 0.1, "triangle", 0.12)],
};
