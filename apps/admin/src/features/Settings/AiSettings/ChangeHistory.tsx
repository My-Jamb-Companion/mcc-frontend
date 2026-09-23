"use client";

import {useModelHistory} from "./hooks/useAiSettings";

const when = (iso: string) =>
  new Date(iso).toLocaleString("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

export default function ChangeHistory() {
  const {data: history, isLoading} = useModelHistory();

  return (
    <section className="rounded-2xl border border-neutral-100 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-bold text-neutral-900">Change history</h2>
      <p className="mt-1 text-base text-neutral-700">Every time the active model has been switched, newest first.</p>
      {isLoading ? (
        <p className="mt-4 text-base text-neutral-600">Loading…</p>
      ) : !history?.length ? (
        <p className="mt-4 text-base text-neutral-600">No changes yet -- still the environment default.</p>
      ) : (
        <ul className="mt-4 divide-y divide-neutral-100">
          {history.map((entry, i) => (
            <li key={`${entry.model_id}-${entry.changed_at ?? i}`} className="py-3">
              <span className="text-base font-semibold text-neutral-900">{entry.model_id}</span>
              <p className="mt-0.5 text-sm text-neutral-600">
                {entry.changed_by_name ?? "Unknown admin"}
                {entry.changed_at ? ` · ${when(entry.changed_at)}` : ""}
              </p>
              {entry.change_reason && (
                <p className="mt-0.5 text-base text-neutral-700 break-words">{entry.change_reason}</p>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
