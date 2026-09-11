"use client";

import { useState } from "react";
import { ConfirmModal, showError, showSuccess } from "@mcc/ui";
import { extractApiError } from "@mcc/api";
import { useDismissReport, useReports, useResolveReport } from "./hooks/useModeration";
import type { ApiContentReport } from "./services/moderation.service";

const formatWhen = (iso: string) =>
  new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

const CONTENT_TYPE_LABEL: Record<string, string> = {
  community_post: "Community post",
  instructor_qa_message: "Instructor Q&A message",
};

function StatusTag({ status }: { status: string }) {
  const style: Record<string, string> = {
    pending: "bg-amber-50 text-amber-600",
    resolved: "bg-green-50 text-green-600",
    dismissed: "bg-gray-100 text-gray-600",
  };
  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${style[status] ?? "bg-gray-100 text-gray-600"}`}>
      {status}
    </span>
  );
}

function PillButton({
  label,
  variant = "outline",
  loading,
  onClick,
}: {
  label: string;
  variant?: "outline" | "primary" | "danger";
  loading?: boolean;
  onClick?: () => void;
}) {
  const variantClass =
    variant === "primary"
      ? "bg-violet-600 text-white hover:bg-violet-700"
      : variant === "danger"
        ? "border border-red-200 text-red-600 hover:bg-red-50"
        : "border border-gray-200 text-gray-800 hover:bg-gray-50";
  return (
    <button
      type="button"
      disabled={loading}
      onClick={onClick}
      className={`px-4 py-2 rounded-full text-sm font-medium transition-colors disabled:opacity-50 ${variantClass}`}
    >
      {loading ? "…" : label}
    </button>
  );
}

function ReportRow({ report }: { report: ApiContentReport }) {
  const resolve = useResolveReport();
  const dismiss = useDismissReport();

  const handleResolve = () => {
    resolve.mutate(report.id, {
      onSuccess: () => showSuccess("Report resolved"),
      onError: (error) => showError(extractApiError(error, "Couldn't resolve this report")),
    });
  };

  const handleDismiss = () => {
    dismiss.mutate(report.id, {
      onSuccess: () => showSuccess("Report dismissed"),
      onError: (error) => showError(extractApiError(error, "Couldn't dismiss this report")),
    });
  };

  return (
    <div className="flex items-center justify-between py-4 gap-4">
      <div className="min-w-0">
        <div className="text-sm font-semibold text-neutral-900">
          {CONTENT_TYPE_LABEL[report.content_type] ?? report.content_type}
        </div>
        <div className="text-xs text-neutral-400 mt-0.5">
          Reported {formatWhen(report.created_at)} · content id {report.content_id.slice(0, 12)}…
        </div>
        <p className="text-sm text-neutral-700 mt-2">{report.reason}</p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <StatusTag status={report.status} />
        {report.status === "pending" && (
          <>
            <ConfirmModal
              title="Resolve report"
              description="Confirm you've acted on the reported content. This marks the report resolved."
              confirmText="Resolve"
              variant="default"
              onConfirm={handleResolve}
              trigger={<PillButton label="Resolve" variant="primary" loading={resolve.isPending} />}
            />
            <ConfirmModal
              title="Dismiss report"
              description="No action needed on the reported content. This marks the report dismissed."
              confirmText="Dismiss"
              variant="danger"
              onConfirm={handleDismiss}
              trigger={<PillButton label="Dismiss" variant="danger" loading={dismiss.isPending} />}
            />
          </>
        )}
      </div>
    </div>
  );
}

const TABS: { key: string | undefined; label: string }[] = [
  { key: "pending", label: "Pending" },
  { key: "resolved", label: "Resolved" },
  { key: "dismissed", label: "Dismissed" },
  { key: undefined, label: "All" },
];

export default function Moderation() {
  const [activeTab, setActiveTab] = useState<string | undefined>("pending");
  const { data: reports, isLoading } = useReports(activeTab);

  const pendingCount = reports?.filter((r) => r.status === "pending").length ?? 0;

  return (
    <section>
      <div className="w-full rounded-2xl border border-neutral-100 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-neutral-900">Moderation</h1>
            <p className="text-sm text-neutral-400 mt-0.5">
              Reports filed against community posts and instructor Q&amp;A messages.
            </p>
          </div>
          {activeTab === "pending" && pendingCount > 0 && (
            <span className="px-3 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-600">
              {pendingCount} pending
            </span>
          )}
        </div>

        <div className="mt-4 mb-2 inline-flex items-center rounded-xl bg-neutral-100/80 p-1">
          {TABS.map((tab) => (
            <button
              key={tab.label}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`rounded-lg px-4 py-1.5 text-sm font-semibold transition-all ${
                activeTab === tab.key
                  ? "bg-white text-neutral-900 shadow-sm"
                  : "text-neutral-500 hover:text-neutral-800"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="divide-y divide-gray-100">
          {isLoading && <p className="py-6 text-sm text-neutral-400">Loading…</p>}
          {reports && reports.length === 0 && (
            <p className="py-6 text-sm text-neutral-400">No reports here.</p>
          )}
          {reports?.map((report) => <ReportRow key={report.id} report={report} />)}
        </div>
      </div>
    </section>
  );
}
