"use client";

import { useState } from "react";
import { Modal } from "@mcc/ui";
import { useParentPayments, useParentReceipt } from "./usePaymentHistory";
import { STATUS_LABEL, formatDate, formatMoney, hasReceipt, paymentTitle } from "./history";

/** Hides everything but the receipt when the page is printed or saved as PDF. */
const PRINT_CSS = `
@media print {
  body * { visibility: hidden !important; }
  .receipt-print, .receipt-print * { visibility: visible !important; }
  .receipt-print { position: absolute; left: 0; top: 0; width: 100%; padding: 24px; }
  .receipt-no-print { display: none !important; }
}`;

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-muted/15 py-2 text-sm last:border-0">
      <dt className="text-muted">{label}</dt>
      <dd className="text-right font-medium break-all">{value}</dd>
    </div>
  );
}

function ReceiptModal({ txRef, onClose }: { txRef: string | null; onClose: () => void }) {
  const { data, isLoading, isError } = useParentReceipt(txRef);
  return (
    <Modal open={!!txRef} onClose={onClose} title="Receipt" maxWidth="max-w-md">
      <style>{PRINT_CSS}</style>
      {isLoading && <div className="h-40 animate-pulse rounded-xl bg-muted/10" />}
      {isError && <p className="text-sm text-danger">This receipt couldn&apos;t be loaded.</p>}
      {data && (
        <div className="receipt-print">
          <p className="text-xs uppercase tracking-wide text-muted">My Course Companion</p>
          <p className="mb-3 text-lg font-bold">{data.receipt_number ?? "Receipt"}</p>
          <dl>
            <Row label="Item" value={data.item} />
            <Row label="Amount" value={formatMoney(data.amount, data.currency)} />
            <Row label="Paid with" value={data.method} />
            <Row label="Date" value={formatDate(data.paid_at)} />
            <Row label="Status" value={STATUS_LABEL[data.status] ?? data.status} />
            <Row label="Reference" value={data.tx_ref} />
          </dl>
          <div className="receipt-no-print mt-4 flex justify-end">
            <button
              type="button"
              onClick={() => window.print()}
              className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
            >
              Print or save as PDF
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
}

export const PaymentHistory = () => {
  const { data, isLoading, isError } = useParentPayments();
  const [txRef, setTxRef] = useState<string | null>(null);

  if (isLoading) return <p className="text-sm text-muted">Loading payments…</p>;
  if (isError) return <p className="text-sm text-danger">Couldn&apos;t load your payments. Try again shortly.</p>;
  if (!data || data.length === 0) {
    return <p className="text-sm text-muted">No payments yet. What you pay for your children will show up here.</p>;
  }

  return (
    <>
      <ul className="space-y-2">
        {data.map((p) => (
          <li key={p.tx_ref} className="flex items-center justify-between gap-4 rounded-lg border border-muted/20 px-4 py-3">
            <div className="min-w-0">
              <p className="truncate font-medium">{paymentTitle(p)}</p>
              <p className="text-sm text-muted">
                For {p.child_name ?? "your child"} · {formatDate(p.completed_at ?? p.created_at)}
              </p>
            </div>
            <div className="flex shrink-0 flex-col items-end gap-1">
              <p className="font-semibold">{formatMoney(p.amount, p.currency)}</p>
              <span className="rounded-full bg-muted/10 px-2 py-0.5 text-xs text-muted">
                {STATUS_LABEL[p.status] ?? p.status}
              </span>
              {hasReceipt(p.status) && (
                <button
                  type="button"
                  onClick={() => setTxRef(p.tx_ref)}
                  className="text-xs text-primary underline"
                >
                  View receipt
                </button>
              )}
            </div>
          </li>
        ))}
      </ul>
      <ReceiptModal txRef={txRef} onClose={() => setTxRef(null)} />
    </>
  );
};
