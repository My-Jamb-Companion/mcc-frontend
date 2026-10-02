"use client";

import {useMemo, useState} from "react";
import Link from "next/link";
import {Icon} from "@mcc/ui";
import {useStudySets} from "../hooks/useFlashcards";
import {filterSets, sortSets, studiedLabel, type SortMode} from "../helper/studySetList";

const SORTS: {value: SortMode; label: string}[] = [
  {value: "newest", label: "Newest"},
  {value: "az", label: "A–Z"},
  {value: "due", label: "Most to review"},
];

export default function StudySetList() {
  const {studySets, isLoading} = useStudySets();
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortMode>("newest");

  const visible = useMemo(() => sortSets(filterSets(studySets, query), sort), [studySets, query, sort]);

  return (
    <div className="max-sm:px-4">
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
        <>
          <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Icon
                icon="lucide:search"
                size={16}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted"
              />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by title or subject"
                aria-label="Search study sets"
                className="w-full rounded-full border border-muted/20 bg-transparent py-2 pl-9 pr-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
              />
            </div>
            <label className="flex items-center gap-2 text-sm text-muted">
              Sort
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as SortMode)}
                className="rounded-full border border-muted/20 bg-transparent px-3 py-2 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
              >
                {SORTS.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {visible.length === 0 ? (
            <p className="text-sm text-muted">No study sets match “{query.trim()}”.</p>
          ) : (
            <ul className="space-y-2">
              {visible.map((set) => (
                <li key={set.set_id}>
                  <Link
                    href={`/learnings/study-sets/${set.set_id}`}
                    className="flex items-center justify-between gap-3 rounded-xl border border-muted/20 px-4 py-3 transition-colors hover:bg-muted/5"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{set.title}</p>
                      <p className="truncate text-xs text-muted">
                        {set.subject} · {set.card_count} {set.card_count === 1 ? "card" : "cards"} ·{" "}
                        {studiedLabel(set.last_studied_at)}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      {set.due_count > 0 ? (
                        <span className="rounded-full bg-purple-100 px-2.5 py-1 text-xs font-medium text-purple-700">
                          {set.due_count} to review
                        </span>
                      ) : (
                        <span className="rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-700">
                          All caught up
                        </span>
                      )}
                      <Icon icon="lucide:chevron-right" size={16} className="text-muted" />
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  );
}
