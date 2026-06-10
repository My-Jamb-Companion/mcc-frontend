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
  totalSteps: number;
  currentStep: number;
  upNext?: string; // shown on correct answer, e.g. "module 4"
}

interface PracticeCardProps {
  problem: Problem;
  onCorrect?: () => void;
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

export function CoursePractice({
  problem,
  onCorrect,
  onUpNext,
}: PracticeCardProps) {
  const [answer, setAnswer] = useState("");
  const [state, setState] = useState<AnswerState>("idle");

  const handleCheck = () => {
    if (!answer.trim()) return;
    const correct =
      answer.trim().toLowerCase() ===
      problem.correctAnswer.trim().toLowerCase();
    setState(correct ? "correct" : "incorrect");
    if (correct) onCorrect?.();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleCheck();
  };

  const inputBorderClass =
    state === "correct"
      ? "border-green-400 bg-green-50 focus:ring-green-200"
      : state === "incorrect"
        ? "border-red-400 bg-red-50 focus:ring-red-200"
        : "border-gray-200 bg-white focus:ring-violet-100";

  return (
    <div className="w-full h-full bg-gray-50 rounded-2xl p-6 font-sans">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-[11px] font-semibold tracking-widest text-gray-400 uppercase mb-0.5">
            {problem.label}
          </p>
          <h3 className="text-base font-bold text-gray-900">{problem.title}</h3>
        </div>
        <div className="pt-1">
          <ProgressBar
            total={problem.totalSteps}
            current={problem.currentStep}
          />
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-gray-200 mb-5" />

      {/* Question */}
      <p className="text-sm font-medium text-gray-700 mb-4">
        {problem.question}
      </p>

      {/* Answer row */}
      <div className="flex items-center gap-2 mb-4">
        {/* Status icon */}
        <div className="w-6 h-6 flex-shrink-0 flex items-center justify-center">
          <AnimatePresence mode="wait">
            {state === "incorrect" && (
              <motion.div
                key="incorrect"
                initial={{scale: 0, rotate: -45}}
                animate={{scale: 1, rotate: 0}}
                exit={{scale: 0}}
                transition={{type: "spring", stiffness: 300, damping: 15}}
              >
                <XCircle className="w-6 h-6 text-red-500" />
              </motion.div>
            )}
            {state === "correct" && (
              <motion.div
                key="correct"
                initial={{scale: 0, rotate: 45}}
                animate={{scale: 1, rotate: 0}}
                exit={{scale: 0}}
                transition={{type: "spring", stiffness: 300, damping: 15}}
              >
                <CheckCircle className="w-6 h-6 text-green-500" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Input */}
        <motion.input
          type="text"
          value={answer}
          onChange={(e) => {
            setAnswer(e.target.value);
            if (state !== "idle") setState("idle");
          }}
          onKeyDown={handleKeyDown}
          placeholder={problem.answerPlaceholder}
          disabled={state === "correct"}
          animate={state === "incorrect" ? {x: [-6, 6, -6, 6, -3, 3, 0]} : {}}
          transition={{duration: 0.4}}
          className={`w-40 border rounded-lg px-3 py-2 text-sm text-gray-700 placeholder:text-gray-400 outline-none focus:ring-2 transition-all ${inputBorderClass} disabled:cursor-not-allowed`}
        />
      </div>

      {/* Action button */}
      <div className="h-10 mt-2 flex items-center">
        <AnimatePresence mode="wait">
          {state === "correct" && problem.upNext ? (
            <motion.button
              key="up-next"
              initial={{opacity: 0, y: 10}}
              animate={{opacity: 1, y: 0}}
              exit={{opacity: 0, y: -10}}
              transition={{duration: 0.2}}
              onClick={onUpNext}
              className="px-4 py-2 text-sm font-medium border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors"
            >
              Up Next: {problem.upNext}
            </motion.button>
          ) : (
            <motion.button
              key="check"
              initial={{opacity: 0, y: 10}}
              animate={{opacity: 1, y: 0}}
              exit={{opacity: 0, y: -10}}
              transition={{duration: 0.2}}
              onClick={handleCheck}
              disabled={!answer.trim()}
              className="px-4 py-2 text-sm font-medium border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Check
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
