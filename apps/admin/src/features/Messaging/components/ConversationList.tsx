"use client";

import {Icon} from "@mcc/ui";
import {useEffect, useState} from "react";
import {useConversations} from "../hooks/useConversations";
import {displayName, listTime, previewLine} from "../helper/messaging";

/** The inbox: everyone the team has messaged or heard from, with what is waiting for a reply marked. */
export default function ConversationList({selectedId, onSelect}: {selectedId: string | null; onSelect: (userId: string) => void}) {
  const [search, setSearch] = useState("");
  const [q, setQ] = useState("");
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [page, setPage] = useState(1);

  // Search once typing pauses, from the first page.
  useEffect(() => {
    const timer = setTimeout(() => {
      setQ(search.trim());
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const {data, isPending, isError, refetch} = useConversations({q, unread: unreadOnly, page, limit: 20});

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="space-y-2 border-b border-neutral-100 p-3">
        <div className="relative">
          <Icon icon="mdi:magnify" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search conversations"
            placeholder="Search by name or email"
            className="w-full rounded-xl border border-neutral-200 py-2 pl-9 pr-3 text-sm outline-none placeholder:text-neutral-400 focus:border-neutral-400"
          />
        </div>
        <label className="flex cursor-pointer items-center gap-2 text-xs text-neutral-600">
          <input type="checkbox" checked={unreadOnly} onChange={(e) => { setUnreadOnly(e.target.checked); setPage(1); }} />
          Only conversations waiting for a reply
        </label>
      </div>

      <ul className="min-h-0 flex-1 divide-y divide-neutral-100 overflow-y-auto">
        {isPending && !isError && <li className="px-4 py-8 text-center text-sm text-neutral-400">Loading…</li>}
        {isError && (
          <li className="px-4 py-8 text-center text-sm text-red-500">
            The inbox couldn&apos;t be loaded. <button type="button" onClick={() => void refetch()} className="font-semibold underline">Try again</button>
          </li>
        )}
        {data && data.items.length === 0 && (
          <li className="px-4 py-10 text-center text-sm text-neutral-400">
            {q || unreadOnly ? "No conversations match." : "No conversations yet. Send a message to start one."}
          </li>
        )}
        {data?.items.map((c) => {
          const waiting = c.unread_count > 0;
          return (
            <li key={c.user_id}>
              <button
                type="button"
                onClick={() => onSelect(c.user_id)}
                aria-current={selectedId === c.user_id}
                className={`flex w-full flex-col gap-0.5 px-4 py-3 text-left hover:bg-neutral-50 ${selectedId === c.user_id ? "bg-neutral-100" : ""}`}
              >
                <span className="flex items-center justify-between gap-2">
                  <span className={`truncate text-sm ${waiting ? "font-semibold text-neutral-900" : "font-medium text-neutral-800"}`}>{displayName(c)}</span>
                  <span className="shrink-0 text-xs text-neutral-400">{listTime(c.last_at)}</span>
                </span>
                <span className="flex items-center justify-between gap-2">
                  <span className={`truncate text-xs ${waiting ? "text-neutral-700" : "text-neutral-500"}`}>{previewLine(c)}</span>
                  {waiting && (
                    <span aria-label={`${c.unread_count} unread`} className="min-w-5 shrink-0 rounded-full bg-neutral-900 px-1.5 text-center text-[11px] font-semibold leading-5 text-white">
                      {c.unread_count}
                    </span>
                  )}
                </span>
                <span className="text-[11px] capitalize text-neutral-400">{c.role}</span>
              </button>
            </li>
          );
        })}
      </ul>

      {data && data.pages > 1 && (
        <div className="flex items-center justify-between border-t border-neutral-100 px-3 py-2 text-xs text-neutral-500">
          <button type="button" disabled={page <= 1} onClick={() => setPage(page - 1)} className="rounded-lg px-2 py-1 hover:bg-neutral-100 disabled:opacity-40">Previous</button>
          <span>Page {data.page} of {data.pages}</span>
          <button type="button" disabled={page >= data.pages} onClick={() => setPage(page + 1)} className="rounded-lg px-2 py-1 hover:bg-neutral-100 disabled:opacity-40">Next</button>
        </div>
      )}
    </div>
  );
}
