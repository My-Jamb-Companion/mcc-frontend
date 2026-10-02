"use client";

import {useEffect, useState} from "react";
import Link from "next/link";
import {useParams} from "next/navigation";
import {Icon} from "@mcc/ui";
import {useStudySet} from "../hooks/useFlashcards";
import {useSessionSaver} from "../hooks/useSessionSaver";
import {buildQuiz, scoreAnswers, shuffle, type Answer, type QuizQuestion, type StudyCard} from "../helper/studySession";
import type {StudySetDetail} from "../services/flashcards.service";
import SaveNote from "./SaveNote";

const LENGTHS = [10, 20];

export default function QuizSession() {
  const {setId} = useParams<{setId: string}>();
  const {data: set, isLoading} = useStudySet(setId);

  if (isLoading) return <p className="text-sm text-muted">Loading…</p>;
  if (!set) return <p className="text-sm text-muted">This study set couldn&apos;t be found.</p>;
  return <Quiz set={set} setId={setId} />;
}

interface Taken {
  answer: Answer;
  question: QuizQuestion;
  /** What the student picked or typed, for the review list. */
  given: string;
}

function Quiz({set, setId}: {set: StudySetDetail; setId: string}) {
  const saver = useSessionSaver(setId);
  const cards = set.content;

  const [questions, setQuestions] = useState<QuizQuestion[] | null>(null);
  const [index, setIndex] = useState(0);
  const [taken, setTaken] = useState<Taken[]>([]);
  const [finished, setFinished] = useState(false);

  // Per-question state
  const [picked, setPicked] = useState<number | null>(null);
  const [typed, setTyped] = useState("");
  const [revealed, setRevealed] = useState(false);

  function start(subset: StudyCard[]) {
    // Wrong answers always come from the whole set, even when retrying a few cards.
    setQuestions(buildQuiz(subset, Math.random, cards));
    setIndex(0);
    setTaken([]);
    setFinished(false);
    resetQuestion();
  }

  function resetQuestion() {
    setPicked(null);
    setTyped("");
    setRevealed(false);
  }

  function record(correct: boolean, given: string) {
    if (!questions) return;
    const question = questions[index];
    const next = [...taken, {answer: {cardId: question.card.id, correct}, question, given}];
    setTaken(next);
    if (index + 1 >= questions.length) {
      setFinished(true);
      saver.save(next.map((t) => t.answer));
    } else {
      setIndex(index + 1);
      resetQuestion();
    }
  }

  const q = questions?.[index];
  const answeredChoice = q?.kind === "choice" && picked !== null;

  useEffect(() => {
    if (!q || finished) return;
    function onKey(e: KeyboardEvent) {
      const t = e.target as HTMLElement | null;
      if (t && ["INPUT", "TEXTAREA", "SELECT"].includes(t.tagName)) return;
      if (e.metaKey || e.ctrlKey || e.altKey || !q) return;
      if (q.kind === "choice") {
        const n = Number(e.key);
        if (picked === null && n >= 1 && n <= q.choices.length) setPicked(n - 1);
        else if (picked !== null && e.key === "Enter" && !(t && ["BUTTON", "A"].includes(t.tagName))) {
          e.preventDefault();
          record(picked === q.answerIndex, q.choices[picked]);
        }
      }
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

  // ---- Intro ----
  if (!questions) {
    const options = [...LENGTHS.filter((n) => n < cards.length), cards.length];
    return (
      <div className="mx-auto w-full max-w-xl max-sm:px-4">
        {back}
        <h1 className="mb-1 text-2xl font-semibold">Quiz</h1>
        <p className="mb-6 text-sm text-muted">
          {set.title} ·{" "}
          {cards.length >= 4
            ? "Pick the right answer for each question."
            : "This set has fewer than 4 cards, so you'll type each answer, then check yourself."}
        </p>
        <p className="mb-2 text-sm font-medium">How many questions?</p>
        <div className="flex flex-wrap gap-2">
          {options.map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => start(shuffle(cards).slice(0, n))}
              className="rounded-full border-2 border-primary px-5 py-2 text-sm font-medium text-primary hover:bg-primary/5"
            >
              {n === cards.length ? `All ${n}` : n}
            </button>
          ))}
        </div>
      </div>
    );
  }

  // ---- Results ----
  if (finished) {
    const score = scoreAnswers(taken.map((t) => t.answer));
    const missed = taken.filter((t) => !t.answer.correct);
    return (
      <div className="mx-auto w-full max-w-xl max-sm:px-4">
        {back}
        <div className="text-center">
          <p className="text-5xl font-semibold">{score.percent}%</p>
          <p className="mt-1 text-sm text-muted">
            {score.correct} of {score.total} correct
          </p>
          <div className="mt-3 min-h-4">
            <SaveNote status={saver.status} onRetry={saver.retry} />
          </div>
        </div>

        {missed.length > 0 && (
          <section className="mt-6">
            <h2 className="mb-2 text-sm font-semibold">Review what you missed</h2>
            <ul className="space-y-2">
              {missed.map((t) => (
                <li key={t.answer.cardId} className="rounded-xl border border-muted/20 p-3 text-sm">
                  <p className="font-medium">{t.question.card.front}</p>
                  {t.given && <p className="text-danger">You said: {t.given}</p>}
                  <p className="text-green-600">Answer: {t.question.card.back}</p>
                </li>
              ))}
            </ul>
          </section>
        )}

        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
          {missed.length > 0 && (
            <button
              type="button"
              onClick={() => start(missed.map((t) => t.question.card))}
              className="rounded-full bg-primary px-5 py-2 text-sm font-medium text-white hover:opacity-90"
            >
              Retry {missed.length} missed
            </button>
          )}
          <button
            type="button"
            onClick={() => setQuestions(null)}
            className="rounded-full border border-primary px-5 py-2 text-sm font-medium text-primary hover:bg-primary/5"
          >
            New quiz
          </button>
          <Link
            href={`/learnings/study-sets/${setId}`}
            className="rounded-full border border-muted/30 px-5 py-2 text-center text-sm font-medium hover:bg-muted/5"
          >
            Back to set
          </Link>
        </div>
      </div>
    );
  }

  // ---- Question ----
  if (!q) return null;
  const percent = Math.round((index / questions.length) * 100);
  return (
    <div className="mx-auto w-full max-w-xl max-sm:px-4">
      {back}
      <div className="mb-2 flex items-center justify-between text-sm text-muted">
        <span>
          Question {index + 1} of {questions.length}
        </span>
      </div>
      <div
        className="mb-6 h-1.5 overflow-hidden rounded-full bg-muted/15"
        role="progressbar"
        aria-valuenow={percent}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Quiz progress"
      >
        <div className="h-full rounded-full bg-primary transition-all" style={{width: `${percent}%`}} />
      </div>

      <h1 className="mb-5 whitespace-pre-wrap text-lg font-semibold">{q.card.front}</h1>

      {q.kind === "choice" ? (
        <>
          <ul className="space-y-2">
            {q.choices.map((choice, i) => {
              const isAnswer = i === q.answerIndex;
              const state =
                picked === null
                  ? "border-muted/20 hover:border-primary hover:bg-primary/5"
                  : isAnswer
                    ? "border-green-500 bg-green-500/10"
                    : i === picked
                      ? "border-danger bg-danger/5"
                      : "border-muted/20 opacity-60";
              return (
                <li key={i}>
                  <button
                    type="button"
                    disabled={picked !== null}
                    onClick={() => setPicked(i)}
                    className={`flex w-full items-start gap-3 rounded-xl border-2 p-3 text-left text-sm ${state}`}
                  >
                    <kbd className="mt-0.5 text-xs text-muted">{i + 1}</kbd>
                    <span className="flex-1 whitespace-pre-wrap">{choice}</span>
                    {picked !== null && isAnswer && <Icon icon="lucide:check" size={16} className="text-green-600" />}
                    {picked === i && !isAnswer && <Icon icon="lucide:x" size={16} className="text-danger" />}
                  </button>
                </li>
              );
            })}
          </ul>
          {answeredChoice && (
            <button
              type="button"
              onClick={() => record(picked === q.answerIndex, q.choices[picked as number])}
              className="mt-5 w-full rounded-full bg-primary px-5 py-3 text-sm font-medium text-white hover:opacity-90"
            >
              {index + 1 >= questions.length ? "See results" : "Next"}
            </button>
          )}
        </>
      ) : (
        <>
          <textarea
            value={typed}
            onChange={(e) => setTyped(e.target.value)}
            disabled={revealed}
            rows={3}
            placeholder="Type your answer (optional)"
            aria-label="Your answer"
            className="w-full rounded-xl border-2 border-muted/20 p-3 text-sm outline-none focus-visible:border-primary"
          />
          {!revealed ? (
            <button
              type="button"
              onClick={() => setRevealed(true)}
              className="mt-4 w-full rounded-full bg-primary px-5 py-3 text-sm font-medium text-white hover:opacity-90"
            >
              Show answer
            </button>
          ) : (
            <>
              <div className="mt-4 rounded-xl border-2 border-primary/40 bg-primary/5 p-3 text-sm">
                <p className="text-xs uppercase tracking-wide text-muted">Answer</p>
                <p className="whitespace-pre-wrap">{q.card.back}</p>
              </div>
              <p className="mt-4 mb-2 text-sm font-medium">Did you get it right?</p>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => record(false, typed.trim())}
                  className="rounded-full border border-amber-400 px-4 py-3 text-sm font-medium text-amber-700 hover:bg-amber-500/10"
                >
                  Not quite
                </button>
                <button
                  type="button"
                  onClick={() => record(true, typed.trim())}
                  className="rounded-full bg-green-600 px-4 py-3 text-sm font-medium text-white hover:bg-green-700"
                >
                  Got it
                </button>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
