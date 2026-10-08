"use client";

import {Modal} from "@mcc/ui";
import {useReceipt} from "../hooks/useWallet";
import {PURPOSE_LABEL, STATUS_LABEL, formatDate, formatNaira} from "../helper/wallet";

/** Hides everything but the receipt when the page is printed or saved as PDF. */
const PRINT_CSS = `
@media print {
  body * { visibility: hidden !important; }
  .receipt-print, .receipt-print * { visibility: visible !important; }
  .receipt-print { position: absolute; left: 0; top: 0; width: 100%; padding: 24px; }
  .receipt-no-print { display: none !important; }
}`;

function Row({label, value}: {label: string; value: string}) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-muted/15 py-2 text-sm last:border-0">
      <dt className="text-subtle">{label}</dt>
      <dd className="text-right font-medium text-foreground break-all">{value}</dd>
    </div>
  );
}

export default function ReceiptModal({txRef, onClose}: {txRef: string | null; onClose: () => void}) {
  const {data, isLoading, isError} = useReceipt(txRef);

  return (
    <Modal open={!!txRef} onClose={onClose} title="Receipt" maxWidth="max-w-md">
      <style>{PRINT_CSS}</style>
      {isLoading && <div className="h-40 animate-pulse rounded-xl bg-muted/10" />}
      {isError && <p className="text-sm text-red-600">This receipt couldn&apos;t be loaded.</p>}
      {data && (
        <div className="receipt-print">
          <p className="text-xs uppercase tracking-wide text-subtle">My Course Companion</p>
          <p className="mb-3 text-lg font-bold text-foreground">{data.receipt_number ?? "Receipt"}</p>
          <dl>
            <Row label="Item" value={data.item} />
            <Row label="Type" value={PURPOSE_LABEL[data.purpose]} />
            <Row label="Amount" value={formatNaira(data.amount)} />
            <Row label="Paid with" value={data.method} />
            <Row label="Date" value={formatDate(data.paid_at)} />
            <Row label="Status" value={STATUS_LABEL[data.status]} />
            <Row label="Reference" value={data.tx_ref} />
          </dl>
          <div className="receipt-no-print mt-4 flex justify-end">
            <button
              type="button"
              onClick={() => window.print()}
              className="rounded-full bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-700"
            >
              Print or save as PDF
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
}
