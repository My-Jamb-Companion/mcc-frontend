"use client";

import Link from "next/link";
import {useParams} from "next/navigation";
import {Icon} from "@mcc/ui";
import {useExamResult} from "../hooks/useExamHistory";

export default function ExamResultDetail() {
  const {sessionId} = useParams<{sessionId: string}>();
  const {data: result, isLoading, isError} = useExamResult(sessionId);

  return (
    <div>
      <Link
        href="/learnings/exams/history"
        className="mb-6 flex items-center gap-1 text-sm text-subtle hover:underline"
      >
        <Icon icon="lucide:chevron-left" size={16} />
        Back to history
      </Link>

      {isLoading ? (
        <p className="text-sm text-muted">Loading…</p>
      ) : isError || !result ? (
        <p className="text-sm text-muted">This result couldn&apos;t be found.</p>
      ) : (
        <div>
          <div className="flex flex-col items-center py-6 text-center">
            <div className="text-5xl font-extrabold tracking-tight">
              {result.score}
              <span className="text-2xl font-bold text-subtle">%</span>
            </div>
            <p className="mt-1 text-sm text-muted">
              {result.results.filter((r) => r.is_correct).length} / {result.results.length} correct
            </p>
          </div>

          <ul className="space-y-3">
            {result.results.map((answer, i) => (
              <li
                key={answer.question_id}
                className="rounded-xl border border-muted/20 p-4"
              >
                <div className="mb-2 flex items-start gap-2">
                  <div
                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${
                      answer.is_correct ? "bg-success/10 text-success" : "bg-danger/10 text-danger"
                    }`}
                  >
                    <Icon
                      icon={answer.is_correct ? "material-symbols:check-rounded" : "material-symbols:close-rounded"}
                      size={14}
                    />
                  </div>
                  <p className="text-sm font-medium">Question {i + 1}</p>
                </div>
                <p className="ml-8 text-sm text-muted">
                  Your answer: <span className="text-foreground">{answer.your_answer ?? "—"}</span>
                </p>
                {!answer.is_correct && answer.correct_answer && (
                  <p className="ml-8 text-sm text-muted">
                    Correct answer: <span className="text-success">{answer.correct_answer}</span>
                  </p>
                )}
                {answer.explanation && (
                  <p className="ml-8 mt-1 text-sm text-muted">{answer.explanation}</p>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
