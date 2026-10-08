"use client";

import Link from "next/link";
import {useState} from "react";
import {Button, Icon, Modal, showError, showSuccess} from "@mcc/ui";
import {extractApiError} from "@mcc/api";
import TabbedButton from "@/src/components/TabbedButton";
import {useMyAccess} from "@/src/features/admin-access/hooks/useAdminAccess";
import {canManage, MyAccess} from "@/src/features/admin-access/helper/access";
import {useApproveVerification, useRejectVerification, useVerifications} from "../hooks/useVerifications";
import {ApiVerification, VerificationStatus} from "../services/verifications.service";
import {idTypeLabel, isPdfLink, ninCheckNote, sortQueue} from "../helper/verification";

const TABS: {key: VerificationStatus; label: string}[] = [
  {key: "pending", label: "Pending"},
  {key: "approved", label: "Approved"},
  {key: "rejected", label: "Rejected"},
];

const when = (iso: string | null) =>
  iso ? new Date(iso).toLocaleDateString("en-GB", {day: "2-digit", month: "short", year: "numeric"}) : "";

type Doc = {label: string; url: string};

function DocumentViewer({doc, onClose}: {doc: Doc | null; onClose: () => void}) {
  return (
    <Modal open={!!doc} onClose={onClose} title={doc?.label} maxWidth="max-w-3xl">
      {doc &&
        (isPdfLink(doc.url) ? (
          <iframe src={doc.url} title={doc.label} className="h-[70vh] w-full rounded-lg border border-neutral-200" />
        ) : (
          <img src={doc.url} alt={doc.label} className="max-h-[70vh] w-full rounded-lg object-contain" />
        ))}
    </Modal>
  );
}

function DocThumb({doc, onOpen}: {doc: Doc; onOpen: (doc: Doc) => void}) {
  const pdf = isPdfLink(doc.url);
  return (
    <button
      type="button"
      onClick={() => onOpen(doc)}
      className="group flex w-28 flex-col items-center gap-1.5 rounded-xl border border-neutral-200 p-2 text-xs text-neutral-700 hover:border-violet-400"
    >
      <span className="flex h-20 w-full items-center justify-center overflow-hidden rounded-lg bg-neutral-100">
        {pdf ? (
          <Icon icon="ph:file-pdf" size={32} className="text-red-500" />
        ) : (
          <img src={doc.url} alt="" className="h-full w-full object-cover" loading="lazy" />
        )}
      </span>
      <span className="font-medium group-hover:text-violet-700">{doc.label}</span>
    </button>
  );
}

function VerificationCard({
  item, canAct, onOpen, onApprove, onReject, busy,
}: {
  item: ApiVerification;
  canAct: boolean;
  onOpen: (doc: Doc) => void;
  onApprove: (item: ApiVerification) => void;
  onReject: (item: ApiVerification) => void;
  busy: boolean;
}) {
  const note = ninCheckNote(item.nin_verification_status);
  const docs: Doc[] = [
    {label: "ID document", url: item.id_document_url},
    {label: "Selfie", url: item.selfie_url},
    ...(item.teaching_certificate_url ? [{label: "Certificate", url: item.teaching_certificate_url}] : []),
  ];
  return (
    <li className="rounded-2xl border border-neutral-100 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-base font-semibold text-neutral-900">{item.teacher_name ?? item.teacher_email}</p>
          <p className="text-sm text-neutral-600">{item.teacher_email} · submitted {when(item.created_at)}</p>
          <p className="mt-1 text-sm text-neutral-800">
            {idTypeLabel(item.id_type)}: <span className="font-mono">{item.id_number}</span>
          </p>
          <p className={`mt-1 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
            note.tone === "good" ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-700"
          }`}>
            <Icon icon={note.tone === "good" ? "mdi:check-circle-outline" : "mdi:alert-outline"} size={14} />
            {note.label}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">{docs.map((d) => <DocThumb key={d.label} doc={d} onOpen={onOpen} />)}</div>
      </div>

      {item.status === "pending" && canAct && (
        <div className="mt-4 flex gap-2">
          <Button width="fit" onClick={() => onApprove(item)} disabled={busy}>Approve</Button>
          <Button width="fit" variant="outline" className="text-red-600" onClick={() => onReject(item)} disabled={busy}>Reject…</Button>
        </div>
      )}
      {item.status !== "pending" && (
        <p className="mt-3 text-sm text-neutral-600">
          {item.status === "approved" ? "Approved" : "Rejected"} {when(item.reviewed_at)}
          {item.rejection_reason ? ` · “${item.rejection_reason}”` : ""}
        </p>
      )}
    </li>
  );
}

