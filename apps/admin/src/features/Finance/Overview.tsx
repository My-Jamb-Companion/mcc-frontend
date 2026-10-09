"use client";

import {useState} from "react";
import {CreditCard, Landmark} from "lucide-react";
import {useFinanceOverview} from "./hooks/useFinance";
import {OverviewPeriod} from "./services/finance.service";
import {PERIOD_OPTIONS, toOverviewCards} from "./helper/overview";

function Card({title, children}: {title: string; children: React.ReactNode}) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col justify-between">
      <h3 className="text-gray-900 font-semibold text-base mb-6">{title}</h3>
      {children}
    </div>
  );
}

function Headline({label, value}: {label: string; value: string}) {
  return (
    <div className="space-y-1">
      <p className="text-xs text-gray-500 font-medium">{label}</p>
      <span className="text-3xl font-extrabold text-gray-900 tracking-tight tabular-nums">{value}</span>
    </div>
  );
}

function Line({icon, label, value, tone = "good"}: {icon?: React.ReactNode; label: string; value: string; tone?: "good" | "muted"}) {
  return (
    <div className="inline-flex items-center gap-2 bg-gray-100/60 px-3 py-1.5 rounded-lg text-xs w-full">
      {icon}
      <span className="text-gray-600 font-medium">{label}</span>
      <span className={`font-bold ml-auto tabular-nums ${tone === "good" ? "text-emerald-600" : "text-gray-700"}`}>{value}</span>
    </div>
  );
}

function Pair({label, value, accent}: {label: string; value: string; accent: string}) {
  return (
    <div className={`border-l-2 ${accent} pl-3 space-y-1`}>
      <p className="text-xs text-gray-500 font-medium">{label}</p>
      <p className="text-lg font-bold text-gray-900 tabular-nums">{value}</p>
    </div>
  );
}

/** The three headline cards: money collected, where it came from, and what teachers earned and are owed. */
export default function FinancialOverview() {
  const [period, setPeriod] = useState<OverviewPeriod>("this_month");
  const {data, isLoading, isError, refetch} = useFinanceOverview(period);
  const cards = data ? toOverviewCards(data) : null;

  return (
    <div>
      <div className="mb-4 flex items-center justify-between gap-3">
        <p className="text-sm text-gray-500">
          Real figures from payments and the teacher earnings ledger. VAT is included in what students paid.
        </p>
        <select
          aria-label="Period"
          value={period}
          onChange={(e) => setPeriod(e.target.value as OverviewPeriod)}
          className="rounded-full border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-700 outline-none focus:border-violet-500"
        >
          {PERIOD_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>

      {isError ? (
        <p className="rounded-2xl border border-red-100 bg-red-50 p-4 text-sm text-red-700">
          The finance figures couldn&apos;t be loaded.{" "}
          <button type="button" onClick={() => refetch()} className="font-semibold underline">Try again</button>
        </p>
      ) : (
        <div className={`grid grid-cols-1 md:grid-cols-3 gap-6 ${isLoading ? "opacity-60" : ""}`} aria-busy={isLoading}>
          <Card title="Money collected">
            <Headline label={`From ${cards?.collected.payments ?? 0} payment${cards?.collected.payments === 1 ? "" : "s"}`} value={cards?.collected.total ?? "—"} />
            <div className="space-y-2 pt-4">
              <Line icon={<CreditCard className="w-4 h-4 text-gray-500 shrink-0" />} label="By card" value={cards?.collected.card ?? "—"} />
              <Line icon={<Landmark className="w-4 h-4 text-gray-500 shrink-0" />} label="By bank transfer" value={cards?.collected.transfer ?? "—"} />
              {cards?.collected.other && <Line label="Other or not recorded" value={cards.collected.other} tone="muted" />}
              {cards?.collected.refunded && <Line label="Refunded in this period" value={cards.collected.refunded} tone="muted" />}
            </div>
          </Card>

          <Card title="Where it came from">
            <Headline label="Left for MCC after teachers' share" value={cards?.income.leftForMcc ?? "—"} />
            <div className="grid grid-cols-3 gap-3 pt-4 border-t border-gray-50 mt-4">
              <Pair label="Courses" value={cards?.income.course ?? "—"} accent="border-indigo-600" />
              <Pair label="Exam prep" value={cards?.income.exam ?? "—"} accent="border-blue-500" />
              <Pair label="Gems" value={cards?.income.gems ?? "—"} accent="border-sky-400" />
            </div>
            <p className="pt-3 text-[11px] text-gray-400">Before VAT, payment fees and costs.</p>
          </Card>

          <Card title="Teachers">
            <Headline label="Earned in this period" value={cards?.teachers.earned ?? "—"} />
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-50 mt-4">
              <Pair label="Paid out" value={cards?.teachers.paidOut ?? "—"} accent="border-blue-500" />
              <Pair label="Owed right now" value={cards?.teachers.owed ?? "—"} accent="border-indigo-600" />
            </div>
            {cards?.teachers.pending && (
              <p className="pt-3 text-xs text-amber-700">{cards.teachers.pending} in payout requests waiting for approval.</p>
            )}
          </Card>
        </div>
      )}
    </div>
  );
}
