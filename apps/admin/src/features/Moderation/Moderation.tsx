"use client";

import { useState } from "react";
import { useReports } from "./hooks/useModeration";
import { ReportRow } from "./ReportRow";
import BugReports from "./bugs/BugReports";
import { MutedList } from "./MutedList";

const TABS: { key: string | undefined; label: string }[] = [
  { key: "pending", label: "Pending" },
  { key: "resolved", label: "Resolved" },
  { key: "dismissed", label: "Dismissed" },
  { key: undefined, label: "All" },
];

const VIEWS = [
  { key: "content", label: "Content reports" },
  { key: "muted", label: "Muted" },
  { key: "bugs", label: "Bug reports" },
] as const;

export default function Moderation() {
  const [view, setView] = useState<(typeof VIEWS)[number]["key"]>("content");
  const [activeTab, setActiveTab] = useState<string | undefined>("pending");
  const { data: reports, isLoading } = useReports(activeTab);

  const pendingCount = reports?.filter((r) => r.status === "pending").length ?? 0;

  return (
    <section>
      <div className="w-full rounded-2xl border border-neutral-100 bg-white p-6 shadow-sm">
        <div className="mb-4 inline-flex items-center rounded-xl bg-neutral-100/80 p-1" role="tablist" aria-label="Moderation sections">
          {VIEWS.map((v) => (
            <button
              key={v.key}
              type="button"
              role="tab"
              aria-selected={view === v.key}
              onClick={() => setView(v.key)}
              className={`rounded-lg px-4 py-1.5 text-sm font-semibold transition-all ${
                view === v.key ? "bg-white text-neutral-900 shadow-sm" : "text-neutral-500 hover:text-neutral-800"
              }`}
            >
              {v.label}
            </button>
          ))}
        </div>

        {view === "muted" ? (
          <>
            <h1 className="text-lg font-bold text-neutral-900">Muted from course discussions</h1>
            <p className="mb-4 mt-0.5 text-sm text-neutral-500">
              People who can&apos;t post in course discussions right now. A mute ends by itself on its date, or when you lift it.
            </p>
            <MutedList />
          </>
        ) : view === "bugs" ? (
          <>
            <h1 className="text-lg font-bold text-neutral-900">Bug reports</h1>
            <p className="mb-4 mt-0.5 text-sm text-neutral-500">Problems students and staff report from the apps, most urgent first.</p>
            <BugReports />
          </>
        ) : (
        <>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-neutral-900">Content reports</h1>
            <p className="text-sm text-neutral-500 mt-0.5">
              Reports on community posts and instructor Q&amp;A messages, and posts the automatic check held for review.
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
          {isLoading && <p className="py-6 text-sm text-neutral-500">Loading…</p>}
          {reports && reports.length === 0 && (
            <p className="py-6 text-sm text-neutral-500">No reports here.</p>
          )}
          {reports?.map((report) => <ReportRow key={report.id} report={report} />)}
        </div>
        </>
        )}
      </div>
    </section>
  );
}
