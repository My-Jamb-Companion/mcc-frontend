"use client";

import {useState} from "react";
import {XCircle, CheckCircle} from "lucide-react";
import {motion, AnimatePresence} from "@mcc/ui";

// ─── Types ───────────────────────────────────────────────────────────────────

type AnswerState = "idle" | "correct" | "incorrect";

interface Problem {
  id: string;
  label: string; // e.g. "PROBLEM 1"
  title: string; // e.g. "Now, lets Practice"
  question: string; // e.g. "Q1..."
  answerPlaceholder: string; // e.g. "A1..."
  correctAnswer: string;
}

interface CourseExcerciseProps {
  problems: Problem[];
  upNext?: string; // shown once all problems are answered correctly
  onCorrect?: (problem: Problem, index: number) => void;
  onUpNext?: () => void;
}

// ─── Progress bar ─────────────────────────────────────────────────────────────

function ProgressBar({total, current}: {total: number; current: number}) {
  return (
    <div className="flex items-center gap-1">
      {Array.from({length: total}).map((_, i) => (
        <div
          key={i}
          className={`h-1 rounded-full transition-all duration-300 ${
            i < current ? "bg-violet-500 w-7" : "bg-gray-300 w-7"
          }`}
        />
      ))}
    </div>
  );
}

// ─── PracticeCard ─────────────────────────────────────────────────────────────

export function CourseExcercise({
  problems,
  onCorrect,
  onUpNext,
}: CourseExcerciseProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [state, setState] = useState<AnswerState>("idle");

  const isComplete = currentIndex >= problems.length;
  const problem = !isComplete ? problems[currentIndex] : null;

  const handleCheck = () => {
    if (!problem || !answer.trim()) return;
    const correct =
      answer.trim().toLowerCase() ===
      problem.correctAnswer.trim().toLowerCase();

    setState(correct ? "correct" : "incorrect");

    if (correct) {
      onCorrect?.(problem, currentIndex);

      // brief pause so the correct-state checkmark is visible before advancing
      setTimeout(() => {
        setCurrentIndex((prev) => prev + 1);
        setAnswer("");
        setState("idle");
      }, 600);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleCheck();
  };

  const inputBorderClass =
    state === "correct"
      ? "border-green-400 bg-green-50 focus:ring-green-200 dark:text-black"
      : state === "incorrect"
        ? "border-red-400 bg-red-50 focus:ring-red-200 dark:text-black"
        : "border-gray-200 bg-white dark:bg-gray-700  text-gray-700 dark:text-white";

  return (
    <div className="w-full h-full bg-gray-50 dark:bg-[#222225] rounded-2xl p-6 font-sans">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-[11px] font-semibold tracking-widest text-gray-400 uppercase mb-0.5">
            Excercise {currentIndex + 1}
          </p>
          <h3 className="text-base font-bold text-gray-900 dark:text-white">
            {isComplete ? "All done!" : problem?.title}
          </h3>
        </div>
        <div className="pt-1">
          <ProgressBar
            total={problems.length}
            current={isComplete ? problems.length : currentIndex}
          />
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-gray-200 dark:border-gray-600 mb-5" />

      <AnimatePresence mode="wait">
        {!isComplete ? (
          <motion.div
            key={problem?.id ?? currentIndex}
            initial={{opacity: 0, y: 8}}
            animate={{opacity: 1, y: 0}}
            exit={{opacity: 0, y: -8}}
            transition={{duration: 0.25, ease: [0.22, 1, 0.36, 1]}}
          >
            {/* Question */}
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
              {problem?.question}
            </p>

            {/* Answer row */}
            <div className="flex items-center gap-2 mb-4">
              {/* Status icon */}

              {/* Input */}
              <motion.input
                type="text"
                value={answer}
                onChange={(e) => {
                  setAnswer(e.target.value);
                  if (state !== "idle") setState("idle");
                }}
                onKeyDown={handleKeyDown}
                placeholder={problem?.answerPlaceholder}
                disabled={state === "correct"}
                animate={
                  state === "incorrect" ? {x: [-6, 6, -6, 6, -3, 3, 0]} : {}
                }
                transition={{duration: 0.4}}
                className={`w-40 border rounded-lg px-3 py-2 text-sm placeholder:text-gray-400 outline-none transition-all ${inputBorderClass} disabled:cursor-not-allowed`}
              />
            </div>

            {/* Check button */}
            <div className="h-10 mt-2 flex items-center">
              <button
                onClick={handleCheck}
                disabled={!answer.trim() || state === "correct"}
                className="px-4 py-2 text-sm font-medium border border-gray-300 dark:border-0 rounded-lg text-gray-700 bg-white dark:bg-gray-700 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Check
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="complete"
            initial={{opacity: 0, y: 8}}
            animate={{opacity: 1, y: 0}}
            transition={{duration: 0.25, ease: [0.22, 1, 0.36, 1]}}
          >
            <p className="text-sm font-medium text-gray-700 dark:text-white mb-4">
              You&apos;ve completed all {problems.length} problems.
            </p>

            <div className="h-10 mt-2 flex items-center ">
              <motion.button
                initial={{opacity: 0, y: 10}}
                animate={{opacity: 1, y: 0}}
                transition={{duration: 0.2}}
                onClick={onUpNext}
                className="px-4 py-2 text-sm font-medium border border-gray-300 dark:border-0 rounded-lg text-gray-700 bg-white dark:bg-gray-700 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Next Module
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
