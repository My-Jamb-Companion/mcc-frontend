export interface TranscriptState {
  /** Text the engine has finalised. Survives the engine restarting. */
  final: string;
  /** The in-progress guess for the phrase being spoken; replaced on every event. */
  interim: string;
}

export const EMPTY_TRANSCRIPT: TranscriptState = {final: "", interim: ""};

interface RecognitionResultLike {
  readonly isFinal: boolean;
  readonly [index: number]: {readonly transcript: string};
}

/** Joins two spoken chunks with exactly one space. */
export const joinSpoken = (a: string, b: string): string => [a.trim(), b.trim()].filter(Boolean).join(" ");

/**
 * Folds one SpeechRecognition `result` event into the transcript. In
 * continuous mode `resultIndex` points at the first result that changed:
 * finalised phrases are appended once, and the interim guess is rebuilt from
 * scratch each time (it is a moving target, not an accumulation).
 */
export function applyResults(
  state: TranscriptState,
  results: ArrayLike<RecognitionResultLike>,
  resultIndex: number,
): TranscriptState {
  let finalChunk = "";
  let interim = "";
  for (let i = resultIndex; i < results.length; i++) {
    const transcript = results[i][0]?.transcript ?? "";
    if (results[i].isFinal) finalChunk += transcript;
    else interim += transcript;
  }
  return {final: joinSpoken(state.final, finalChunk), interim: interim.trim()};
}

/** What the student sees and edits: committed text plus the live guess. */
export const displayTranscript = (state: TranscriptState): string => joinSpoken(state.final, state.interim);

/** 3725 -> "1:02:05", 65 -> "1:05" */
export function formatDuration(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = String(s % 60).padStart(2, "0");
  return h > 0 ? `${h}:${String(m).padStart(2, "0")}:${sec}` : `${m}:${sec}`;
}
