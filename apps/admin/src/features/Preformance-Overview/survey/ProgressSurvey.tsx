"use client";

import {ReactNode, useState} from "react";
import {
  GroupSummary,
  Option,
  PairItem,
  QuestionSummary,
  RankOption,
} from "./survey.service";
import {useSurveyComments, useSurveyResults} from "./useSurvey";
import {bandLabel, barWidth, Band, changeStyle, shortDate, signed} from "./surveyView";

function Card({title, help, answered, children}: {title: string; help?: string | null; answered?: number; children: ReactNode}) {
  return (
    <section className="rounded-2xl border border-neutral-100 bg-white p-6 shadow-sm">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-2">
        <div>
          <h3 className="text-base font-semibold text-neutral-900">{title}</h3>
          {help && <p className="mt-0.5 text-sm text-neutral-500">{help}</p>}
        </div>
        {answered !== undefined && <span className="rounded-full bg-neutral-100 px-2.5 py-1 text-xs text-neutral-500">{answered} answered</span>}
      </div>
      {children}
    </section>
  );
}

function Bar({label, value, max, trailing, tone = "bg-violet-500"}: {label: string; value: number; max: number; trailing: string; tone?: string}) {
  return (
    <div className="grid grid-cols-[minmax(8rem,14rem)_1fr_auto] items-center gap-3 py-1.5 text-sm">
      <span className="truncate text-neutral-700" title={label}>{label}</span>
      <div className="h-2.5 overflow-hidden rounded-full bg-neutral-100" role="presentation">
        <div className={`h-full rounded-full ${tone}`} style={{width: `${barWidth(value, max)}%`}} />
      </div>
      <span className="w-24 text-right text-xs tabular-nums text-neutral-500">{trailing}</span>
    </div>
  );
}

function Choices({options}: {options: Option[]}) {
  const max = Math.max(...options.map((o) => o.count), 0);
  return (
    <div>
      {options.map((o) => (
        <Bar key={String(o.value)} label={o.label} value={o.count} max={max} trailing={`${o.count} · ${o.percent}%`} />
      ))}
    </div>
  );
}

function Ranking({options}: {options: RankOption[]}) {
  const max = Math.max(...options.map((o) => o.points), 0);
  return (
    <div>
      {options.map((o) => (
        <Bar key={o.value} label={o.label} value={o.points} max={max} tone="bg-emerald-500" trailing={`${o.points} pts · ${o.first_choice} first`} />
      ))}
      <p className="mt-2 text-xs text-neutral-400">Points: 5 for a first pick down to 1 for a fifth. &ldquo;First&rdquo; counts how many put it top.</p>
    </div>
  );
}

