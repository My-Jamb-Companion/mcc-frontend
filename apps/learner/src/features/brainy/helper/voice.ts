/** Appends what was spoken to what was already typed, with exactly one space between. */
export function mergeTranscript(typed: string, spoken: string): string {
  return [typed.trim(), spoken.trim()].filter(Boolean).join(" ");
}

/** Student-facing wording for a SpeechRecognition `error` code. */
export function speechErrorMessage(code: string): string | null {
  switch (code) {
    case "not-allowed":
    case "service-not-allowed":
      return "Microphone access is blocked. Allow it in your browser's site settings, then try again.";
    case "no-speech":
      return "I didn't hear anything. Tap the microphone and try again.";
    case "audio-capture":
      return "No microphone was found on this device.";
    case "network":
      return "Voice input needs an internet connection.";
    case "aborted":
      // We stopped it ourselves (sent the message, or tapped the mic again).
      return null;
    default:
      return "Voice input stopped unexpectedly. Please try again.";
  }
}
