"use client";

import Link from "next/link";
import {Icon} from "@mcc/ui";
import {useStudySets} from "../hooks/useFlashcards";

function formatWhen(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function StudySetList() {
  const {studySets, isLoading} = useStudySets();

  return (
    <div>
      <div className="mb-6 flex items-center gap-2">
        <Link href="/brainy" className="text-sm text-subtle hover:underline">
          Brainy
        </Link>
        <span className="text-subtle">/</span>
        <span className="text-sm text-muted/50">Study sets</span>
      </div>

      <h1 className="mb-6 text-2xl font-semibold">Your study sets</h1>

      {isLoading ? (
        <p className="text-sm text-muted">Loading…</p>
      ) : studySets.length === 0 ? (
        <p className="text-sm text-muted">
          No saved study sets yet -- generate flashcards from your notes in Brainy and save
          them here.
        </p>
      ) : (
        <ul className="space-y-2">
          {studySets.map((set) => (
            <li key={set.set_id}>
              <Link
                href={`/learnings/study-sets/${set.set_id}`}
                className="flex items-center justify-between rounded-xl border border-muted/20 px-4 py-3 transition-colors hover:bg-muted/5"
              >
                <div>
                  <p className="text-sm font-medium">{set.title}</p>
                  <p className="text-xs text-muted">
                    {set.subject} · {formatWhen(set.created_at)}
                  </p>
                </div>
                <Icon icon="lucide:chevron-right" size={16} className="text-muted" />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
