"use client";

import {Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis} from "@mcc/ui";
import type {ApiEnrollmentTrend, ApiEnrollmentTrendPoint} from "./services/analytics.service";

/*
 * Two series colours, one per kind, checked for colour-blind separation and contrast on the light and dark card
 * surfaces. The running total is one line of "everything", so it takes a neutral ink, not either kind's colour.
 */
const PALETTE = [
  "[--series-courses:#6b26ff] [--series-exams:#eb6834] [--series-total:#3f3f46]",
  "[--chart-surface:#ffffff] [--chart-grid:#ececf0] [--chart-ink:#71717a]",
  "dark:[--series-courses:#9085e9] dark:[--series-exams:#d95926] dark:[--series-total:#d4d4d8]",
  "dark:[--chart-surface:#141417] dark:[--chart-grid:#2e2e34] dark:[--chart-ink:#9d9da7]",
].join(" ");

/** "26 Nov" for a day or week, "Nov 2026" for a month. */
export function barLabel(start: string, bucket: ApiEnrollmentTrend["bucket"]): string {
  const [year, month, day] = start.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day)).toLocaleDateString("en-GB", {
    timeZone: "UTC",
    month: "short",
    ...(bucket === "month" ? {year: "numeric"} : {day: "numeric"}),
  });
}

const PER = {day: "per day", week: "per week", month: "per month"} as const;

type Row = ApiEnrollmentTrendPoint & {label: string};

function Swatch({colour, label}: {colour: string; label: string}) {
  return (
    <span className="flex items-center gap-1.5 text-xs text-gray-600">
      <span aria-hidden className="h-2.5 w-2.5 rounded-sm" style={{background: colour}} />
      {label}
    </span>
  );
}

function Card({title, note, legend, children}: {title: string; note?: string; legend?: React.ReactNode; children: React.ReactNode}) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
        {legend}
      </div>
      {children}
      {note && <p className="mt-2 text-xs text-gray-500">{note}</p>}
    </div>
  );
}

function Tip({title, lines}: {title: string; lines: [string, number][]}) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs shadow">
      <p className="font-semibold text-gray-900">{title}</p>
      {lines.map(([name, value]) => (
        <p key={name} className="text-gray-700">
          {name}: <span className="font-semibold">{value.toLocaleString()}</span>
        </p>
      ))}
    </div>
  );
}

const axis = {axisLine: false, tickLine: false, tick: {fill: "var(--chart-ink)", fontSize: 11}} as const;

/** New enrollments over the period (courses and exam programs stacked), and the running total. */
export default function EnrollmentCharts({trend}: {trend: ApiEnrollmentTrend}) {
  const rows: Row[] = trend.points.map((p) => ({...p, label: barLabel(p.start, trend.bucket)}));
  const anyNew = rows.some((r) => r.courses + r.exam_programs > 0);

  return (
    <div className={`grid grid-cols-1 gap-4 xl:grid-cols-2 ${PALETTE}`}>
      <Card
        title={`New enrolments ${PER[trend.bucket]}`}
        legend={
          <div className="flex gap-4">
            <Swatch colour="var(--series-courses)" label="Courses" />
            <Swatch colour="var(--series-exams)" label="Exam programs" />
          </div>
        }
      >
        {anyNew ? (
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={rows} margin={{top: 8, right: 4, bottom: 0, left: 0}}>
                <CartesianGrid vertical={false} stroke="var(--chart-grid)" />
                <XAxis dataKey="label" {...axis} interval="preserveStartEnd" minTickGap={24} />
                <YAxis {...axis} allowDecimals={false} width={32} />
                <Tooltip
                  cursor={{fill: "var(--chart-grid)", opacity: 0.5}}
                  content={({active, payload}) => {
                    const row = active ? (payload?.[0]?.payload as Row | undefined) : undefined;
                    return row ? (
                      <Tip title={row.label} lines={[["Courses", row.courses], ["Exam programs", row.exam_programs], ["Of which paid", row.paid]]} />
                    ) : null;
                  }}
                />
                {/* The surface-coloured edge is the gap between stacked segments. */}
                <Bar dataKey="courses" stackId="new" fill="var(--series-courses)" stroke="var(--chart-surface)" strokeWidth={1} maxBarSize={24} isAnimationActive={false} />
                <Bar dataKey="exam_programs" stackId="new" fill="var(--series-exams)" stroke="var(--chart-surface)" strokeWidth={1} radius={[4, 4, 0, 0]} maxBarSize={24} isAnimationActive={false} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <p className="flex h-56 items-center justify-center text-sm text-gray-500">No new enrolments in this period.</p>
        )}
      </Card>

      <Card title="Enrolments to date" note="Counts enrolments still active today, by the date they were made.">
        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={rows} margin={{top: 8, right: 8, bottom: 0, left: 0}}>
              <CartesianGrid vertical={false} stroke="var(--chart-grid)" />
              <XAxis dataKey="label" {...axis} interval="preserveStartEnd" minTickGap={24} />
              <YAxis {...axis} allowDecimals={false} width={40} />
              <Tooltip
                cursor={{stroke: "var(--chart-ink)", strokeWidth: 1}}
                content={({active, payload}) => {
                  const row = active ? (payload?.[0]?.payload as Row | undefined) : undefined;
                  return row ? <Tip title={row.label} lines={[["Enrolments", row.total]]} /> : null;
                }}
              />
              <Line type="monotone" dataKey="total" stroke="var(--series-total)" strokeWidth={2} dot={false} activeDot={{r: 4}} isAnimationActive={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* The same numbers as a table, for screen readers. */}
      <table className="sr-only">
        <caption>Enrolments {PER[trend.bucket]}</caption>
        <thead>
          <tr>
            <th>From</th>
            <th>New in courses</th>
            <th>New in exam programs</th>
            <th>Of which paid</th>
            <th>To date</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.start}>
              <td>{r.label}</td>
              <td>{r.courses}</td>
              <td>{r.exam_programs}</td>
              <td>{r.paid}</td>
              <td>{r.total}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
