"use client";

import {useEffect, useState} from "react";
import {showError, showSuccess} from "@mcc/ui";
import {extractApiError} from "@mcc/api";
import {
  BugStatus,
  BugUrgency,
  isClosed,
  prettyPage,
  reporterLabel,
  safeLink,
  STATUS_LABEL,
  STATUS_STYLE,
  URGENCY_LABEL,
  URGENCY_STYLE,
} from "./bugStatus";
import type {ApiBugReport} from "./bugReports.service";
import {useBugReports, useUpdateBugReport} from "./useBugReports";

const when = (iso: string) =>
  new Date(iso).toLocaleString("en-GB", {day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit"});

const field = "rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-800 outline-none focus:border-violet-400";

function useDebounced<T>(value: T, ms = 300): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return debounced;
}

function BugCard({report}: {report: ApiBugReport}) {
  const update = useUpdateBugReport();
  const [open, setOpen] = useState(false);
  const [note, setNote] = useState(report.admin_note ?? "");
  const link = safeLink(report.page_url);

  function setStatus(status: BugStatus) {
    update.mutate(
      {reportId: report.report_id, input: {status}},
      {
        onSuccess: () => showSuccess(`Marked ${STATUS_LABEL[status].toLowerCase()}.`),
        onError: (error) => showError(extractApiError(error, "Couldn't update this report")),
      },
    );
  }

  function saveNote() {
    update.mutate(
      {reportId: report.report_id, input: {admin_note: note}},
      {
        onSuccess: () => showSuccess("Note saved."),
        onError: (error) => showError(extractApiError(error, "Couldn't save the note")),
      },
    );
  }

  return (
    <article className={`py-5 ${isClosed(report.status) ? "opacity-75" : ""}`}>
      <div className="flex flex-wrap items-center gap-2">
        <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${URGENCY_STYLE[report.urgency]}`}>{URGENCY_LABEL[report.urgency]}</span>
        <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_STYLE[report.status]}`}>{STATUS_LABEL[report.status]}</span>
        <span className="text-xs text-neutral-400">
          {reporterLabel(report)}
          {report.reporter_role ? ` · ${report.reporter_role}` : ""} · {when(report.created_at)}
        </span>
      </div>

      <div className="mt-2 flex gap-4">
        <div className="min-w-0 flex-1">
          <p className="whitespace-pre-wrap text-sm text-neutral-800">{report.description}</p>
          <p className="mt-2 truncate text-xs text-neutral-500">
            Page:{" "}
            {link ? (
              <a href={link} target="_blank" rel="noopener noreferrer" className="text-violet-600 hover:underline">
                {prettyPage(report.page_url)}
              </a>
            ) : (
              <span>{report.page_url}</span>
            )}
          </p>
          {report.admin_note && !open && <p className="mt-2 rounded-lg bg-neutral-50 px-3 py-2 text-xs text-neutral-600">Note: {report.admin_note}</p>}
        </div>
        {report.screenshot_url && (
          <a href={report.screenshot_url} target="_blank" rel="noopener noreferrer" className="shrink-0" aria-label="Open the screenshot">
            <img src={report.screenshot_url} alt="Screenshot from the report" className="h-20 w-28 rounded-lg border border-neutral-200 object-cover" />
          </a>
        )}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        {report.status === "open" && (
          <button type="button" disabled={update.isPending} onClick={() => setStatus("in_progress")} className="rounded-full border border-neutral-200 px-3.5 py-1.5 text-xs font-medium text-neutral-800 hover:bg-neutral-50 disabled:opacity-50">
            Start working
          </button>
        )}
        {!isClosed(report.status) && (
          <>
            <button type="button" disabled={update.isPending} onClick={() => setStatus("resolved")} className="rounded-full bg-violet-600 px-3.5 py-1.5 text-xs font-medium text-white hover:bg-violet-700 disabled:opacity-50">
              Mark resolved
            </button>
            <button type="button" disabled={update.isPending} onClick={() => setStatus("wont_fix")} className="rounded-full border border-neutral-200 px-3.5 py-1.5 text-xs font-medium text-neutral-600 hover:bg-neutral-50 disabled:opacity-50">
              Won&apos;t fix
            </button>
          </>
        )}
        {isClosed(report.status) && (
          <button type="button" disabled={update.isPending} onClick={() => setStatus("open")} className="rounded-full border border-neutral-200 px-3.5 py-1.5 text-xs font-medium text-neutral-800 hover:bg-neutral-50 disabled:opacity-50">
            Reopen
          </button>
        )}
        <button type="button" onClick={() => setOpen((v) => !v)} className="text-xs font-medium text-neutral-500 hover:text-neutral-800">
          {open ? "Hide details" : "Note & details"}
        </button>
      </div>

      {open && (
        <div className="mt-3 grid gap-3 rounded-xl bg-neutral-50 p-4 text-xs text-neutral-600">
          <label className="flex flex-col gap-1.5 font-medium text-neutral-700">
            Internal note (students never see this)
            <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={3} maxLength={4000} className={`${field} font-normal`} />
          </label>
          <div className="flex items-center justify-between gap-3">
            <p className="min-w-0 truncate">Browser: {report.user_agent || "not recorded"}</p>
            <button type="button" disabled={update.isPending || note.trim() === (report.admin_note ?? "")} onClick={saveNote} className="shrink-0 rounded-full bg-violet-600 px-4 py-1.5 font-medium text-white hover:bg-violet-700 disabled:opacity-50">
              Save note
            </button>
          </div>
          {report.resolved_at && <p>Closed {when(report.resolved_at)}</p>}
        </div>
      )}
    </article>
  );
}