/** Teacher identity verifications: look at the documents, then approve or reject with a reason. */
export default function VerificationQueue() {
  const [tab, setTab] = useState<VerificationStatus>("pending");
  const {data, isPending, isError, refetch} = useVerifications(tab);
  const approve = useApproveVerification();
  const reject = useRejectVerification();
  const {data: access} = useMyAccess();
  const canAct = !access || canManage(access as MyAccess, "teachers");

  const [viewing, setViewing] = useState<Doc | null>(null);
  const [rejecting, setRejecting] = useState<ApiVerification | null>(null);
  const [reason, setReason] = useState("");

  const items = sortQueue(data ?? []);

  const handleApprove = (item: ApiVerification) =>
    approve.mutate(item.id, {
      onSuccess: () => showSuccess(`${item.teacher_name ?? "The teacher"}'s identity was approved`),
      onError: (e) => showError(extractApiError(e, "Couldn't approve this verification")),
    });

  const closeReject = () => {
    setRejecting(null);
    setReason("");
  };

  return (
    <section className="flex flex-col gap-6 pb-10">
      <div>
        <Link href="/dashboard/teachers" className="inline-flex items-center gap-1 text-sm text-neutral-500 hover:text-neutral-800">
          <Icon icon="ph:arrow-left" size={14} />
          Teachers
        </Link>
        <h1 className="mt-2 text-2xl font-semibold text-neutral-900">Identity verifications</h1>
        <p className="mt-1 max-w-2xl text-sm text-neutral-600">
          Teachers upload an ID document and a selfie when they apply. Check them against each other and the name on the
          account, then approve, or reject with a reason the teacher will see.
        </p>
      </div>

      <TabbedButton active={tab} onChange={(k) => setTab(k as VerificationStatus)} tabs={TABS} />
      {!canAct && <p className="text-sm text-neutral-600">You can view verifications but not approve or reject them.</p>}

      {isError ? (
        <p className="text-sm text-red-600">
          Couldn&apos;t load the queue.{" "}
          <button type="button" className="font-semibold underline" onClick={() => refetch()}>Try again</button>
        </p>
      ) : isPending ? (
        <p className="text-sm text-neutral-600">Loading…</p>
      ) : items.length === 0 ? (
        <p className="rounded-2xl border border-neutral-100 p-8 text-center text-sm text-neutral-600">
          {tab === "pending" ? "Nothing waiting for review." : `No ${tab} verifications yet.`}
        </p>
      ) : (
        <ul className="flex flex-col gap-4">
          {items.map((item) => (
            <VerificationCard
              key={item.id} item={item} canAct={canAct} onOpen={setViewing}
              onApprove={handleApprove} onReject={setRejecting} busy={approve.isPending || reject.isPending}
            />
          ))}
        </ul>
      )}

      <DocumentViewer doc={viewing} onClose={() => setViewing(null)} />

      <Modal open={!!rejecting} onClose={closeReject} title="Reject verification">
        <p className="text-sm text-neutral-700">
          Tell {rejecting?.teacher_name ?? "the teacher"} what to fix. They&apos;ll receive this reason and can submit again.
        </p>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          rows={4}
          placeholder="e.g. The selfie is too dark to match the photo on the ID"
          className="mt-3 w-full rounded-xl border border-neutral-200 p-3 text-sm outline-none focus:border-violet-500"
        />
        {reject.isError && <p className="mt-2 text-sm text-red-600">{extractApiError(reject.error, "Couldn't reject this verification")}</p>}
        <div className="mt-4 flex gap-3">
          <Button
            variant="danger" width="full"
            disabled={reject.isPending || reason.trim().length < 3}
            onClick={() => {
              if (!rejecting) return;
              reject.mutate({id: rejecting.id, reason: reason.trim()}, {
                onSuccess: () => { showSuccess("Verification rejected"); closeReject(); },
              });
            }}
          >
            {reject.isPending ? "Rejecting…" : "Reject"}
          </Button>
          <Button variant="outline" width="full" onClick={closeReject}>Cancel</Button>
        </div>
      </Modal>
    </section>
  );
}
