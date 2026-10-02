"use client";

import {useEffect, useState} from "react";
import Link from "next/link";
import {useParams} from "next/navigation";
import {Icon} from "@mcc/ui";
import {useStudySet} from "../hooks/useFlashcards";
import {useSessionSaver} from "../hooks/useSessionSaver";
import {
  buildDeck,
  deckCounts,
  scoreAnswers,
  shuffle,
  type Answer,
  type DeckMode,
  type StudyCard,
} from "../helper/studySession";
import type {StudySetDetail} from "../services/flashcards.service";
import SaveNote from "./SaveNote";

const MODES: {value: DeckMode; label: string; hint: string}[] = [
  {value: "due", label: "Due & new", hint: "Cards that are ready to review, plus any you haven't seen"},
  {value: "learning", label: "Still learning", hint: "Cards you've seen but haven't mastered"},
  {value: "all", label: "Every card", hint: "The whole set"},
];

export default function StudySession() {
  const {setId} = useParams<{setId: string}>();
  const {data: set, isLoading} = useStudySet(setId);

  if (isLoading) return <p className="text-sm text-muted">Loading…</p>;
  if (!set) return <p className="text-sm text-muted">This study set couldn&apos;t be found.</p>;
  return <Session set={set} setId={setId} />;
}

function Session({set, setId}: {set: StudySetDetail; setId: string}) {
  const saver = useSessionSaver(setId);
  const [now, setNow] = useState(() => new Date());
  const counts = deckCounts(set.content, set.progress, now);

  const [mode, setMode] = useState<DeckMode>(counts.due > 0 ? "due" : "all");
  const [shuffleOn, setShuffleOn] = useState(true);

  const [queue, setQueue] = useState<StudyCard[] | null>(null);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [finished, setFinished] = useState(false);

  function start(cards: StudyCard[], shuffled: boolean) {
    setQueue(shuffled ? shuffle(cards) : cards);
    setIndex(0);
    setFlipped(false);
    setAnswers([]);
    setFinished(false);
  }

  function finish(final: Answer[]) {
    setFinished(true);
    saver.save(final);
  }

  function answer(correct: boolean) {
    if (!queue) return;
    const card = queue[index];
    const next = [...answers.filter((a) => a.cardId !== card.id), {cardId: card.id, correct}];
    setAnswers(next);
    setFlipped(false);
    // Don't leave focus on a button that's about to change meaning.
    if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
    if (index + 1 >= queue.length) finish(next);
    else setIndex(index + 1);
  }

  function move(delta: number) {
    if (!queue) return;
    const target = index + delta;
    if (target < 0 || target >= queue.length) return;
    setIndex(target);
    setFlipped(false);
  }

  useEffect(() => {
    if (!queue || finished) return;
    function onKey(e: KeyboardEvent) {
      const t = e.target as HTMLElement | null;
      if (t && ["INPUT", "TEXTAREA", "SELECT"].includes(t.tagName)) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key === " " || e.key === "Enter") {
        // Let a focused button/link handle its own activation.
        if (t && ["BUTTON", "A"].includes(t.tagName)) return;
        e.preventDefault();
        setFlipped((f) => !f);
      } else if (e.key === "ArrowRight") move(1);
      else if (e.key === "ArrowLeft") move(-1);
      else if (flipped && e.key === "1") answer(false);
      else if (flipped && e.key === "2") answer(true);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const back = (
    <Link
      href={`/learnings/study-sets/${setId}`}
      className="mb-6 flex items-center gap-1 text-sm text-subtle hover:underline"
    >
      <Icon icon="lucide:chevron-left" size={16} />
      Back to {set.title}
    </Link>
  );

  // ---- Pick a deck ----
  if (!queue) {
    const deck = buildDeck(set.content, set.progress, mode, now);
    return (
      <div className="mx-auto w-full max-w-xl max-sm:px-4">
        {back}
        <h1 className="mb-1 text-2xl font-semibold">Study</h1>
        <p className="mb-6 text-sm text-muted">{set.title}</p>

        <fieldset className="space-y-2">
          <legend className="sr-only">Which cards?</legend>
          {MODES.map((m) => (
            <label
              key={m.value}
              className={`flex cursor-pointer items-start gap-3 rounded-xl border-2 p-3 ${mode === m.value ? "border-primary bg-primary/5" : "border-muted/20"}`}
            >
              <input
                type="radio"
                name="deck-mode"
                checked={mode === m.value}
                onChange={() => setMode(m.value)}
                className="mt-1"
              />
              <span className="flex-1">
                <span className="block text-sm font-medium">
                  {m.label} <span className="text-muted">({counts[m.value]})</span>
                </span>
                <span className="block text-xs text-muted">{m.hint}</span>
              </span>
            </label>
          ))}
        </fieldset>

        <label className="mt-4 flex items-center gap-2 text-sm">
          <input type="checkbox" checked={shuffleOn} onChange={(e) => setShuffleOn(e.target.checked)} />
          Shuffle cards
        </label>

        <button
          type="button"
          onClick={() => start(deck, shuffleOn)}
          disabled={deck.length === 0}
          className="mt-6 w-full rounded-full bg-primary px-5 py-3 text-sm font-medium text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {deck.length === 0 ? "No cards in this group" : `Start · ${deck.length} ${deck.length === 1 ? "card" : "cards"}`}
        </button>
      </div>
    );
  }

  // ---- Results ----
  if (finished) {
    const score = scoreAnswers(answers);
    const missed = queue.filter((c) => score.missedIds.includes(c.id));
    return (
      <div className="mx-auto w-full max-w-xl max-sm:px-4 text-center">
        {back}
        <h1 className="mb-1 text-2xl font-semibold">
          {answers.length === 0 ? "Session ended" : "Nice work"}
        </h1>
        {answers.length > 0 ? (
          <p className="mb-4 text-sm text-muted">
            You knew {score.correct} of {score.total} cards you went through.
          </p>
        ) : (
          <p className="mb-4 text-sm text-muted">You didn&apos;t mark any cards, so nothing was saved.</p>
        )}
        <div className="mb-6 min-h-4">
          <SaveNote status={saver.status} onRetry={saver.retry} />
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
          {missed.length > 0 && (
            <button
              type="button"
              onClick={() => start(missed, shuffleOn)}
              className="rounded-full bg-primary px-5 py-2 text-sm font-medium text-white hover:opacity-90"
            >
              Review {missed.length} missed
            </button>
          )}
          <button
            type="button"
            onClick={() => {
              // Re-read the clock: cards just reviewed have new due times.
              setNow(new Date());
              setQueue(null);
            }}
            className="rounded-full border border-primary px-5 py-2 text-sm font-medium text-primary hover:bg-primary/5"
          >
            Study again
          </button>
          <Link
            href={`/learnings/study-sets/${setId}`}
            className="rounded-full border border-muted/30 px-5 py-2 text-sm font-medium hover:bg-muted/5"
          >
            Back to set
          </Link>
        </div>
      </div>
    );
  }

  // ---- Studying ----
  const card = queue[index];
  const progressPercent = Math.round((index / queue.length) * 100);
  return (
    <div className="mx-auto w-full max-w-xl max-sm:px-4">
      {back}
      <div className="mb-2 flex items-center justify-between text-sm text-muted">
        <span>
          Card {index + 1} of {queue.length}
        </span>
        <button type="button" onClick={() => finish(answers)} className="font-medium text-subtle hover:underline">
          End session
        </button>
      </div>
      <div
        className="mb-6 h-1.5 overflow-hidden rounded-full bg-muted/15"
        role="progressbar"
        aria-valuenow={progressPercent}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Session progress"
      >
        <div className="h-full rounded-full bg-primary transition-all" style={{width: `${progressPercent}%`}} />
      </div>

      <button
        type="button"
        onClick={() => setFlipped((f) => !f)}
        aria-label={flipped ? "Showing the answer. Click to see the question." : "Showing the question. Click to see the answer."}
        className="block w-full [perspective:1200px]"
      >
        <span
          className={`grid min-h-56 w-full transition-transform duration-500 motion-reduce:transition-none [transform-style:preserve-3d] ${flipped ? "[transform:rotateY(180deg)]" : ""}`}
        >
          <span className="col-start-1 row-start-1 flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-muted/20 bg-background text-foreground p-6 text-center [backface-visibility:hidden]">
            <span className="text-xs uppercase tracking-wide text-muted">Question</span>
            <span className="whitespace-pre-wrap text-lg font-semibold">{card.front}</span>
          </span>
          <span className="col-start-1 row-start-1 flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-primary/50 bg-background text-foreground p-6 text-center [backface-visibility:hidden] [transform:rotateY(180deg)]">
            <span className="text-xs uppercase tracking-wide text-muted">Answer</span>
            <span className="whitespace-pre-wrap text-lg">{card.back}</span>
          </span>
        </span>
      </button>
      <p className="mt-2 text-center text-xs text-muted">Click the card or press Space to flip</p>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => answer(false)}
          disabled={!flipped}
          className="rounded-full border border-amber-400 px-4 py-3 text-sm font-medium text-amber-700 hover:bg-amber-500/10 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Still learning <kbd className="ml-1 text-xs opacity-60">1</kbd>
        </button>
        <button
          type="button"
          onClick={() => answer(true)}
          disabled={!flipped}
          className="rounded-full bg-green-600 px-4 py-3 text-sm font-medium text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Got it <kbd className="ml-1 text-xs opacity-70">2</kbd>
        </button>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <button
          type="button"
          onClick={() => move(-1)}
          disabled={index === 0}
          aria-label="Previous card"
          className="rounded-full p-2 text-muted hover:bg-muted/10 disabled:opacity-30"
        >
          <Icon icon="lucide:arrow-left" size={18} />
        </button>
        <button
          type="button"
          onClick={() => move(1)}
          disabled={index + 1 >= queue.length}
          aria-label="Next card"
          className="rounded-full p-2 text-muted hover:bg-muted/10 disabled:opacity-30"
        >
          <Icon icon="lucide:arrow-right" size={18} />
        </button>
      </div>
    </div>
  );
}