const STATUS_TABS: {key: BugStatus | ""; label: string}[] = [
  {key: "open", label: "Open"},
  {key: "in_progress", label: "In progress"},
  {key: "resolved", label: "Resolved"},
  {key: "wont_fix", label: "Won't fix"},
  {key: "", label: "All"},
];

/** Bugs reported from the apps, for triage: filter, read, set status, leave an internal note. */
export default function BugReports() {
  const [status, setStatus] = useState<BugStatus | "">("open");
  const [urgency, setUrgency] = useState<BugUrgency | "">("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const debounced = useDebounced(search);
  const list = useBugReports({status, urgency, search: debounced, page, limit: 15});
  const counts = list.data?.counts;

  const choose = <T,>(set: (v: T) => void) => (v: T) => {
    set(v);
    setPage(1);
  };

  return (
    <div>
      <div className="mb-3 inline-flex flex-wrap items-center rounded-xl bg-neutral-100/80 p-1">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.label}
            type="button"
            onClick={() => choose(setStatus)(tab.key)}
            className={`rounded-lg px-4 py-1.5 text-sm font-semibold transition-all ${status === tab.key ? "bg-white text-neutral-900 shadow-sm" : "text-neutral-500 hover:text-neutral-800"}`}
          >
            {tab.label}
            {counts && <span className="ml-1.5 text-xs font-normal text-neutral-400">{tab.key ? counts[tab.key] : counts.total}</span>}
          </button>
        ))}
      </div>

      <div className="mb-2 grid gap-2 sm:grid-cols-[1fr_12rem]">
        <input value={search} onChange={(e) => choose(setSearch)(e.target.value)} placeholder="Search description, page or reporter" aria-label="Search bug reports" className={field} />
        <select value={urgency} onChange={(e) => choose(setUrgency)(e.target.value as BugUrgency | "")} aria-label="Urgency" className={field}>
          <option value="">Any urgency</option>
          <option value="urgent">Urgent</option>
          <option value="important">Important</option>
          <option value="annoying">Just annoying</option>
        </select>
      </div>

      <div className="divide-y divide-gray-100">
        {list.isLoading && <p className="py-6 text-sm text-neutral-400">Loading…</p>}
        {list.isError && <p className="py-6 text-sm text-red-500">Couldn&apos;t load the bug reports. Please try again.</p>}
        {list.data && list.data.reports.length === 0 && <p className="py-6 text-sm text-neutral-400">No bug reports here.</p>}
        {list.data?.reports.map((report) => <BugCard key={report.report_id} report={report} />)}
      </div>

      {list.data && list.data.pages > 1 && (
        <div className="mt-4 flex items-center justify-between text-sm text-neutral-600">
          <button type="button" disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="rounded-lg border border-neutral-200 px-3 py-1.5 disabled:opacity-40">Previous</button>
          <span>Page {list.data.page} of {list.data.pages}</span>
          <button type="button" disabled={page >= list.data.pages} onClick={() => setPage((p) => p + 1)} className="rounded-lg border border-neutral-200 px-3 py-1.5 disabled:opacity-40">Next</button>
        </div>
      )}
    </div>
  );
}
