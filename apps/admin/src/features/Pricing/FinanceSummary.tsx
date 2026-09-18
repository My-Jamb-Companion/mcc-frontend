"use client";

import Link from "next/link";
import {useMemo, useState} from "react";
import {useQuery} from "@tanstack/react-query";
import {Icon} from "@mcc/ui";
import PricingNav from "./components/PricingNav";
import {financeRows, periods} from "./helper/financeRows";
import {getFinanceSummary} from "./services/finance.service";
import {pricingErrorMessage} from "./services/pricing.service";

const NGN = new Intl.NumberFormat("en-NG", {minimumFractionDigits: 2, maximumFractionDigits: 2});
const naira = (v: string | number) => {
  const n = Number(v);
  return `${n < 0 ? "−" : ""}₦${NGN.format(Math.abs(n))}`;
};

/**
 * Pricing model build step 5 -- where the money went in a period, summed from
 * the breakdown each checkout recorded rather than recalculated from today's
 * prices.
 */
export default function FinanceSummary() {
  const quick = useMemo(() => periods(new Date()), []);
  const [range, setRange] = useState<[string, string]>(quick["This month"]);
  const valid = Boolean(range[0] && range[1] && range[0] <= range[1]);

  const {data, isLoading, isError, error, refetch, isFetching} = useQuery({
    queryKey: ["admin", "pricing", "finance-summary", range[0], range[1]],
    queryFn: () => getFinanceSummary(range[0], range[1]),
    enabled: valid,
  });

  const rows = data ? financeRows(data.published_sales, data.published_refunds) : [];
  const input = "rounded-lg border border-neutral-200 px-3 py-2 text-base text-neutral-900 outline-none focus:border-violet-500";

  return (
    <section className="flex flex-col gap-6 pb-10">
      <div className="flex flex-col gap-4">
        <div>
          <Link href="/finance" className="inline-flex items-center gap-1 text-sm text-neutral-500 hover:text-neutral-800">
            <Icon icon="ph:arrow-left" size={14} />
            Finance
          </Link>
          <h1 className="mt-2 text-3xl font-bold text-neutral-900">Finance summary</h1>
          <p className="mt-1 max-w-2xl text-base text-neutral-700">
            Where students&apos; payments went, summed from the breakdown recorded at each checkout. Sales count on the
            day they settled and refunds on the day they were refunded, so VAT to remit is already net of refunds.
          </p>
        </div>
        <PricingNav />
      </div>

      <div className="flex flex-wrap items-end gap-3 rounded-2xl border border-neutral-100 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-1">
          <label htmlFor="finance-from" className="text-sm font-medium text-neutral-700">From</label>
          <input id="finance-from" type="date" value={range[0]} max={range[1]} className={input}
            onChange={(e) => setRange([e.target.value, range[1]])} />
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="finance-to" className="text-sm font-medium text-neutral-700">To</label>
          <input id="finance-to" type="date" value={range[1]} min={range[0]} className={input}
            onChange={(e) => setRange([range[0], e.target.value])} />
        </div>
        <div className="flex flex-wrap gap-2">
          {Object.entries(quick).map(([label, value]) => (
            <button key={label} type="button" onClick={() => setRange(value)}
              aria-pressed={range[0] === value[0] && range[1] === value[1]}
              className={`rounded-full border px-3 py-1.5 text-sm font-medium ${
                range[0] === value[0] && range[1] === value[1]
                  ? "border-violet-600 bg-violet-50 text-violet-700"
                  : "border-neutral-200 text-neutral-700 hover:bg-neutral-50"}`}>
              {label}
            </button>
          ))}
        </div>
        {!valid && <p className="basis-full text-sm text-red-600">Choose a start date on or before the end date.</p>}
      </div>

      {isLoading ? (
        <p className="text-base text-neutral-600">Adding up the period…</p>
      ) : isError || !data ? (
        valid && (
          <p className="text-base text-red-600">
            {pricingErrorMessage(error, "Couldn't load the finance summary.")}{" "}
            <button type="button" onClick={() => refetch()} className="font-semibold underline">Try again</button>
          </p>
        )
      ) : (
        <div className={`flex flex-col gap-6 transition-opacity ${isFetching ? "opacity-60" : ""}`}>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <Card label="VAT to remit" value={naira(data.vat_payable)} note="On published-price sales, less refunds" />
            <Card label="Published-price sales" value={naira(data.published_sales.amount)}
              note={`${data.published_sales.count} sale${data.published_sales.count === 1 ? "" : "s"} · ${data.published_refunds.count} refunded`} />
            <Card label="Teacher pay for sessions" value={naira(Number(data.session_pay.credited) - Number(data.session_pay.reversed))}
              note={`${data.session_pay.credits} session credit${data.session_pay.credits === 1 ? "" : "s"}${Number(data.session_pay.reversed) > 0 ? `, ${naira(data.session_pay.reversed)} undone` : ""}`} />
            <Card label="Teacher pay still owed" value={naira(data.teaching_owed.amount)}
              note={`${data.teaching_owed.sessions} undelivered session${data.teaching_owed.sessions === 1 ? "" : "s"} across ${data.teaching_owed.enrolments} enrolment${data.teaching_owed.enrolments === 1 ? "" : "s"}, as of now`} />
          </div>

          <div className="rounded-2xl border border-neutral-100 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-neutral-900">Published-price sales</h2>
            <p className="mt-1 text-base text-neutral-700">Each checkout&apos;s recorded split of what the student paid.</p>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[560px] text-left text-base">
                <thead>
                  <tr className="border-b border-neutral-100 text-sm uppercase tracking-wide text-neutral-600">
                    <th className="pb-2 pr-3 font-medium">Bucket</th>
                    <th className="pb-2 pr-3 text-right font-medium">Sales</th>
                    <th className="pb-2 pr-3 text-right font-medium">Refunds</th>
                    <th className="pb-2 text-right font-medium">Net</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-50">
                  {rows.map((r) => (
                    <tr key={r.key} className={r.key === "amount" || r.key === "profit_before_tax" ? "font-semibold" : ""}>
                      <td className="py-2 pr-3 text-neutral-900">{r.label}</td>
                      <td className="py-2 pr-3 text-right tabular-nums text-neutral-800">{naira(r.sales)}</td>
                      <td className="py-2 pr-3 text-right tabular-nums text-neutral-700">{r.refunds ? naira(-r.refunds) : "—"}</td>
                      <td className="py-2 text-right tabular-nums text-neutral-900">{naira(r.net)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-2xl border border-neutral-100 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-bold text-neutral-900">Sales at old flat prices</h2>
              <p className="mt-1 text-base text-neutral-700">
                Programs not yet published. No breakdown was recorded; the course&apos;s teacher was paid the legacy
                share when each sale settled.
              </p>
              <dl className="mt-4 grid grid-cols-3 gap-3 text-base">
                <Figure label="Sales" value={`${data.legacy_sales.count}`} />
                <Figure label="Paid by students" value={naira(data.legacy_sales.amount)} />
                <Figure label="Teacher share" value={naira(data.legacy_sales.teacher_share)} />
                <Figure label="Refunded" value={`${data.legacy_refunds.count}`} />
                <Figure label="Refunded amount" value={naira(data.legacy_refunds.amount)} />
                <Figure label="Share reversed" value={naira(data.legacy_refunds.teacher_share)} />
              </dl>
            </div>
            <div className="rounded-2xl border border-neutral-100 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-bold text-neutral-900">Gems purchases</h2>
              <p className="mt-1 text-base text-neutral-700">Gem top-ups aren&apos;t priced by the pricing model, so they have no breakdown.</p>
              <dl className="mt-4 grid grid-cols-2 gap-3 text-base">
                <Figure label="Purchases" value={`${data.gems_sales.count}`} />
                <Figure label="Paid" value={naira(data.gems_sales.amount)} />
              </dl>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

function Card({label, value, note}: {label: string; value: string; note: string}) {
  return (
    <div className="rounded-2xl border border-neutral-100 bg-white p-5 shadow-sm">
      <p className="text-sm font-medium text-neutral-700">{label}</p>
      <p className="mt-1 text-2xl font-bold tabular-nums text-neutral-900">{value}</p>
      <p className="mt-1 text-sm text-neutral-600">{note}</p>
    </div>
  );
}

function Figure({label, value}: {label: string; value: string}) {
  return (
    <div>
      <dt className="text-sm text-neutral-700">{label}</dt>
      <dd className="font-semibold tabular-nums text-neutral-900">{value}</dd>
    </div>
  );
}
