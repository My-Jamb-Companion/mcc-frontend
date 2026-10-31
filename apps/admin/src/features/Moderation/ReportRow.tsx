"use client";

import { ConfirmModal, showError, showSuccess } from "@mcc/ui";
import { extractApiError } from "@mcc/api";
import { useDismissReport, useResolveReport } from "./hooks/useModeration";
import type { ApiContentReport } from "./services/moderation.service";
import { POST_STATE, decisionCopy } from "./reportCopy";

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

export function ReportRow({ report }: { report: ApiContentReport }) {
  const resolve = useResolveReport();
  const dismiss = useDismissReport();

  const handleResolve = () => {
    resolve.mutate(report.id, {
      onSuccess: () => showSuccess(report.content_type === "community_post" ? "Post removed" : "Report resolved"),
      onError: (error) => showError(extractApiError(error, "Couldn't resolve this report")),
    });
  };

  const handleDismiss = () => {
    dismiss.mutate(report.id, {
      onSuccess: () => showSuccess(report.content_status === "held" || report.content_status === "hidden" ? "Post kept" : "Report dismissed"),
      onError: (error) => showError(extractApiError(error, "Couldn't dismiss this report")),
    });
  };

  const copy = decisionCopy(report);
  const isPost = report.content_type === "community_post";
  const state = report.content_status ? POST_STATE[report.content_status] : null;
  const automatic = report.source === "auto";

  return (
    <div className="flex flex-col gap-3 py-4 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-semibold text-neutral-900">
            {CONTENT_TYPE_LABEL[report.content_type] ?? report.content_type}
          </span>
          {automatic && (
            <span className="rounded-full bg-violet-50 px-2.5 py-0.5 text-xs font-medium text-violet-700">
              Caught by the automatic check
            </span>
          )}
          {isPost && state && (
            <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${state.style}`}>{state.label}</span>
          )}
          {(report.pending_reports ?? 0) > 1 && (
            <span className="rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-medium text-red-600">
              {report.pending_reports} open reports
            </span>
          )}
        </div>
        <div className="mt-0.5 text-xs text-neutral-400">
          {formatWhen(report.created_at)}
          {report.course_title ? ` · ${report.course_title}` : ""}
          {report.author_name ? ` · by ${report.author_name}` : ""}
          {!automatic && report.reporter_name ? ` · reported by ${report.reporter_name}` : ""}
        </div>
        {report.content_preview && (
          <blockquote className="mt-2 whitespace-pre-wrap break-words rounded-lg border-l-4 border-violet-200 bg-neutral-50 px-3 py-2 text-sm text-neutral-800">
            {report.content_preview}
          </blockquote>
        )}
        <p className="mt-2 text-sm text-neutral-600">
          <span className="font-medium text-neutral-700">{automatic ? "Why: " : "Reason: "}</span>
          {report.reason}
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <StatusTag status={report.status} />
        {report.status === "pending" && (
          <>
            <ConfirmModal
              title={copy.resolve.title}
              description={copy.resolve.text}
              confirmText={copy.resolve.label}
              variant={isPost ? "danger" : "default"}
              onConfirm={handleResolve}
              trigger={<PillButton label={copy.resolve.label} variant="primary" loading={resolve.isPending} />}
            />
            <ConfirmModal
              title={copy.dismiss.title}
              description={copy.dismiss.text}
              confirmText={copy.dismiss.label}
              variant={isPost ? "default" : "danger"}
              onConfirm={handleDismiss}
              trigger={<PillButton label={copy.dismiss.label} variant={isPost ? "outline" : "danger"} loading={dismiss.isPending} />}
            />
          </>
        )}
      </div>
    </div>
  );
}
