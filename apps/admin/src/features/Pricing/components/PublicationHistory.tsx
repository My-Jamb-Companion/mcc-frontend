"use client";

import Link from "next/link";
import {useState} from "react";
import {showSuccess} from "@mcc/ui";
import {useCancelPublication, useConfirmPublication} from "../hooks/usePublications";
import type {ApiPublication} from "../services/publications.service";
import {pricingErrorMessage} from "../services/pricing.service";

const naira = (v: string | number) => `₦${new Intl.NumberFormat("en-NG", {maximumFractionDigits: 0}).format(Number(v))}`;
const when = (iso: string) =>
  new Date(iso).toLocaleString("en-NG", {day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit"});

/**
 * Publications, newest first. A pending one can be confirmed by a different
 * admin (D9) or cancelled; showProgram is for lists spanning several programs.
 */
export default function PublicationHistory({
  publications,
  showProgram = false,
  emptyText,
}: {
  publications: ApiPublication[];
  showProgram?: boolean;
  emptyText?: string;
}) {
  if (publications.length === 0) {
    return emptyText ? <p className="text-sm text-neutral-400">{emptyText}</p> : null;
  }
  return (
    <div>
      {!showProgram && <h3 className="text-sm font-semibold text-neutral-900">Publication history</h3>}
      <ul className="mt-2 divide-y divide-neutral-100">
        {publications.map((p) => <PublicationItem key={p.publication_id} publication={p} showProgram={showProgram} />)}
      </ul>
    </div>
  );
}

function PublicationItem({publication: p, showProgram}: {publication: ApiPublication; showProgram: boolean}) {
  const confirm = useConfirmPublication();
  const cancel = useCancelPublication();
  const [cancelling, setCancelling] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [error, setError] = useState<string | null>(null);

  const status = p.in_force
    ? {label: "In force", tone: "bg-green-50 text-green-700"}
    : p.status === "pending"
      ? {label: "Waiting for a second admin", tone: "bg-amber-50 text-amber-800"}
      : p.status === "cancelled"
        ? {label: "Cancelled", tone: "bg-neutral-100 text-neutral-500"}
        : {label: "Replaced", tone: "bg-neutral-100 text-neutral-500"};
  const editionHref = `/finance/pricing/programs/${p.program_type}/${encodeURIComponent(p.program_id)}/${p.edition}`;

  const onError = (e: unknown) => setError(pricingErrorMessage(e, "That didn't work."));

  return (
    <li className="py-3">
      <div className="flex flex-wrap items-center gap-2">
        <p className="text-sm font-semibold text-neutral-900">
          {showProgram ? (
            <Link href={editionHref} className="hover:text-violet-700">
              {p.program_title} · {p.edition === "premium" ? "Premium" : "Standard"}
            </Link>
          ) : (
            `Publication ${p.publication_number}`
          )}
        </p>
        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${status.tone}`}>{status.label}</span>
      </div>
      <p className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm tabular-nums text-neutral-700">
        {p.tiers.map((t) => (
          <span key={t.tier_id} className={t.below_hard_floor ? "text-amber-700" : undefined}
            title={t.override_reason ? `Override: ${t.override_reason}` : t.capped ? `Capped; formula ${naira(t.formula_price)}` : undefined}>
            {t.tier_name.split(" · ")[0]} {naira(t.price)}
            {t.below_hard_floor ? " (below floor)" : ""}
          </span>
        ))}
      </p>
      <p className="mt-1 text-sm text-neutral-600 break-words">{p.change_reason}</p>
      {p.phase_in_reason && <p className="text-xs text-neutral-500 break-words">Phasing in: {p.phase_in_reason}</p>}
      {p.below_cost_reason && <p className="text-xs text-neutral-500 break-words">Unfunded discounts: {p.below_cost_reason}</p>}
      {p.cancel_reason && <p className="text-xs text-neutral-500 break-words">Cancelled: {p.cancel_reason}</p>}
      <p className="mt-0.5 text-xs text-neutral-400">
        {p.created_by_name ?? "Unknown admin"} · {when(p.created_at)} · template v{p.template_version}, parameters v{p.parameter_version}
        {p.confirmed_by_name && p.confirmed_at ? ` · confirmed by ${p.confirmed_by_name}, ${when(p.confirmed_at)}` : ""}
        {p.cancelled_by_name && p.cancelled_at ? ` · cancelled by ${p.cancelled_by_name}, ${when(p.cancelled_at)}` : ""}
      </p>

      {p.status === "pending" && (
        <div className="mt-2 flex flex-col gap-2">
          {cancelling ? (
            <div className="flex flex-wrap items-center gap-2">
              <input aria-label="Reason for cancelling" value={cancelReason} onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Why cancel?" className="w-64 rounded-lg border border-neutral-200 px-3 py-1.5 text-sm outline-none focus:border-violet-500" />
              <button type="button" disabled={cancelReason.trim().length < 3 || cancel.isPending}
                onClick={() => {
                  setError(null);
                  cancel.mutate({publicationId: p.publication_id, reason: cancelReason.trim()}, {
                    onSuccess: () => showSuccess("Publication cancelled"),
                    onError,
                  });
                }}
                className="rounded-full bg-neutral-800 px-4 py-1.5 text-sm font-semibold text-white disabled:opacity-50">
                {cancel.isPending ? "Cancelling…" : "Cancel publication"}
              </button>
              <button type="button" onClick={() => setCancelling(false)} className="text-sm text-neutral-500 underline">Keep it</button>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              <button type="button" disabled={confirm.isPending}
                onClick={() => {
                  setError(null);
                  confirm.mutate(p.publication_id, {
                    onSuccess: () => showSuccess("Prices published"),
                    onError,
                  });
                }}
                className="rounded-full bg-violet-600 px-4 py-1.5 text-sm font-semibold text-white hover:bg-violet-700 disabled:opacity-50">
                {confirm.isPending ? "Confirming…" : "Confirm and publish"}
              </button>
              <button type="button" onClick={() => setCancelling(true)}
                className="rounded-full border border-neutral-200 px-4 py-1.5 text-sm font-medium text-neutral-700 hover:bg-neutral-50">
                Cancel…
              </button>
            </div>
          )}
          <p className="text-xs text-neutral-400">Only an admin other than the one who submitted it can confirm.</p>
          {error && <p className="text-xs text-red-600">{error}</p>}
        </div>
      )}
    </li>
  );
}