function Delta({value}: {value: number | null}) {
  return <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${changeStyle(value)}`}>{signed(value)}</span>;
}

function Pairs({items}: {items: PairItem[]}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {items.map((item) => (
        <div key={item.key} className="rounded-xl border border-neutral-100 p-4">
          <div className="mb-2 flex items-center justify-between gap-2">
            <p className="text-sm font-medium text-neutral-800">{item.title}</p>
            <Delta value={item.mean_change} />
          </div>
          <Bar label="Before" value={item.mean_before ?? 0} max={5} tone="bg-neutral-300" trailing={item.mean_before?.toFixed(1) ?? "—"} />
          <Bar label="After" value={item.mean_after ?? 0} max={5} trailing={item.mean_after?.toFixed(1) ?? "—"} />
          <p className="mt-1 text-xs text-neutral-400">{item.improved_percent}% rated themselves higher after · {item.n} answers</p>
        </div>
      ))}
    </div>
  );
}

function Tile({label, value, hint}: {label: string; value: string; hint?: string}) {
  return (
    <div className="rounded-xl bg-neutral-50 p-4">
      <p className="text-xs text-neutral-500">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-neutral-900">{value}</p>
      {hint && <p className="text-xs text-neutral-400">{hint}</p>}
    </div>
  );
}

function ResultsTable({rows, bands, firstColumn}: {rows: (GroupSummary & {name: string})[]; bands: Band[]; firstColumn: string}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[620px] text-left text-sm">
        <thead>
          <tr className="border-b border-neutral-100 text-xs uppercase tracking-wide text-neutral-500">
            <th className="py-2 pr-4 font-medium">{firstColumn}</th>
            <th className="py-2 pr-4 font-medium">Answers</th>
            <th className="py-2 pr-4 font-medium">Before</th>
            <th className="py-2 pr-4 font-medium">After</th>
            <th className="py-2 pr-4 font-medium">Change (bands)</th>
            <th className="py-2 font-medium">Improved / same / lower</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.name} className="border-b border-neutral-50">
              <td className="py-2.5 pr-4 font-medium text-neutral-800">{r.name}</td>
              <td className="py-2.5 pr-4 text-neutral-600">{r.n}</td>
              <td className="py-2.5 pr-4 text-neutral-600">{bandLabel(r.mean_before, bands)}</td>
              <td className="py-2.5 pr-4 text-neutral-600">{bandLabel(r.mean_after, bands)}</td>
              <td className="py-2.5 pr-4"><Delta value={r.mean_change_bands} /></td>
              <td className="py-2.5 text-neutral-600">{r.improved_percent}% / {r.same_percent}% / {r.declined_percent}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Comments() {
  const [page, setPage] = useState(1);
  const comments = useSurveyComments(page);
  return (
    <Card title="In their own words" help="The free-text answers, newest first." answered={comments.data?.total}>
      {comments.isLoading && <p className="text-sm text-neutral-400">Loading…</p>}
      {comments.data && comments.data.comments.length === 0 && <p className="text-sm text-neutral-400">No comments yet.</p>}
      <ul className="divide-y divide-neutral-100">
        {comments.data?.comments.map((c) => (
          <li key={c.response_id} className="py-3">
            <p className="whitespace-pre-wrap text-sm text-neutral-800">{c.comment}</p>
            <p className="mt-1 text-xs text-neutral-400">{c.full_name || c.email || "A student"} · {shortDate(c.created_at)}</p>
          </li>
        ))}
      </ul>
      {comments.data && comments.data.pages > 1 && (
        <div className="mt-3 flex items-center justify-between text-sm text-neutral-600">
          <button type="button" disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="rounded-lg border border-neutral-200 px-3 py-1.5 disabled:opacity-40">Previous</button>
          <span>Page {comments.data.page} of {comments.data.pages}</span>
          <button type="button" disabled={page >= comments.data.pages} onClick={() => setPage((p) => p + 1)} className="rounded-lg border border-neutral-200 px-3 py-1.5 disabled:opacity-40">Next</button>
        </div>
      )}
    </Card>
  );
}

function Question({q}: {q: QuestionSummary}) {
  switch (q.kind) {
    case "results": {
      const {overall, bands} = q.data;
      return (
        <Card title="Score changes" help="Each answer is one subject and exam, with the score band before and after MCC." answered={q.answered}>
          {overall ? (
            <>
              <div className="mb-5 grid gap-3 sm:grid-cols-4">
                <Tile label="Subject results" value={String(overall.n)} />
                <Tile label="Improved" value={`${overall.improved_percent}%`} hint={`${overall.same_percent}% same · ${overall.declined_percent}% lower`} />
                <Tile label="Average before" value={bandLabel(overall.mean_before, bands)} />
                <Tile label="Average after" value={bandLabel(overall.mean_after, bands)} hint={`${signed(overall.mean_change_bands)} bands`} />
              </div>
              <h4 className="mb-2 text-sm font-semibold text-neutral-800">By subject</h4>
              <ResultsTable rows={q.data.by_subject.map((s) => ({...s, name: s.subject}))} bands={bands} firstColumn="Subject" />
              <h4 className="mb-2 mt-6 text-sm font-semibold text-neutral-800">By exam</h4>
              <ResultsTable rows={q.data.by_exam.map((s) => ({...s, name: s.label}))} bands={bands} firstColumn="Exam" />
            </>
          ) : (
            <p className="text-sm text-neutral-400">No answers yet.</p>
          )}
        </Card>
      );
    }
    case "pairs":
      return <Card title={q.title} help={q.help} answered={q.answered}><Pairs items={q.data.items} /></Card>;
    case "single":
    case "multi":
      return <Card title={q.title} help={q.help} answered={q.answered}><Choices options={q.data.options} /></Card>;
    case "scale":
      return (
        <Card title={q.title} help={q.help} answered={q.answered}>
          <Choices options={q.data.options} />
          <p className="mt-2 text-xs text-neutral-500">Average: {q.data.mean?.toFixed(1) ?? "—"} out of 5</p>
        </Card>
      );
    case "rank":
      return <Card title={q.title} help={q.help} answered={q.answered}><Ranking options={q.data.options} /></Card>;
    case "text":
      return <Comments />;
    default:
      return null;
  }
}

/** What students said in the progress survey: score changes, before/after ratings, choices, ranked features and comments. */
export default function ProgressSurvey() {
  const results = useSurveyResults();

  if (results.isLoading) return <p className="py-10 text-center text-sm text-neutral-400">Loading survey results…</p>;
  if (results.isError || !results.data) return <p className="py-10 text-center text-sm text-red-500">Couldn&apos;t load the survey results. Please try again.</p>;
  const data = results.data;

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-neutral-100 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-neutral-900">{data.title}</h2>
        <p className="mt-1 text-sm text-neutral-500">
          What students say about their results and what helped. Students open it from the menu beside their picture.
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <Tile label="Responses" value={String(data.responses)} />
          <Tile label="First response" value={shortDate(data.first_response_at)} />
          <Tile label="Latest response" value={shortDate(data.last_response_at)} />
        </div>
      </section>

      {data.responses === 0 ? (
        <p className="rounded-2xl border border-dashed border-neutral-200 bg-white py-12 text-center text-sm text-neutral-400">
          No one has answered yet. Results appear here as students submit.
        </p>
      ) : (
        data.questions.map((q) => <Question key={q.key} q={q} />)
      )}
    </div>
  );
}
