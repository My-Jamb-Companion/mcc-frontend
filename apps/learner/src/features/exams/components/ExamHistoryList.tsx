"use client";

import Link from "next/link";
import {Icon} from "@mcc/ui";
import {useExamHistory} from "../hooks/useExamHistory";

const ACTIVITY_LABEL: Record<string, string> = {
  quiz: "Quiz",
  practice: "Practice",
  exam: "Mock exam",
};

function formatWhen(iso: string): string {
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function ExamHistoryList() {
  const {history, isLoading} = useExamHistory();

  return (
    <div>
      <div className="mb-6 flex items-center gap-2">
        <Link href="/learnings/exams" className="text-sm text-subtle hover:underline">
          Exam prep
        </Link>
        <span className="text-subtle">/</span>
        <span className="text-sm text-muted/50">History</span>
      </div>

      <h1 className="mb-6 text-2xl font-semibold">Your testing history</h1>

      {isLoading ? (
        <p className="text-sm text-muted">Loading…</p>
      ) : history.length === 0 ? (
        <p className="text-sm text-muted">
          No graded quizzes, practice sets or mock exams yet -- take one to see it here.
        </p>
      ) : (
        <ul className="space-y-2">
          {history.map((item) => (
            <li key={item.session_id}>
              <Link
                href={`/learnings/exams/history/${item.session_id}`}
                className="flex items-center justify-between rounded-xl border border-muted/20 px-4 py-3 transition-colors hover:bg-muted/5"
              >
                <div>
                  <p className="text-sm font-medium">
                    {ACTIVITY_LABEL[item.activity_type] ?? item.activity_type}
                  </p>
                  <p className="text-xs text-muted">{formatWhen(item.timestamp)}</p>
                </div>
                <div className="flex items-center gap-3">
                  {item.score !== null && (
                    <span
                      className={`text-sm font-semibold ${item.score >= 50 ? "text-success" : "text-danger"}`}
                    >
                      {item.score}%
                    </span>
                  )}
                  <Icon icon="lucide:chevron-right" size={16} className="text-muted" />
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
