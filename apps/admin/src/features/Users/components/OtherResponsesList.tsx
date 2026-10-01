"use client";

import {Icon} from "@mcc/ui";
import {OnboardingOtherResponse} from "../services/users.service";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

interface OtherResponsesListProps {
  title: string;
  items: OnboardingOtherResponse[];
  isLoading: boolean;
}

/** Free text has no sensible chart -- just the verbatim answers, newest
 * first, with enough context (who, when) for an admin to follow up.
 * Shared between ReferralSourceDashboard and PurposeDashboard. */
export default function OtherResponsesList({title, items, isLoading}: OtherResponsesListProps) {
  return (
    <div className="rounded-2xl border border-neutral-100 bg-white px-4 py-6">
      <h3 className="mb-4 text-lg font-semibold text-neutral-900">{title}</h3>

      {isLoading ? (
        <p className="py-8 text-center text-sm text-slate-400">Loading…</p>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-8 text-center">
          <Icon icon="ri:chat-quote-line" size={24} className="text-neutral-300" />
          <p className="text-sm text-slate-400">No &ldquo;Others&rdquo; responses yet.</p>
        </div>
      ) : (
        <ul className="divide-y divide-neutral-100">
          {items.map((item) => (
            <li key={`${item.user_id}-${item.created_at}`} className="flex flex-col gap-1 py-3">
              <p className="text-sm text-neutral-800">&ldquo;{item.text}&rdquo;</p>
              <p className="text-xs text-neutral-400">
                {item.full_name || item.email} &middot; {formatDate(item.created_at)}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
