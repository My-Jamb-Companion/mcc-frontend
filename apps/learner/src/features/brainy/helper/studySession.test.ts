import {describe, expect, it} from "vitest";
import {
  buildDeck,
  buildQuiz,
  deckCounts,
  isDue,
  scoreAnswers,
  shuffle,
  toReviewResults,
  type CardProgress,
  type StudyCard,
} from "./studySession";

const NOW = new Date("2026-10-02T12:00:00Z");
const cards: StudyCard[] = ["a", "b", "c", "d", "e"].map((id) => ({id, front: `Q-${id}`, back: `A-${id}`}));
const progress = (card_id: string, box: number, dueInDays: number): CardProgress => ({
  card_id, box, due_at: new Date(NOW.getTime() + dueInDays * 86_400_000).toISOString(),
});

describe("isDue", () => {
  it("treats a never-studied card as due", () => expect(isDue(undefined, NOW)).toBe(true));
  it("is due once the time has come, including exactly now", () => {
    expect(isDue(progress("a", 2, -1), NOW)).toBe(true);
    expect(isDue(progress("a", 2, 0), NOW)).toBe(true);
  });
  it("is not due before then", () => expect(isDue(progress("a", 2, 3), NOW)).toBe(false));
});

describe("buildDeck", () => {
  const prog = [progress("a", 1, -1), progress("b", 3, 2), progress("c", 4, 5), progress("d", 5, -3)];

  it("all: every card", () => expect(buildDeck(cards, prog, "all", NOW)).toHaveLength(5));

  it("due: overdue reviews plus never-studied cards, nothing else", () => {
    expect(buildDeck(cards, prog, "due", NOW).map((c) => c.id)).toEqual(["a", "d", "e"]);
  });

  it("learning: studied but not mastered", () => {
    expect(buildDeck(cards, prog, "learning", NOW).map((c) => c.id)).toEqual(["a", "b"]);
  });

  it("learning never includes a never-studied card", () => {
    expect(buildDeck(cards, [], "learning", NOW)).toEqual([]);
  });

  it("ignores progress for cards that no longer exist", () => {
    expect(buildDeck(cards, [progress("gone", 1, -1)], "learning", NOW)).toEqual([]);
  });

  it("deckCounts matches the decks", () => {
    expect(deckCounts(cards, prog, NOW)).toEqual({all: 5, due: 3, learning: 2});
  });
});

describe("shuffle", () => {
  it("keeps every item exactly once and does not mutate the input", () => {
    const input = [1, 2, 3, 4, 5, 6];
    const out = shuffle(input);
    expect([...out].sort()).toEqual(input);
    expect(input).toEqual([1, 2, 3, 4, 5, 6]);
  });

  it("is deterministic for a given random source", () => {
    const seq = () => { let i = 0; const v = [0.1, 0.9, 0.5, 0.3]; return () => v[i++ % v.length]; };
    expect(shuffle([1, 2, 3, 4, 5], seq())).toEqual(shuffle([1, 2, 3, 4, 5], seq()));
  });

  it("handles empty and single-item lists", () => {
    expect(shuffle([])).toEqual([]);
    expect(shuffle([7])).toEqual([7]);
  });
});

describe("buildQuiz", () => {
  it("makes a multiple-choice question per card when the set is big enough", () => {
    const quiz = buildQuiz(cards);
    expect(quiz).toHaveLength(5);
    expect(quiz.every((q) => q.kind === "choice")).toBe(true);
  });

  it("always includes the right answer once, at the reported index, with no duplicate options", () => {
    for (let run = 0; run < 25; run++) {
      for (const q of buildQuiz(cards)) {
        if (q.kind !== "choice") throw new Error("expected choice");
        expect(q.choices).toHaveLength(4);
        expect(q.choices[q.answerIndex]).toBe(q.card.back);
        expect(new Set(q.choices.map((c) => c.toLowerCase())).size).toBe(4);
        expect(q.choices.filter((c) => c === q.card.back)).toHaveLength(1);
      }
    }
  });

  it("only uses wrong answers that belong to other cards in the set", () => {
    const backs = new Set(cards.map((c) => c.back));
    for (const q of buildQuiz(cards)) {
      if (q.kind === "choice") expect(q.choices.every((c) => backs.has(c))).toBe(true);
    }
  });

  it("falls back to type-and-reveal when there are too few cards for distractors", () => {
    const quiz = buildQuiz(cards.slice(0, 3));
    expect(quiz.every((q) => q.kind === "self")).toBe(true);
  });

  it("does not count identical answers as different distractors", () => {
    const same: StudyCard[] = ["a", "b", "c", "d"].map((id) => ({id, front: `Q-${id}`, back: "Same answer"}));
    expect(buildQuiz(same).every((q) => q.kind === "self")).toBe(true);
  });

  it("covers every card exactly once", () => {
    expect(buildQuiz(cards).map((q) => q.card.id).sort()).toEqual(["a", "b", "c", "d", "e"]);
  });
});

describe("buildQuiz distractor source", () => {
  it("quizzes a few cards but draws wrong answers from the whole set", () => {
    const quiz = buildQuiz(cards.slice(0, 1), Math.random, cards);
    expect(quiz).toHaveLength(1);
    const q = quiz[0];
    expect(q.kind).toBe("choice");
    if (q.kind === "choice") {
      expect(q.choices).toHaveLength(4);
      expect(q.choices[q.answerIndex]).toBe("A-a");
    }
  });
  it("falls back to self-marking when even the whole set is too small", () => {
    expect(buildQuiz(cards.slice(0, 1), Math.random, cards.slice(0, 2))[0].kind).toBe("self");
  });
});

describe("scoreAnswers", () => {
  const answers = [
    {cardId: "a", correct: true}, {cardId: "b", correct: false}, {cardId: "c", correct: true}, {cardId: "d", correct: false},
  ];

  it("scores and lists the cards that were missed", () => {
    expect(scoreAnswers(answers)).toEqual({correct: 2, total: 4, percent: 50, missedIds: ["b", "d"]});
  });

  it("rounds the percentage", () => {
    expect(scoreAnswers([{cardId: "a", correct: true}, {cardId: "b", correct: false}, {cardId: "c", correct: false}]).percent).toBe(33);
  });

  it("is zero, not NaN, for no answers", () => {
    expect(scoreAnswers([])).toEqual({correct: 0, total: 0, percent: 0, missedIds: []});
  });

  it("keeps the order answers were given in for the review payload", () => {
    expect(toReviewResults(answers)[1]).toEqual({card_id: "b", correct: false});
    expect(toReviewResults(answers).map((r) => r.card_id)).toEqual(["a", "b", "c", "d"]);
  });
});
