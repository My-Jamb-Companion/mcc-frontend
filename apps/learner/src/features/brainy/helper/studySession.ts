export interface StudyCard {
  id: string;
  front: string;
  back: string;
}

export interface CardProgress {
  card_id: string;
  /** Leitner box 1 (new / missed) to 5 (mastered). */
  box: number;
  due_at: string;
}

export type DeckMode = "all" | "due" | "learning";

export const MASTERED_BOX = 4;

/** A card is worth studying now if it was never studied or its review time has come. */
export const isDue = (progress: CardProgress | undefined, now: Date): boolean =>
  !progress || new Date(progress.due_at).getTime() <= now.getTime();

const byCard = (progress: CardProgress[]) => new Map(progress.map((p) => [p.card_id, p]));

/**
 * The cards a session covers:
 *  - all:      every card
 *  - due:      studied cards whose time has come, plus cards never studied
 *  - learning: studied but not yet mastered (boxes 1-3)
 */
export function buildDeck(
  cards: StudyCard[],
  progress: CardProgress[],
  mode: DeckMode,
  now: Date,
): StudyCard[] {
  if (mode === "all") return cards;
  const lookup = byCard(progress);
  if (mode === "due") return cards.filter((c) => isDue(lookup.get(c.id), now));
  return cards.filter((c) => {
    const p = lookup.get(c.id);
    return !!p && p.box < MASTERED_BOX;
  });
}

export function deckCounts(
  cards: StudyCard[],
  progress: CardProgress[],
  now: Date,
): Record<DeckMode, number> {
  return {
    all: cards.length,
    due: buildDeck(cards, progress, "due", now).length,
    learning: buildDeck(cards, progress, "learning", now).length,
  };
}

/** Fisher-Yates on a copy. `random` is injectable so tests are deterministic. */
export function shuffle<T>(items: readonly T[], random: () => number = Math.random): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export type QuizQuestion =
  | {kind: "choice"; card: StudyCard; choices: string[]; answerIndex: number}
  | {kind: "self"; card: StudyCard};

const key = (text: string) => text.toLowerCase().replace(/\s+/g, " ").trim();
export const CHOICES_PER_QUESTION = 4;

/**
 * A multiple-choice question for every card whose answer can be hidden among
 * enough *different* wrong answers taken from the same set; otherwise a
 * "type it, reveal it, mark yourself" question. Never offers the right answer
 * twice or two identical options, and shuffles where the right one sits.
 */
export function buildQuiz(
  cards: StudyCard[],
  random: () => number = Math.random,
  /** Where wrong answers come from -- the whole set, even when quizzing only a few of its cards. */
  distractorSource: StudyCard[] = cards,
): QuizQuestion[] {
  return shuffle(cards, random).map((card): QuizQuestion => {
    const correct = key(card.back);
    const seen = new Set<string>([correct]);
    const pool: string[] = [];
    for (const other of distractorSource) {
      const k = key(other.back);
      if (!k || seen.has(k)) continue;
      seen.add(k);
      pool.push(other.back);
    }
    if (pool.length < CHOICES_PER_QUESTION - 1) return {kind: "self", card};

    const choices = shuffle([card.back, ...shuffle(pool, random).slice(0, CHOICES_PER_QUESTION - 1)], random);
    return {kind: "choice", card, choices, answerIndex: choices.indexOf(card.back)};
  });
}

export interface Answer {
  cardId: string;
  correct: boolean;
}

export function scoreAnswers(answers: Answer[]) {
  const correct = answers.filter((a) => a.correct).length;
  return {
    correct,
    total: answers.length,
    percent: answers.length ? Math.round((correct / answers.length) * 100) : 0,
    missedIds: answers.filter((a) => !a.correct).map((a) => a.cardId),
  };
}

/** The payload for POST /exams/study-sets/<id>/review, in the order answered. */
export const toReviewResults = (answers: Answer[]) =>
  answers.map((a) => ({card_id: a.cardId, correct: a.correct}));
