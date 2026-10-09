"use client";

import {Icon} from "@mcc/ui";
import {useState} from "react";
import {useQuery} from "@tanstack/react-query";
import {searchRecipients} from "../services/recipients.service";

export interface RecipientOption {
  id: string;
  name: string;
  email: string;
  role: "student" | "teacher";
}

export default function RecipientPicker({
  value,
  onChange,
}: {
  value: RecipientOption | null;
  onChange: (recipient: RecipientOption | null) => void;
}) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);

  const {data: results = [], isFetching} = useQuery({
    queryKey: ["recipients-search", query],
    queryFn: () =>
      searchRecipients(query).then((rows) =>
        rows.map(
          (r): RecipientOption => ({
            id: r.user_id,
            name: r.full_name,
            email: r.email,
            role: r.role,
          }),
        ),
      ),
    enabled: open && query.trim().length > 0,
  });

  if (value) {
    return (
      <div className="flex items-center justify-between rounded-xl border border-neutral-200 bg-neutral-50/50 px-4 py-3">
        <div>
          <p className="text-sm font-semibold text-neutral-900">{value.name}</p>
          <p className="text-xs text-neutral-500">
            {value.email} · {value.role}
          </p>
        </div>
        <button
          type="button"
          onClick={() => onChange(null)}
          className="text-neutral-400 hover:text-neutral-600"
          aria-label="Change recipient"
        >
          <Icon icon="mdi:close" size={16} />
        </button>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="relative">
        <Icon
          icon="mdi:magnify"
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
        />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setOpen(true)}
          placeholder="Search a student or teacher by name or email"
          className="w-full rounded-xl border border-neutral-200 py-2.5 pl-9 pr-4 text-sm text-neutral-900 outline-none placeholder:text-neutral-400 focus:border-neutral-400"
        />
      </div>

      {open && query.trim().length > 0 && (
        <div className="absolute left-0 right-0 top-[calc(100%+6px)] z-10 max-h-56 overflow-y-auto rounded-xl border border-neutral-200 bg-white shadow-lg">
          {isFetching && (
            <p className="px-4 py-3 text-sm text-neutral-400">Searching…</p>
          )}
          {!isFetching && results.length === 0 && (
            <p className="px-4 py-3 text-sm text-neutral-400">No matches found.</p>
          )}
          {results.map((r) => (
            <button
              key={r.id}
              type="button"
              onClick={() => {
                onChange(r);
                setOpen(false);
                setQuery("");
              }}
              className="flex w-full flex-col items-start px-4 py-2.5 text-left hover:bg-neutral-50"
            >
              <span className="text-sm font-medium text-neutral-900">{r.name}</span>
              <span className="text-xs text-neutral-500">
                {r.email} · {r.role}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

