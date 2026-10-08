"use client";

import {useState} from "react";
import {Icon} from "@mcc/ui";
import {usePaymentHistory, useWalletTransactions} from "../hooks/useWallet";
import {Currency} from "../services/wallet.service";
import {PURPOSE_LABEL, STATUS_LABEL, formatDate, formatNaira, formatSigned, hasReceipt} from "../helper/wallet";
import ReceiptModal from "./ReceiptModal";

const KIND_ICON: Record<string, string> = {
  purchase: "solar:cart-large-2-bold",
  refund: "solar:undo-left-round-bold",
  unlock: "solar:lock-unlocked-bold",
  convert: "solar:transfer-horizontal-bold",
  reward: "solar:gift-bold",
  earned: "solar:medal-star-bold",
  brainy: "ph:sparkle",
  other: "solar:wallet-money-bold",
};

const FILTERS: {key: Currency | "all"; label: string}[] = [
  {key: "all", label: "All"},
  {key: "gems", label: "Gems"},
  {key: "points", label: "Points"},
  {key: "silver", label: "Silver"},
];

function Activity() {
  const [filter, setFilter] = useState<Currency | "all">("all");
  const query = useWalletTransactions(filter === "all" ? undefined : filter);
  const items = query.data?.pages.flatMap((p) => p.items) ?? [];

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            type="button"
            aria-pressed={filter === f.key}
            onClick={() => setFilter(f.key)}
            className={`rounded-full border px-3 py-1 text-xs font-medium ${
              filter === f.key ? "border-violet-600 bg-violet-50 text-violet-700 dark:bg-violet-500/10" : "border-muted/30 text-subtle hover:bg-muted/10"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {query.isLoading && <div className="h-40 animate-pulse rounded-2xl bg-muted/10" />}
      {query.isError && <p className="text-sm text-red-600">Your wallet activity couldn&apos;t be loaded.</p>}
      {!query.isLoading && !query.isError && items.length === 0 && (
        <p className="rounded-2xl border border-muted/25 p-6 text-center text-sm text-subtle">Nothing here yet. Earn points or buy gems and they&apos;ll show up.</p>
      )}

      <ul className="flex flex-col divide-y divide-muted/15 rounded-2xl border border-muted/25">
        {items.map((t) => (
          <li key={t.id} className="flex items-center gap-3 px-4 py-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-muted/10 text-subtle">
              <Icon icon={KIND_ICON[t.kind] ?? KIND_ICON.other} size={18} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-medium text-foreground">{t.label}</span>
              <span className="block text-xs text-subtle">{formatDate(t.created_at)}</span>
            </span>
            <span className={`shrink-0 text-sm font-semibold ${t.amount >= 0 ? "text-green-600" : "text-foreground"}`}>
              {formatSigned(t.amount)} <span className="text-xs font-normal text-subtle">{t.currency}</span>
            </span>
          </li>
        ))}
      </ul>

      {query.hasNextPage && (
        <button
          type="button"
          onClick={() => query.fetchNextPage()}
          disabled={query.isFetchingNextPage}
          className="self-center rounded-full border border-muted/30 px-4 py-1.5 text-xs font-medium text-subtle hover:bg-muted/10 disabled:opacity-50"
        >
          {query.isFetchingNextPage ? "Loading…" : "Show more"}
        </button>
      )}
    </div>
  );
}

function Payments() {
  const {data: payments, isLoading, isError} = usePaymentHistory();
  const [receipt, setReceipt] = useState<string | null>(null);

  if (isLoading) return <div className="h-40 animate-pulse rounded-2xl bg-muted/10" />;
  if (isError) return <p className="text-sm text-red-600">Your payments couldn&apos;t be loaded.</p>;
  if (!payments?.length) {
    return <p className="rounded-2xl border border-muted/25 p-6 text-center text-sm text-subtle">You haven&apos;t paid for anything yet.</p>;
  }

  return (
    <>
      <ul className="flex flex-col divide-y divide-muted/15 rounded-2xl border border-muted/25">
        {payments.map((p) => (
          <li key={p.tx_ref} className="flex flex-wrap items-center gap-3 px-4 py-3">
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-medium text-foreground">{p.item ?? PURPOSE_LABEL[p.purpose]}</span>
              <span className="block text-xs text-subtle">
                {formatDate(p.completed_at ?? p.created_at)} · {STATUS_LABEL[p.status]}
                {p.status === "successful" && !p.granted && " · being applied"}
              </span>
            </span>
            <span className="shrink-0 text-sm font-semibold text-foreground">{formatNaira(p.amount)}</span>
            {hasReceipt(p.status) && (
              <button
                type="button"
                onClick={() => setReceipt(p.tx_ref)}
                className="shrink-0 rounded-full border border-muted/30 px-3 py-1 text-xs font-medium text-subtle hover:bg-muted/10"
              >
                Receipt
              </button>
            )}
          </li>
        ))}
      </ul>
      <ReceiptModal txRef={receipt} onClose={() => setReceipt(null)} />
    </>
  );
}

export default function WalletHistory() {
  const [view, setView] = useState<"activity" | "payments">("activity");
  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-2">
        {([["activity", "Wallet activity"], ["payments", "Payments & receipts"]] as const).map(([key, label]) => (
          <button
            key={key}
            type="button"
            aria-pressed={view === key}
            onClick={() => setView(key)}
            className={`rounded-full px-4 py-1.5 text-xs font-medium ${view === key ? "border border-muted/30 text-foreground" : "text-gray-400 hover:text-gray-600"}`}
          >
            {label}
          </button>
        ))}
      </div>
      {view === "activity" ? <Activity /> : <Payments />}
    </div>
  );
}
