// Used only when the suggestions endpoint is slow, empty or down -- "Surprise
// me" must always do something, never silently no-op.
export const FALLBACK_SURPRISE_PROMPTS = [
  "Explain Newton's First Law with an everyday example",
  "Give me a study plan for WAEC Mathematics",
  "What are the main themes in 'The Lion and the Jewel'?",
  "Teach me something surprising about photosynthesis",
  "Quiz me on a JAMB English Language topic",
  "How do I solve a quadratic equation, step by step?",
];

/** Picks one prompt at random. `random` is injectable so tests are deterministic. */
export function pickSurprisePrompt(
  suggestions: readonly string[],
  random: () => number = Math.random,
): string {
  const pool = suggestions.some((s) => s.trim()) ? suggestions.filter((s) => s.trim()) : FALLBACK_SURPRISE_PROMPTS;
  return pool[Math.min(Math.floor(random() * pool.length), pool.length - 1)];
}

/** The Brainy URL that starts a chat with `question` already sent. */
export const brainyChatUrl = (question: string): string =>
  `/brainy/new?q=${encodeURIComponent(question)}`;
