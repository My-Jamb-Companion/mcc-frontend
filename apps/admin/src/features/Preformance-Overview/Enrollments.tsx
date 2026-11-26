"use client";

import {useState} from "react";
import {Icon} from "@mcc/ui";
import {downloadBlob} from "@/src/features/Exam-program/helper/export";
import EnrollmentCharts from "./EnrollmentCharts";
import {enrollmentCsv, enrollmentCsvName} from "./enrollmentCsv";
import {useEnrollmentReport} from "./hooks/useAnalytics";
import {change, matching} from "./enrollmentView";

const PERIODS = [
  {days: 7, label: "7 days"},
  {days: 30, label: "30 days"},
  {days: 90, label: "90 days"},
  {days: 365, label: "12 months"},
];

const KINDS = [
  {key: "courses", label: "Courses", noun: "course"},
  {key: "exam_programs", label: "Exam programs", noun: "exam program"},
] as const;

type Kind = (typeof KINDS)[number]["key"];

function Tile({label, value, note}: {label: string; value: number | string; note: React.ReactNode}) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="mt-1 text-3xl font-bold text-gray-900">{value}</p>
      <p className="mt-1 text-xs text-gray-500">{note}</p>
    </div>
  );
}

function ChangeText({current, previous}: {current: number; previous: number}) {
  const {label, direction} = change(current, previous);
  const colour = direction === "up" ? "text-emerald-600" : direction === "down" ? "text-rose-600" : "text-gray-500";
  return <span className={`font-medium ${colour}`}>{label}</span>;
}

/** The pill buttons for choosing a period or a list. */
function Choice({selected, onClick, children}: {selected: boolean; onClick: () => void; children: React.ReactNode}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={`rounded-full border px-4 py-1.5 text-sm font-semibold ${
        selected ? "border-violet-600 bg-violet-600 text-white" : "border-gray-200 text-gray-600 hover:bg-gray-50"
      }`}
    >
      {children}
    </button>
  );
}

/**
 * How many learners are enrolled in each course and exam program: the totals, how they split between paid and
 * free, and what has joined in the chosen period compared with the one before.
 */
export default function Enrollments() {
  const [days, setDays] = useState(30);
  const [kind, setKind] = useState<Kind>("courses");
  const [query, setQuery] = useState("");
  const {data, isLoading, isError} = useEnrollmentReport(days);

  const noun = KINDS.find((k) => k.key === kind)!.noun;
  const periodLabel = PERIODS.find((p) => p.days === days)!.label;
  const group = data?.[kind];
  const rows = matching(group?.items ?? [], query);
  const show = (value?: number) => (isLoading ? "…" : (value ?? 0));
  const exportCsv = () => {
    if (!data) return;
    downloadBlob(new Blob([enrollmentCsv(data)], {type: "text/csv;charset=utf-8"}), enrollmentCsvName(data.days));
  };
  const newNow = (data?.courses.new_in_period ?? 0) + (data?.exam_programs.new_in_period ?? 0);
  const newBefore = (data?.courses.new_in_previous_period ?? 0) + (data?.exam_programs.new_in_previous_period ?? 0);

  return (
    <div className="w-full space-y-6">
      <div className="flex flex-col gap-3 border-b border-gray-100 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-mono text-base font-semibold text-gray-800">Enrolments</h2>
          <p className="text-xs text-gray-500">
            Active enrolments of real learners. Pending and failed payments and QA testers are not counted.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex flex-wrap gap-2" role="group" aria-label="Period for new enrolments">
            {PERIODS.map((p) => (
              <Choice key={p.days} selected={days === p.days} onClick={() => setDays(p.days)}>
                {p.label}
              </Choice>
            ))}
          </div>
          <button
            type="button"
            onClick={exportCsv}
            disabled={!data}
            className="flex items-center gap-1.5 rounded-full border border-gray-200 px-4 py-1.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Icon icon="lucide:download" size={14} />
            Export CSV
          </button>
        </div>
      </div>

      {isError && (
        <p role="alert" className="text-sm text-red-600">
          Couldn&apos;t load the enrolment figures. Please try again.
        </p>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Tile label="Learners enrolled" value={show(data?.learners)} note={`${data?.paying_learners ?? 0} paying`} />
        <Tile
          label="Course enrolments"
          value={show(data?.courses.total)}
          note={`${data?.courses.paid ?? 0} paid · ${data?.courses.free ?? 0} free · ${data?.courses.learners ?? 0} learners`}
        />
        <Tile
          label="Exam program enrolments"
          value={show(data?.exam_programs.total)}
          note={`${data?.exam_programs.paid ?? 0} paid · ${data?.exam_programs.free ?? 0} free · ${data?.exam_programs.learners ?? 0} learners`}
        />
        <Tile
          label={`New in the last ${periodLabel}`}
          value={show(newNow)}
          note={
            <>
              <ChangeText current={newNow} previous={newBefore} /> on the {periodLabel} before
            </>
          }
        />
      </div>

      {data?.trend && <EnrollmentCharts trend={data.trend} />}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-2" role="group" aria-label="Which enrolments to list">
          {KINDS.map((k) => (
            <Choice key={k.key} selected={kind === k.key} onClick={() => setKind(k.key)}>
              {k.label}
            </Choice>
          ))}
        </div>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={`Search ${noun}s`}
          aria-label={`Search ${noun}s`}
          className="w-full rounded-full border border-gray-200 bg-white px-4 py-2 text-sm text-gray-900 outline-none focus:border-violet-400 sm:w-72"
        />
      </div>

      <div className="overflow-x-auto rounded-3xl border border-gray-100 bg-white">
        <table className="w-full min-w-[640px] text-sm">
          <thead>
            <tr className="border-b border-gray-100 text-left text-xs uppercase tracking-wide text-gray-500">
              <th className="px-6 py-3 font-semibold">{noun}</th>
              <th className="px-4 py-3 text-right font-semibold">Learners</th>
              <th className="px-4 py-3 text-right font-semibold">Paid</th>
              <th className="px-4 py-3 text-right font-semibold">Free</th>
              <th className="px-6 py-3 text-right font-semibold">New ({periodLabel})</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {rows.map((item) => (
              <tr key={item.id}>
                <td className="px-6 py-3">
                  <span className="font-medium text-gray-900">{item.title}</span>
                  {item.status !== "published" && (
                    <span className="ml-2 rounded-full bg-gray-100 px-2 py-0.5 text-xs capitalize text-gray-600">
                      {item.status}
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-right font-bold text-gray-900">{item.total}</td>
                <td className="px-4 py-3 text-right text-gray-700">{item.paid}</td>
                <td className="px-4 py-3 text-right text-gray-700">{item.free}</td>
                <td className="px-6 py-3 text-right text-gray-700">
                  {item.new_in_period}
                  {(item.new_in_period > 0 || item.new_in_previous_period > 0) && (
                    <span className="ml-2 text-xs">
                      <ChangeText current={item.new_in_period} previous={item.new_in_previous_period} />
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {isLoading && <p className="p-8 text-sm text-gray-500">Loading…</p>}
        {!isLoading && !isError && rows.length === 0 && (
          <p className="p-8 text-sm text-gray-500">
            {query.trim() ? `No ${noun} matches “${query.trim()}”.` : `No published ${noun}s yet.`}
          </p>
        )}
      </div>
    </div>
  );
}
