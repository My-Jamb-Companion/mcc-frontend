import type {Flashcard} from "../services/flashcards.service";

/** The backend's per-call ceiling for POST /brainy/flashcards. */
export const MAX_PART_CHARS = 8000;

// Natural places to cut, best first. `keep` is how much of the separator stays
// with the earlier part (a sentence keeps its full stop).
const BREAKS: {separator: string; keep: number}[] = [
  {separator: "\n\n", keep: 0},
  {separator: "\n", keep: 0},
  {separator: ". ", keep: 1},
  {separator: "? ", keep: 1},
  {separator: "! ", keep: 1},
  {separator: " ", keep: 0},
];

/** Where to cut `window` so the earlier part ends naturally, or its full length if nothing fits. */
function findCut(window: string): number {
  // Only accept a break in the second half: otherwise one early paragraph
  // break would leave a tiny part and push the rest into extra calls.
  const floor = Math.floor(window.length / 2);
  for (const {separator, keep} of BREAKS) {
    const at = window.lastIndexOf(separator);
    if (at >= floor) return at + keep;
  }
  return window.length;
}

/**
 * Splits study material into parts of at most `max` characters so a whole
 * chapter is usable (the backend takes one part per call). Cuts at paragraph
 * boundaries when it can, then line breaks, then sentence ends, and only as a
 * last resort mid-word, so a card is never generated from half a sentence.
 */
export function splitIntoParts(text: string, max: number = MAX_PART_CHARS): string[] {
  let rest = text.trim();
  if (!rest) return [];

  const parts: string[] = [];
  while (rest.length > max) {
    const cut = findCut(rest.slice(0, max));
    parts.push(rest.slice(0, cut).trim());
    rest = rest.slice(cut).trim();
  }
  parts.push(rest);
  return parts.filter(Boolean);
}

const normalise = (s: string) => s.toLowerCase().replace(/\s+/g, " ").trim();

/**
 * Adds `incoming` cards to `deck`, skipping any whose front (ignoring case
 * and spacing) is already there. Returns the new deck and how many were added,
 * so generating from several parts of one document doesn't repeat itself.
 */
export function mergeDeck(
  deck: Flashcard[],
  incoming: Flashcard[],
): {deck: Flashcard[]; added: number} {
  const seen = new Set(deck.map((c) => normalise(c.front)));
  const additions: Flashcard[] = [];
  for (const card of incoming) {
    const key = normalise(card.front);
    if (!key || seen.has(key)) continue;
    seen.add(key);
    additions.push(card);
  }
  return {deck: [...deck, ...additions], added: additions.length};
}

/** A deck can be saved once it has cards and none is half-empty. */
export function deckIsSavable(deck: Flashcard[]): boolean {
  return deck.length > 0 && deck.every((c) => c.front.trim() && c.back.trim());
}

/** "My Biology Notes.final.pdf" -> "My Biology Notes.final" -- a sensible default title. */
export function titleFromFilename(filename: string): string {
  return filename.replace(/\.[^.]+$/, "").replace(/[_-]+/g, " ").trim();
}
