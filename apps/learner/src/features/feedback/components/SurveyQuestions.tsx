"use client";

import {ReactNode} from "react";
import {Icon} from "@mcc/ui";
import {
  addRank,
  blankRow,
  moveRank,
  Option,
  PairItem,
  Question,
  removeRank,
  ResultRow,
  toggleMulti,
} from "../helper/survey";

const chip = "rounded-lg border px-3 py-2 text-sm font-medium transition-colors";
const on = "border-primary bg-primary text-white";
const off = "border-muted/30 hover:border-primary/60";

export function QuestionShell({q, error, children}: {q: Question; error?: string; children: ReactNode}) {
  return (
    <section className="mb-10" aria-labelledby={`q-${q.key}`}>
      <h2 id={`q-${q.key}`} className="text-xl font-semibold">{q.title}</h2>
      {q.help && <p className="mb-4 mt-1 text-sm text-subtle">{q.help}</p>}
      {!q.help && <div className="mb-3" />}
      {children}
      {error && <p role="alert" className="mt-3 text-sm text-red-500">{error}</p>}
    </section>
  );
}

function BandPicker({label, bands, value, onChange}: {label: string; bands: Option[]; value: string; onChange: (v: string) => void}) {
  return (
    <div role="radiogroup" aria-label={label}>
      <p className="mb-1.5 text-xs font-medium text-subtle">{label}</p>
      <div className="grid grid-cols-4 gap-1.5 sm:grid-cols-7">
        {bands.map((b) => (
          <button key={String(b.value)} type="button" role="radio" aria-checked={value === b.value} onClick={() => onChange(String(b.value))} className={`${chip} px-1 text-xs ${value === b.value ? on : off}`}>
            {b.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function Results({q, value, onChange}: {q: Extract<Question, {kind: "results"}>; value: ResultRow[]; onChange: (v: ResultRow[]) => void}) {
  const rows = value.length > 0 ? value : [blankRow()];
  const update = (i: number, patch: Partial<ResultRow>) => onChange(rows.map((r, j) => (j === i ? {...r, ...patch} : r)));
  const listId = `subjects-${q.key}`;

  return (
    <div className="flex flex-col gap-4">
      <datalist id={listId}>{q.subjects.map((s) => <option key={s} value={s} />)}</datalist>
      {rows.map((row, i) => (
        <div key={i} className="rounded-2xl border border-muted/25 p-4">
          <div className="mb-3 flex items-center gap-3">
            <input
              list={listId}
              value={row.subject}
              onChange={(e) => update(i, {subject: e.target.value})}
              placeholder="Subject (choose or type)"
              aria-label={`Subject ${i + 1}`}
              maxLength={100}
              className="min-w-0 flex-1 rounded-lg border border-muted/30 bg-background px-3 py-2 text-base font-medium outline-none focus:border-primary"
            />
            {rows.length > 1 && (
              <button type="button" onClick={() => onChange(rows.filter((_, j) => j !== i))} aria-label={`Remove subject ${i + 1}`} className="text-subtle hover:text-red-500">
                <Icon icon="lucide:x" size={18} />
              </button>
            )}
          </div>
          <div role="radiogroup" aria-label="Exam" className="mb-3 flex flex-wrap gap-1.5">
            {q.exams.map((e) => (
              <button key={String(e.value)} type="button" role="radio" aria-checked={row.exam === e.value} onClick={() => update(i, {exam: String(e.value)})} className={`${chip} ${row.exam === e.value ? on : off}`}>
                {e.label}
              </button>
            ))}
          </div>
          <div className="grid gap-3">
            <BandPicker label={q.before_label} bands={q.bands} value={row.before} onChange={(v) => update(i, {before: v})} />
            <BandPicker label={q.after_label} bands={q.bands} value={row.after} onChange={(v) => update(i, {after: v})} />
          </div>
        </div>
      ))}
      {rows.length < q.max_rows && (
        <button type="button" onClick={() => onChange([...rows, blankRow()])} className="flex w-fit items-center gap-2 rounded-lg border border-dashed border-muted/40 px-4 py-2 text-sm font-medium text-subtle hover:border-primary hover:text-primary">
          <Icon icon="lucide:plus" size={16} /> Add another subject
        </button>
      )}
    </div>
  );
}

function Choice({selected, onClick, children, multi = false}: {selected: boolean; onClick: () => void; children: ReactNode; multi?: boolean}) {
  return (
    <button
      type="button"
      role={multi ? "checkbox" : "radio"}
      aria-checked={selected}
      onClick={onClick}
      className={`flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left text-sm transition-colors ${selected ? "border-primary bg-primary/5" : "border-muted/30 hover:border-primary/50"}`}
    >
      <span className={`flex h-5 w-5 shrink-0 items-center justify-center border ${multi ? "rounded-md" : "rounded-full"} ${selected ? "border-primary bg-primary text-white" : "border-muted/50"}`}>
        {selected && <Icon icon="lucide:check" size={12} />}
      </span>
      {children}
    </button>
  );
}

function Scale({options, value, onChange}: {options: Option[]; value: number | undefined; onChange: (v: number) => void}) {
  return (
    <div>
      <div role="radiogroup" className="grid grid-cols-5 gap-2">
        {options.map((o) => (
          <button key={String(o.value)} type="button" role="radio" aria-checked={value === o.value} onClick={() => onChange(Number(o.value))} className={`${chip} py-3 text-base ${value === o.value ? on : off}`}>
            {String(o.value)}
          </button>
        ))}
      </div>
      <div className="mt-1.5 flex justify-between text-xs text-subtle">
        <span>{options[0]?.label}</span>
        <span>{options[options.length - 1]?.label}</span>
      </div>
    </div>
  );
}

function PairRow({item, label, value, onChange}: {item: PairItem; label: string; value: number | undefined; onChange: (v: number) => void}) {
  return (
    <div className="mb-3">
      <p className="mb-1.5 text-sm font-medium">{label}</p>
      <div role="radiogroup" aria-label={`${item.title}: ${label.toLowerCase()}`} className="grid grid-cols-5 gap-2">
        {item.options.map((o) => (
          <button key={String(o.value)} type="button" role="radio" aria-checked={value === o.value} onClick={() => onChange(Number(o.value))} className={`flex flex-col items-center rounded-xl border py-2.5 text-lg transition-colors ${value === o.value ? "border-primary bg-primary/10" : "border-muted/30 hover:border-primary/50"}`}>
            <span>{item.style === "emoji" ? o.emoji : String(o.value)}</span>
            {item.style === "emoji" && <span className="mt-0.5 text-[11px] text-subtle">{o.label}</span>}
          </button>
        ))}
      </div>
      {item.style === "number" && (
        <div className="mt-1 flex justify-between text-xs text-subtle">
          <span>{item.low_label}</span>
          <span>{item.high_label}</span>
        </div>
      )}
    </div>
  );
}

function Pairs({q, value, onChange}: {q: Extract<Question, {kind: "pairs"}>; value: Record<string, {before?: number; after?: number}>; onChange: (v: Record<string, {before?: number; after?: number}>) => void}) {
  const set = (key: string, side: "before" | "after", v: number) => onChange({...value, [key]: {...value[key], [side]: v}});
  return (
    <div className="flex flex-col gap-5">
      {q.items.map((item) => (
        <div key={item.key} className="rounded-2xl border border-muted/25 p-4">
          <h3 className="text-base font-semibold">{item.title}</h3>
          {item.help && <p className="mb-3 text-xs text-subtle">{item.help}</p>}
          <PairRow item={item} label="Before" value={value[item.key]?.before} onChange={(v) => set(item.key, "before", v)} />
          <PairRow item={item} label="After" value={value[item.key]?.after} onChange={(v) => set(item.key, "after", v)} />
        </div>
      ))}
    </div>
  );
}

function Rank({q, value, onChange}: {q: Extract<Question, {kind: "rank"}>; value: string[]; onChange: (v: string[]) => void}) {
  const label = (v: string) => q.options.find((o) => o.value === v)?.label ?? v;
  const left = q.max - value.length;
  return (
    <div>
      <ol className="mb-3 flex min-h-16 flex-col gap-2 rounded-2xl border border-dashed border-muted/40 p-3" aria-label="Your ranking">
        {value.length === 0 && <li className="py-2 text-center text-xs text-subtle">Pick features below. They'll show up here in rank order.</li>}
        {value.map((v, i) => (
          <li key={v} className="flex items-center gap-2 rounded-lg bg-primary/5 px-3 py-2 text-sm">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">{i + 1}</span>
            <span className="flex-1">{label(v)}</span>
            <button type="button" onClick={() => onChange(moveRank(value, i, -1))} disabled={i === 0} aria-label={`Move ${label(v)} up`} className="p-1 text-subtle disabled:opacity-30"><Icon icon="lucide:chevron-up" size={16} /></button>
            <button type="button" onClick={() => onChange(moveRank(value, i, 1))} disabled={i === value.length - 1} aria-label={`Move ${label(v)} down`} className="p-1 text-subtle disabled:opacity-30"><Icon icon="lucide:chevron-down" size={16} /></button>
            <button type="button" onClick={() => onChange(removeRank(value, v))} aria-label={`Remove ${label(v)}`} className="p-1 text-subtle hover:text-red-500"><Icon icon="lucide:x" size={16} /></button>
          </li>
        ))}
      </ol>
      <p className="mb-2 text-xs text-subtle">Tap to add ({left} left).</p>
      <div className="flex flex-wrap gap-2">
        {q.options.filter((o) => !value.includes(String(o.value))).map((o) => (
          <button key={String(o.value)} type="button" disabled={left <= 0} onClick={() => onChange(addRank(value, String(o.value), q.max))} className="rounded-full border border-muted/40 px-3.5 py-1.5 text-sm transition-colors hover:border-primary disabled:opacity-40">
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}

/** One question of the survey, whatever its kind. `value` and `onChange` carry that kind's answer shape. */
export function QuestionField({q, value, onChange}: {q: Question; value: unknown; onChange: (v: unknown) => void}) {
  switch (q.kind) {
    case "results":
      return <Results q={q} value={(value as ResultRow[]) ?? []} onChange={onChange} />;
    case "scale":
      return <Scale options={q.options} value={value as number | undefined} onChange={onChange} />;
    case "single":
      return (
        <div className="flex flex-col gap-2" role="radiogroup" aria-labelledby={`q-${q.key}`}>
          {q.options.map((o) => <Choice key={String(o.value)} selected={value === o.value} onClick={() => onChange(o.value)}>{o.label}</Choice>)}
        </div>
      );
    case "multi": {
      const list = (value as string[]) ?? [];
      return (
        <div className="grid gap-2 sm:grid-cols-2" role="group" aria-labelledby={`q-${q.key}`}>
          {q.options.map((o) => (
            <Choice key={String(o.value)} multi selected={list.includes(String(o.value))} onClick={() => onChange(toggleMulti(list, String(o.value)))}>{o.label}</Choice>
          ))}
        </div>
      );
    }
    case "pairs":
      return <Pairs q={q} value={(value as Record<string, {before?: number; after?: number}>) ?? {}} onChange={onChange} />;
    case "rank":
      return <Rank q={q} value={(value as string[]) ?? []} onChange={onChange} />;
    case "text":
      return (
        <textarea
          value={(value as string) ?? ""}
          onChange={(e) => onChange(e.target.value)}
          maxLength={q.max_length}
          rows={4}
          placeholder="Optional"
          aria-labelledby={`q-${q.key}`}
          className="w-full resize-y rounded-xl border border-muted/30 bg-background px-4 py-3 text-base outline-none focus:border-primary"
        />
      );
  }
}
